"use client"

import { useEffect, useState } from "react"

export default function SystemHealth() {

  const [data, setData] = useState<any>(null)

  async function loadData() {
    try {
      const res = await fetch("/api/dashboard/analytics")
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!data) {
    return (
      <div style={{padding:"40px",color:"white",background:"#0f172a",minHeight:"100vh"}}>
        Loading dashboard...
      </div>
    )
  }

  return (

    <div style={{
      padding:"40px",
      background:"#0f172a",
      color:"white",
      minHeight:"100vh"
    }}>

      <h1 style={{fontSize:"28px",marginBottom:"30px"}}>
        FactoryOS Dashboard
      </h1>

      <button
        onClick={loadData}
        style={{
          marginBottom:"20px",
          padding:"8px 16px",
          background:"#4f46e5",
          border:"none",
          borderRadius:"6px",
          color:"white",
          cursor:"pointer"
        }}
      >
        Refresh
      </button>


      <table style={{
        width:"600px",
        borderCollapse:"collapse",
        background:"#020617"
      }}>

        <thead>
          <tr>
            <th style={cellHeader}>Metric</th>
            <th style={cellHeader}>Value</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td style={cell}>Total Output</td>
            <td style={cell}>{data.output} Tons</td>
          </tr>

          <tr>
            <td style={cell}>Raw Material Used</td>
            <td style={cell}>{data.raw} Tons</td>
          </tr>

          <tr>
            <td style={cell}>Waste Generated</td>
            <td style={cell}>{data.waste} Tons</td>
          </tr>

          <tr>
            <td style={cell}>Yield Efficiency</td>
            <td style={cell}>{data.yieldEfficiency}%</td>
          </tr>

          <tr>
            <td style={cell}>Raw Stock</td>
            <td style={cell}>{data.stock} Tons</td>
          </tr>

          <tr>
            <td style={cell}>Finished Goods</td>
            <td style={cell}>{data.finished} Tons</td>
          </tr>

        </tbody>

      </table>

    </div>

  )

}

const cellHeader = {
  border:"1px solid #334155",
  padding:"12px",
  textAlign:"left" as const,
  background:"#1e293b"
}

const cell = {
  border:"1px solid #334155",
  padding:"12px"
}
