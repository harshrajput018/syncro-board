"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io(); // Auto-detects production URL

export default function Home() {
  const [columns, setColumns] = useState<any>(null);

  useEffect(() => {
    // 1. Initial data fetch karo jab tab khule
    fetch("/api/get-board")
      .then((res) => res.json())
      .then((data) => setColumns(data));

    // 2. Listen for real-time updates
    socket.on("board-updated", (newColumns) => {
      setColumns(newColumns);
    });

    return () => { socket.off("board-updated"); };
  }, []);

  const saveAndSync = (newCols: any) => {
    setColumns(newCols);
    socket.emit("update-board", newCols);
  };

  if (!columns) return <div className="p-10">Loading Board...</div>;

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">Syncro Board</h1>
      <div className="flex gap-4">
        {Object.entries(columns).map(([colId, col]: any) => (
          <div key={colId} className="bg-gray-100 p-4 rounded w-64">
            <h2 className="font-semibold mb-2">{col.title}</h2>
            {col.items.map((item: any) => (
              <div key={item.id} className="bg-white p-2 mb-2 shadow rounded">
                {item.content}
              </div>
            ))}
            <button 
              onClick={() => {
                const newCols = { ...columns };
                newCols[colId as keyof typeof columns].items.push({ id: uuidv4(), content: "New Task" });
                saveAndSync(newCols);
              }}
              className="mt-2 text-blue-500 text-sm"
            >
              + Add Task
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
