"use client"

import { useEffect, useState } from "react"

export default function InventoryLedger() {

  const [data, setData] = useState([])

  useEffect(() => {

    async function loadData() {

      try {

        const res = await fetch("/api/inventory/ledger")
        const result = await res.json()

        setData(result)

      } catch (err) {

        console.error("Fetch error:", err)

      }

    }

    loadData()

  }, [])

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Inventory Ledger
      </h1>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th>Date</th>
            <th>Material</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>

          {data.map((row:any) => (
            <tr key={row.id}>
              <td>{row.date}</td>
              <td>{row.material}</td>
              <td>{row.type}</td>
              <td>{row.quantity}</td>
              <td>{row.balance}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}
