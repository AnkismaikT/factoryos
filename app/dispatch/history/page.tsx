"use client"

import { useEffect, useState } from "react"

export default function DispatchHistory() {

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    async function loadData() {

      try {

        const res = await fetch("/api/dispatch/history")

        const result = await res.json()

        if (Array.isArray(result)) {

          setData(result)

        } else {

          console.error("API returned error:", result)
          setError("Failed to load dispatch history")
          setData([])

        }

      } catch (err) {

        console.error("Fetch error:", err)
        setError("Server connection failed")

      } finally {

        setLoading(false)

      }

    }

    loadData()

  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl">Loading dispatch history...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    )
  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Dispatch History
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border border-gray-200">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Dispatch Value</th>
            </tr>

          </thead>

          <tbody>

            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No dispatch records found
                </td>
              </tr>
            )}

            {data.map((row:any) => (

              <tr key={row.id} className="hover:bg-gray-50">

                <td className="p-2 border">
                  {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                </td>

                <td className="p-2 border">
                  {row.customer || "-"}
                </td>

                <td className="p-2 border">
                  {row.product || "-"}
                </td>

                <td className="p-2 border">
                  {row.quantity || 0}
                </td>

                <td className="p-2 border">
                  ₹{row.value || 0}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}
