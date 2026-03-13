import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#0f172a",
          color: "white",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>
          🏭 FactoryOS
        </h2>

        <nav style={{ marginTop: "30px" }}>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.6" }}>

            <li>
              <Link href="/dashboard">📊 Dashboard</Link>
            </li>

            <li>
              <Link href="/production">🏭 Production History</Link>
            </li>

            <li>
              <Link href="/production/new">➕ New Production</Link>
            </li>

            <li>
              <Link href="/dashboard/inventory">📦 Inventory</Link>
            </li>

            <li>
              <Link href="/dashboard/dispatch">🚚 Dispatch</Link>
            </li>

            <li>
              <Link href="/dashboard/users">👥 Users</Link>
            </li>

          </ul>
        </nav>

        {/* Logout */}

        <div style={{ marginTop: "40px" }}>
          <form action="/api/auth/logout" method="POST">
            <button
              style={{
                background: "#dc2626",
                border: "none",
                padding: "10px 14px",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}

      <main
        style={{
          flex: 1,
          padding: "40px",
          background: "#f8fafc",
        }}
      >
        {children}
      </main>

    </div>
  );
}
