"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function YieldChart({ data }: { data: any[] }) {

  return (

    <ResponsiveContainer width="100%" height={300}>

      <LineChart data={data}>

        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

        <XAxis dataKey="date" stroke="#9CA3AF" />

        <YAxis stroke="#9CA3AF" domain={[70,100]} />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="yield"
          stroke="#22c55e"
          strokeWidth={3}
          dot={{ r:4 }}
        />

      </LineChart>

    </ResponsiveContainer>

  );

}
