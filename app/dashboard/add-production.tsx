"use client";

import { useState } from "react";

export default function AddProduction() {

  const [rawInput, setRawInput] = useState("");
  const [output, setOutput] = useState("");
  const [waste, setWaste] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/production/add", {
      method: "POST",
      body: JSON.stringify({
        rawInput,
        output,
        waste,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (data.error) {
      alert(data.error);
    } else {
      alert("Production added successfully");
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-10">

      <h2 className="text-xl font-semibold mb-4">
        Add Production Entry
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          placeholder="Raw Input (tons)"
          value={rawInput}
          onChange={(e)=>setRawInput(e.target.value)}
          className="w-full p-3 rounded bg-gray-800"
        />

        <input
          placeholder="Output (tons)"
          value={output}
          onChange={(e)=>setOutput(e.target.value)}
          className="w-full p-3 rounded bg-gray-800"
        />

        <input
          placeholder="Waste (tons)"
          value={waste}
          onChange={(e)=>setWaste(e.target.value)}
          className="w-full p-3 rounded bg-gray-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
        >
          {loading ? "Saving..." : "Add Entry"}
        </button>

      </form>
    </div>
  );
}
