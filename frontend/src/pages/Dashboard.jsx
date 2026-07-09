import { useState, useEffect } from "react";
import api from "../api/axios";
import { formatCurrency } from "../utils/format";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect runs once when the page loads (empty [] dependency array).
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/dashboard/summary");
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Sales Amount"
          value={formatCurrency(summary.totalSalesAmount)}
        />
        <StatCard label="Number of Sales" value={summary.totalSales} />
        <StatCard label="Total Products" value={summary.totalProducts} />
        <StatCard label="Low Stock Items" value={summary.lowStockCount} />
      </div>

      {/* Low stock list */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Low Stock Products (below 5)
        </h2>

        {summary.lowStockProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            All products are well stocked. ✅
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {summary.lowStockProducts.map((p) => (
              <li key={p._id} className="py-2 flex justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="font-medium text-red-600">
                  {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// A small reusable card component for the top stats.
function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default Dashboard;