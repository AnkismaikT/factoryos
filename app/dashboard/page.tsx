import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let user;

  try {
    const decoded = verifyToken(token);

    user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-400">
            FactoryOS Operational Dashboard
          </p>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
            Logout
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card title="Today's Production" value="0 Tons" />
        <Card title="Inventory Stock" value="0 Units" />
        <Card title="Dispatch Pending" value="0 Orders" />
        <Card title="Yield Efficiency" value="0%" />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
    </div>
  );
}

