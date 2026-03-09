"use client";

import { useState } from "react";

export default function InventoryPage() {
  const [rawStock, setRawStock] = useState(100);
  const [finishedStock, setFinishedStock] = useState(50);

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        📦 Inventory Management
      </h1>

      <div style={{ display: "flex", gap: "40px" }}>
        
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h3>Raw Material Stock</h3>
          <p style={{ fontSize: "22px", fontWeight: "bold" }}>
            {rawStock} Tons
          </p>
          <button onClick={() => setRawStock(rawStock + 10)}>
            + Add 10
          </button>
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h3>Finished Goods Stock</h3>
          <p style={{ fontSize: "22px", fontWeight: "bold" }}>
            {finishedStock} Tons
          </p>
          <button onClick={() => setFinishedStock(finishedStock + 10)}>
            + Add 10
          </button>
        </div>

      </div>
    </div>
  );
}