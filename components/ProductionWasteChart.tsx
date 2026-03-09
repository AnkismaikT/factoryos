"use client";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
Legend
} from "recharts";

export default function ProductionWasteChart({ data }: { data: any[] }) {

return (

<ResponsiveContainer width="100%" height={320}>

<BarChart data={data}>

<CartesianGrid strokeDasharray="3 3" stroke="#374151"/>

<XAxis dataKey="date" stroke="#9CA3AF"/>

<YAxis stroke="#9CA3AF"/>

<Tooltip
contentStyle={{
background:"#111827",
border:"none",
borderRadius:"8px"
}}
/>

<Legend/>

<Bar dataKey="output" fill="#22c55e"/>

<Bar dataKey="waste" fill="#ef4444"/>

</BarChart>

</ResponsiveContainer>

);

}
