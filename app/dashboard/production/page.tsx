"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductionPage() {
  const [productions, setProductions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function loadProduction() {
      try {
        const res = await fetch("/api/production");
        const data = await res.json();

        if (data.success) {
          setProductions(data.data);
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Failed to load production data");
      }
    }

    loadProduction();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🏭 Production Control Center</h1>
            <p className="text-gray-400">
              Monitor factory production batches and operational performance.
            </p>
          </div>

          <Link
            href="/dashboard/production/new"
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
          >
            + Start New Batch
          </Link>
        </div>

        {summary && (
          <div className="grid grid-cols-4 gap-6 mb-8">

            <div className="bg-gray-900 p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Raw Input</p>
              <h2 className="text-2xl font-bold">{summary.totalRaw}</h2>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Output</p>
              <h2 className="text-2xl font-bold">{summary.totalOutput}</h2>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Waste</p>
              <h2 className="text-2xl font-bold">{summary.totalWaste}</h2>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Yield</p>
              <h2 className="text-2xl font-bold">{summary.averageYield}%</h2>
            </div>

          </div>
        )}

        <div className="bg-gray-900 rounded-xl p-6">

          <h2 className="text-xl font-semibold mb-4">
            Production History
          </h2>

          <table className="w-full text-sm">

            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-3">Time</th>
                <th>Raw Input</th>
                <th>Output</th>
                <th>Waste</th>
                <th>Yield</th>
              </tr>
            </thead>

            <tbody>

              {productions.map((p) => (
                <tr key={p.id} className="border-b border-gray-800">
                  <td>{new Date(p.createdAt).toLocaleTimeString()}</td>
                  <td>{p.rawInput}</td>
                  <td>{p.output}</td>
                  <td>{p.waste}</td>
                  <td className="text-green-400">{p.yield.toFixed(2)}%</td>
                </tr>
              ))}

              {productions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No production recorded today
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}