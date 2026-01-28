"use client";
import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Plus } from 'lucide-react';

const socket = io();

export default function Home() {
  const [columns, setColumns] = useState<any>(null);

  useEffect(() => {
    // 1. Initial fetch for Incognito/New tabs
    fetch("/api/get-board")
      .then((res) => res.json())
      .then((data) => setColumns(data));

    // 2. Real-time listener
    socket.on("board-updated", (newColumns) => {
      setColumns(newColumns);
    });

    return () => { socket.off("board-updated"); };
  }, []);

  const saveAndSync = (newCols: any) => {
    setColumns(newCols);
    socket.emit("update-board", newCols);
  };

  if (!columns) return <div className="min-h-screen bg-[#020617] text-white p-10 font-sans">Syncing...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-[#94a3b8] font-sans p-8">
      <div className="flex items-center gap-3 mb-12 border-b border-gray-800 pb-6">
        <div className="bg-blue-600 p-1 rounded">
          <div className="w-5 h-5 border-2 border-white"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">SYNCROBOARD <span className="text-gray-500 font-normal ml-2">V2.0</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([colId, col]: any) => (
          <div key={colId} className="bg-[#0b1120] border border-gray-800 rounded-xl p-6 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{col.title}</h2>
              <button 
                onClick={() => {
                   const content = prompt("Enter Task:");
                   if (!content) return;
                   const newCols = { ...columns };
                   newCols[colId].items.push({ id: uuidv4(), content });
                   saveAndSync(newCols);
                }}
                className="hover:text-white transition-colors"><Plus size={18} /></button>
            </div>
            <div className="space-y-3">
              {col.items.map((item: any) => (
                <div key={item.id} className="bg-[#1e293b] border border-gray-700 p-4 rounded-lg text-gray-200 shadow-sm">
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
