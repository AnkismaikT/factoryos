"use client";

import { useState } from "react";

export default function NewProductionPage() {
  const [rawInput, setRawInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawInput: Number(rawInput),
          output: Number(output),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess("Production recorded successfully");
      setRawInput("");
      setOutput("");
      setLoading(false);

    } catch (err) {
      setError("Unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          New Production Entry
        </h1>

        {error && (
          <p className="text-red-400 mb-4 text-sm text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 mb-4 text-sm text-center">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Raw Material Input (Tons)"
            required
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Output Produced (Tons)"
            required
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="w-full mb-6 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-semibold transition"
          >
            {loading ? "Saving..." : "Record Production"}
          </button>
        </form>
      </div>
    </div>
  );
}

