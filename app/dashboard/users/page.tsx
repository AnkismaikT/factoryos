"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadUsers() {

      try {

        const res = await fetch("/api/users");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load users");
          return;
        }

        if (data.success) {
          setUsers(data.data);
        }

      } catch (err) {
        setError("API connection failed");
      }

      setLoading(false);
    }

    loadUsers();

  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">👥 Factory Users</h1>

        {loading && (
          <p className="text-gray-400">Loading users...</p>
        )}

        {error && (
          <p className="text-red-400">{error}</p>
        )}

        {!loading && !error && (

          <table className="w-full text-sm bg-gray-900 rounded-xl overflow-hidden">

            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>

              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800">
                  <td className="p-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}
