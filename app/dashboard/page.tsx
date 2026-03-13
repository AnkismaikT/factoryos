import ProductionWasteChart from "@/components/ProductionWasteChart";
import ProfitChart from "@/components/ProfitChart";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import YieldChart from "@/components/YieldChart";

export default async function DashboardPage() {

const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;

if (!token) redirect("/login");

let user;
let factoryId;

try {

const decoded: any = verifyToken(token);
factoryId = decoded.factoryId;

user = await prisma.user.findUnique({
where: { id: decoded.userId },
});

if (!user) redirect("/login");

} catch {
redirect("/login");
}

/* ===============================
TODAY SUMMARY
=============================== */

const today = new Date();
today.setHours(0,0,0,0);

const productionsToday = await prisma.production.findMany({
where:{
factoryId,
createdAt:{ gte: today }
}
});

const totalRaw = productionsToday.reduce((s,p)=> s+p.rawInput,0);
const totalOutput = productionsToday.reduce((s,p)=> s+p.output,0);
const totalWaste = productionsToday.reduce((s,p)=> s+p.waste,0);

const averageYield =
totalRaw > 0
? Number(((totalOutput/totalRaw)*100).toFixed(2))
: 0;

const isLowYield = averageYield < 85;

/* ===============================
PROFIT ENGINE
=============================== */

const RAW_COST_PER_TON = 3000;
const SELL_PRICE_PER_TON = 5000;

const totalRawCost = totalRaw * RAW_COST_PER_TON;
const totalRevenue = totalOutput * SELL_PRICE_PER_TON;
const grossProfit = totalRevenue - totalRawCost;

const profitMargin =
totalRevenue > 0
? Number(((grossProfit/totalRevenue)*100).toFixed(2))
: 0;

/* ===============================
INVENTORY
=============================== */

const inventory = await prisma.inventory.findUnique({
where:{ factoryId }
});

/* ===============================
OPERATIONAL ALERTS
=============================== */

const alerts:string[] = [];

if (averageYield < 85) {
alerts.push("⚠ Yield efficiency below safe threshold (85%)");
}

if (totalWaste > totalOutput * 0.15) {
alerts.push("⚠ Waste above acceptable limit (15%)");
}

if (inventory && inventory.rawStock < 50) {
alerts.push("⚠ Raw material stock running low");
}

/* ===============================
7 DAY TREND
=============================== */

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate()-6);
sevenDaysAgo.setHours(0,0,0,0);

const last7Days = await prisma.production.findMany({
where:{
factoryId,
createdAt:{ gte: sevenDaysAgo }
},
orderBy:{ createdAt:"asc" }
});

const dailyMap: Record<string,{raw:number,output:number}> = {};

last7Days.forEach(p=>{
const day = new Date(p.createdAt).toLocaleDateString();

if(!dailyMap[day]) dailyMap[day]={raw:0,output:0};

dailyMap[day].raw += p.rawInput;
dailyMap[day].output += p.output;
});

const trendData = Object.entries(dailyMap).map(([date,val])=>({
date,
yield:
val.raw>0
? Number(((val.output/val.raw)*100).toFixed(1))
:0
}));

/* ===============================
ANALYTICS CHART DATA
=============================== */

const chartData = last7Days.map(p => ({

date: new Date(p.createdAt).toLocaleDateString(),

output: p.output,

waste: p.waste,

profit: (p.output * SELL_PRICE_PER_TON) - (p.rawInput * RAW_COST_PER_TON)

}));

/* ===============================
PAGE UI
=============================== */

return (

<div className="min-h-screen bg-gray-950 text-white p-8">

{/* HEADER */}

<div className="flex justify-between items-center mb-10">

<div>
<h1 className="text-3xl font-bold">
Welcome, {user.name}
</h1>

<p className="text-gray-400">
FactoryOS Executive Intelligence Panel
</p>
</div>

<form action="/api/auth/logout" method="POST">
<button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
Logout
</button>
</form>

</div>

{/* ALERT PANEL */}

{alerts.length > 0 && (

<div className="bg-red-600 p-4 rounded-xl mb-6">

<h2 className="font-semibold mb-2">
Operational Alerts
</h2>

<ul className="list-disc ml-6">

{alerts.map((alert,i)=>(
<li key={i}>{alert}</li>
))}

</ul>

</div>

)}

{/* KPI GRID */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

<GradientCard
title="Yield Efficiency"
value={`${averageYield}%`}
color={isLowYield ? "red" : "green"}
/>

<GradientCard
title="Gross Profit Today"
value={`₹ ${grossProfit.toLocaleString()}`}
color={grossProfit >=0 ? "green" : "red"}
/>

<GradientCard
title="Profit Margin"
value={`${profitMargin}%`}
color={profitMargin >=20 ? "green":"red"}
/>

</div>

{/* SECOND GRID */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

<GradientCard
title="Today's Output"
value={`${totalOutput} Tons`}
color="blue"
/>

<GradientCard
title="Raw Stock Remaining"
value={`${inventory?.rawStock ?? 0} Tons`}
color="purple"
/>

<GradientCard
title="Today's Waste"
value={`${totalWaste} Tons`}
color="yellow"
/>

</div>

{/* YIELD TREND */}

<div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-12">

<h2 className="text-xl font-semibold mb-4">
7-Day Yield Trend
</h2>

{trendData.length === 0 ? (

<p className="text-gray-400">
Not enough data for trend analysis.
</p>

) : (

<YieldChart data={trendData} />

)}

</div>

{/* PRODUCTION VS WASTE */}

<div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-12">

<h2 className="text-xl font-semibold mb-4">
Production vs Waste
</h2>

<ProductionWasteChart data={chartData} />

</div>

{/* PROFIT TREND */}

<div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-12">

<h2 className="text-xl font-semibold mb-4">
Profit Trend
</h2>

<ProfitChart data={chartData} />

</div>

{/* FINANCIAL */}

<div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

<h2 className="text-xl font-semibold mb-4">

Financial Breakdown (Today)

</h2>

<div className="space-y-2 text-gray-300">

<p>Total Raw Cost: ₹ {totalRawCost.toLocaleString()}</p>

<p>Total Revenue: ₹ {totalRevenue.toLocaleString()}</p>

<p className="font-bold text-white">

Gross Profit: ₹ {grossProfit.toLocaleString()}

</p>

</div>

</div>

</div>

);

}

/* ===============================
KPI CARD
=============================== */

function GradientCard({
title,
value,
color
}:{
title:string
value:string
color:"blue"|"green"|"red"|"purple"|"yellow"
}){

const colorMap = {

blue:"from-blue-600 to-blue-800",
green:"from-green-600 to-green-800",
red:"from-red-600 to-red-800",
purple:"from-purple-600 to-purple-800",
yellow:"from-yellow-500 to-yellow-700 text-black"

};

return(

<div className={`p-8 rounded-2xl shadow-xl bg-gradient-to-br ${colorMap[color]}`}>

<p className="text-sm opacity-90 mb-2">
{title}
</p>

<h2 className="text-4xl font-bold">
{value}
</h2>

</div>

);

}
