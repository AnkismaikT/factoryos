import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <aside style={{
        width: "250px",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "24px"
      }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
          FactoryOS
        </h2>

        <nav style={{ marginTop: "30px" }}>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.5" }}>
            <li><Link href="/dashboard">📊 Dashboard</Link></li>
            <li><Link href="/dashboard/production">🏭 Production</Link></li>
            <li><Link href="/dashboard/inventory">📦 Inventory</Link></li>
            <li><Link href="/dashboard/dispatch">🚚 Dispatch</Link></li>
            <li><Link href="/dashboard/users">👥 Users</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", background: "#f8fafc" }}>
        {children}
      </main>

    </div>
  );
}