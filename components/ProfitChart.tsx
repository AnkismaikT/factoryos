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

export default function ProfitChart({ data }: { data: any[] }) {

return (

<ResponsiveContainer width="100%" height={320}>

<LineChart data={data}>

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

<Line
type="monotone"
dataKey="profit"
stroke="#3b82f6"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

);

}
