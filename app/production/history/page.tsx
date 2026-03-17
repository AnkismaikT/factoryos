"use client"

import { useEffect, useState } from "react"

export default function ProductionHistory() {

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    async function loadData() {

      try {

        const res = await fetch("/api/production/history")
        const result = await res.json()

        if (!res.ok) {
          throw new Error("API error")
        }

        setData(result)

      } catch (err:any) {

        console.error("Production history error:", err)
        setError("Failed to load production history")

      } finally {

        setLoading(false)

      }

    }

    loadData()

  }, [])


  function formatDate(date:string) {
    return new Date(date).toLocaleString()
  }


  return (

    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Production History
      </h1>

      {loading && (
        <p className="text-gray-500">Loading production data...</p>
      )}

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {!loading && !error && (

        <div className="overflow-x-auto">

          <table className="w-full border border-gray-300 rounded-lg">

            <thead className="bg-gray-100 text-left">

              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Product</th>
                <th className="p-3 border text-right">Produced Qty</th>
                <th className="p-3 border text-right">Raw Used</th>
                <th className="p-3 border text-right">Waste</th>
                <th className="p-3 border text-right">Yield %</th>
                <th className="p-3 border">Operator</th>
              </tr>

            </thead>

            <tbody>

              {data.length === 0 && (

                <tr>
                  <td colSpan={7} className="text-center p-6 text-gray-500">
                    No production records found
                  </td>
                </tr>

              )}

              {data.map((row:any) => (

                <tr
                  key={row.id}
                  className="hover:bg-gray-50"
                >

                  <td className="p-3 border">
                    {formatDate(row.date)}
                  </td>

                  <td className="p-3 border">
                    {row.product || "Tile Batch"}
                  </td>

                  <td className="p-3 border text-right font-semibold">
                    {row.output ?? row.quantity ?? 0}
                  </td>

                  <td className="p-3 border text-right">
                    {row.rawInput ?? row.raw_used ?? 0}
                  </td>

                  <td className="p-3 border text-right">
                    {row.waste ?? 0}
                  </td>

                  <td className="p-3 border text-right text-green-600 font-semibold">
                    {row.yield ?? 0}%
                  </td>

                  <td className="p-3 border">
                    {row.createdBy || row.operator || "Operator"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  )

}
