import ProductionWasteChart from "@/components/ProductionWasteChart";
import ProfitChart from "@/components/ProfitChart";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import YieldChart from "@/components/YieldChart";

export default async function DashboardPage() {

/* ===============================
AUTH
=============================== */

const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;

if (!token) redirect("/login");

let user;
let factoryId;

try {
  const decoded: any = verifyToken(token);

  if (!decoded?.userId || !decoded?.factoryId) {
    redirect("/login");
  }

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
today.setHours(0, 0, 0, 0);

const productionsToday = await prisma.production.findMany({
  where: {
    factoryId,
    date: { gte: today },
  },
});

const totalRaw = productionsToday.reduce((s, p) => s + (p.rawInput || 0), 0);
const totalOutput = productionsToday.reduce((s, p) => s + (p.output || 0), 0);
const totalWaste = productionsToday.reduce((s, p) => s + (p.waste || 0), 0);

const averageYield =
  totalRaw > 0
    ? Number(((totalOutput / totalRaw) * 100).toFixed(2))
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
    ? Number(((grossProfit / totalRevenue) * 100).toFixed(2))
    : 0;

/* ===============================
INVENTORY
=============================== */

const inventory = await prisma.inventory.findFirst({
  where: { factoryId },
});

/* ===============================
ALERTS
=============================== */

const alerts: string[] = [];

if (averageYield < 85) {
  alerts.push("⚠ Yield efficiency below 85%");
}

if (totalWaste > totalOutput * 0.15) {
  alerts.push("⚠ Waste above 15%");
}

if (inventory && inventory.stock < 50) {
  alerts.push("⚠ Raw material stock low");
}

/* ===============================
7 DAY TREND
=============================== */

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
sevenDaysAgo.setHours(0, 0, 0, 0);

const last7Days = await prisma.production.findMany({
  where: {
    factoryId,
    date: { gte: sevenDaysAgo },
  },
  orderBy: { date: "asc" },
});

const dailyMap: Record<string, { raw: number; output: number }> = {};

last7Days.forEach((p) => {
  if (!p.date) return;

  const day = new Date(p.date).toLocaleDateString();

  if (!dailyMap[day]) {
    dailyMap[day] = { raw: 0, output: 0 };
  }

  dailyMap[day].raw += p.rawInput || 0;
  dailyMap[day].output += p.output || 0;
});

const trendData = Object.entries(dailyMap).map(([date, val]) => ({
  date,
  yield:
    val.raw > 0
      ? Number(((val.output / val.raw) * 100).toFixed(1))
      : 0,
}));

/* ===============================
CHART DATA
=============================== */

const chartData = last7Days.map((p) => ({
  date: p.date ? new Date(p.date).toLocaleDateString() : "N/A",
  output: p.output || 0,
  waste: p.waste || 0,
  profit:
    (p.output || 0) * SELL_PRICE_PER_TON -
    (p.rawInput || 0) * RAW_COST_PER_TON,
}));

/* ===============================
UI
=============================== */

return (
  <div className="min-h-screen bg-gray-950 text-white p-8">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-10">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {user?.name || "User"}
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

    {/* ALERTS */}
    {alerts.length > 0 && (
      <div className="bg-red-600 p-4 rounded-xl mb-6">
        <h2 className="font-semibold mb-2">Operational Alerts</h2>
        <ul className="list-disc ml-6">
          {alerts.map((alert, i) => (
            <li key={i}>{alert}</li>
          ))}
        </ul>
      </div>
    )}

    {/* KPI */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <GradientCard title="Yield Efficiency" value={`${averageYield}%`} color={isLowYield ? "red" : "green"} />
      <GradientCard title="Gross Profit Today" value={`₹ ${grossProfit.toLocaleString()}`} color={grossProfit >= 0 ? "green" : "red"} />
      <GradientCard title="Profit Margin" value={`${profitMargin}%`} color={profitMargin >= 20 ? "green" : "red"} />
    </div>

    {/* SECOND ROW */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <GradientCard title="Today's Output" value={`${totalOutput} Tons`} color="blue" />
      <GradientCard title="Raw Stock" value={`${inventory?.stock ?? 0} Tons`} color="purple" />
      <GradientCard title="Waste" value={`${totalWaste} Tons`} color="yellow" />
    </div>

    {/* YIELD */}
    <Section title="7-Day Yield Trend">
      {trendData.length === 0 ? (
        <p className="text-gray-400">No data yet</p>
      ) : (
        <YieldChart data={trendData} />
      )}
    </Section>

    {/* PRODUCTION */}
    <Section title="Production vs Waste">
      <ProductionWasteChart data={chartData} />
    </Section>

    {/* PROFIT */}
    <Section title="Profit Trend">
      <ProfitChart data={chartData} />
    </Section>

    {/* FINANCE */}
    <Section title="Financial Breakdown">
      <p>Total Raw Cost: ₹ {totalRawCost.toLocaleString()}</p>
      <p>Total Revenue: ₹ {totalRevenue.toLocaleString()}</p>
      <p className="font-bold text-white">
        Gross Profit: ₹ {grossProfit.toLocaleString()}
      </p>
    </Section>

  </div>
);
}

/* ===============================
COMPONENTS
=============================== */

function GradientCard({ title, value, color }: any) {
  const map: any = {
    blue: "from-blue-600 to-blue-800",
    green: "from-green-600 to-green-800",
    red: "from-red-600 to-red-800",
    purple: "from-purple-600 to-purple-800",
    yellow: "from-yellow-500 to-yellow-700 text-black",
  };

  return (
    <div className={`p-8 rounded-2xl shadow-xl bg-gradient-to-br ${map[color]}`}>
      <p className="text-sm opacity-90 mb-2">{title}</p>
      <h2 className="text-4xl font-bold">{value}</h2>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-12">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
