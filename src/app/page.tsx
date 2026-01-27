"use client";
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { io } from "socket.io-client";
import { Layout, GripVertical, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

let socket: any;

const initialData = {
  todo: { id: 'todo', title: 'To Do', items: [] },
  inProgress: { id: 'inProgress', title: 'In Progress', items: [] },
  done: { id: 'done', title: 'Done', items: [] },
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage first
    const savedData = localStorage.getItem('syncro-board-data');
    if (savedData) {
      setColumns(JSON.parse(savedData));
    }
    setIsLoaded(true);

    const socketInitializer = async () => {
      await fetch("/api/socket");
      socket = io({ path: "/api/socket" });

      socket.on("update-client", (data: any) => {
        setColumns(data);
        localStorage.setItem('syncro-board-data', JSON.stringify(data));
      });
    };
    socketInitializer();
    return () => { if(socket) socket.disconnect(); };
  }, []);

  const saveAndSync = (newColumns: any) => {
    setColumns(newColumns);
    localStorage.setItem('syncro-board-data', JSON.stringify(newColumns));
    if (socket) socket.emit("board-update", newColumns);
  };

  const addTask = (colId: string) => {
    const content = prompt("Enter task details:");
    if (!content) return;

    const newColumns = { ...columns };
    newColumns[colId as keyof typeof newColumns].items.push({ id: uuidv4(), content });
    saveAndSync(newColumns);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const newColumns = JSON.parse(JSON.stringify(columns));
    const [movedItem] = newColumns[source.droppableId].items.splice(source.index, 1);
    newColumns[destination.droppableId].items.splice(destination.index, 0, movedItem);
    
    saveAndSync(newColumns);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8">
      <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Layout className="text-blue-500" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">SyncroBoard <span className="text-slate-500 text-sm">v2.0</span></h1>
        </div>
        <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          STATUS: ONLINE // STORAGE: LOCAL
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto">
          {Object.values(columns).map((column: any) => (
            <div key={column.id} className="bg-slate-900/40 p-4 rounded-2xl min-w-[300px] border border-slate-800 flex flex-col">
              <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{column.title}</h2>
                <button 
                  onClick={() => addTask(column.id)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[400px]">
                    {column.items.map((item: any, index: number) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-slate-800/80 p-4 rounded-xl mb-3 border border-slate-700/50 hover:border-blue-500/50 flex items-center gap-3 group transition-all active:scale-95 shadow-lg"
                          >
                            <GripVertical size={14} className="text-slate-600 group-hover:text-blue-400" />
                            <span className="text-sm font-medium">{item.content}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
