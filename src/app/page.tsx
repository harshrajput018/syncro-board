"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io();

export default function Home() {
  const [columns, setColumns] = useState<any>(null);

  useEffect(() => {
    // Sync logic for Incognito/New tabs
    fetch("/api/get-board")
      .then((res) => res.json())
      .then((data) => setColumns(data));

    socket.on("board-updated", (newColumns) => {
      setColumns(newColumns);
    });

    return () => { socket.off("board-updated"); };
  }, []);

  const saveAndSync = (newCols: any) => {
    setColumns(newCols);
    socket.emit("update-board", newCols);
  };

  if (!columns) return <div className="min-h-screen bg-black text-white p-10">Loading Board...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Syncro Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([colId, col]: any) => (
          <div key={colId} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-lg min-h-[200px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">{col.title}</h2>
            <div className="space-y-3">
              {col.items.map((item: any) => (
                <div key={item.id} className="bg-[#262626] p-4 rounded-md border border-gray-700 shadow-sm">
                  {item.content}
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                const content = prompt("Enter task name:");
                if (!content) return;
                const newCols = { ...columns };
                newCols[colId as keyof typeof columns].items.push({ id: uuidv4(), content });
                saveAndSync(newCols);
              }}
              className="mt-6 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              + Add Task
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
