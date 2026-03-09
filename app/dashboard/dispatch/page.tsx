"use client";

import { useEffect, useState } from "react";

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [customer, setCustomer] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  const fetchDispatches = async () => {
    const res = await fetch("/api/dispatch");
    const data = await res.json();
    if (data.success) {
      setDispatches(data.data);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const createDispatch = async () => {
    const res = await fetch("/api/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        quantity,
        pricePerUnit,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setCustomer("");
      setQuantity(0);
      setPricePerUnit(0);
      fetchDispatches();
    } else {
      alert(data.error);
    }
  };

  const approveDispatch = async (id: string) => {
    const res = await fetch("/api/dispatch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dispatchId: id,
        pricePerUnit,
      }),
    });

    const data = await res.json();
    if (data.success) {
      fetchDispatches();
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        🚚 Dispatch Management
      </h1>

      <div style={{ marginBottom: "30px" }}>
        <input
          placeholder="Customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Price per Unit"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(Number(e.target.value))}
        />
        <button onClick={createDispatch}>Create</button>
      </div>

      <div>
        {dispatches.map((d) => (
          <div key={d.id} style={{
            background: "white",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px"
          }}>
            <strong>{d.customer}</strong> — {d.quantity} Tons — {d.status}

            {d.status === "PENDING" && (
              <button
                style={{ marginLeft: "20px" }}
                onClick={() => approveDispatch(d.id)}
              >
                Approve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}