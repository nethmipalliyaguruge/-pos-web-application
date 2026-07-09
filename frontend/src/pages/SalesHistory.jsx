import { useState, useEffect } from "react";
import api from "../api/axios";
import { formatCurrency, formatDate } from "../utils/format";
import { printInvoice } from "../utils/printInvoice";

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Date filter + pagination
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Which sale is open in the details modal (null = closed)
  const [selectedSale, setSelectedSale] = useState(null);

  // Today's date as YYYY-MM-DD, used to block future dates in the pickers.
  const today = new Date().toISOString().split("T")[0];

  const fetchSales = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/sales", {
        params: { startDate, endDate, page, limit: 10 },
      });
      setSales(data.sales);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  // Fetching is driven entirely by this effect, so it always uses the
  // current dates/page — no stale-closure bugs.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, page]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1); // effect refetches with the chosen dates
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setPage(1); // effect refetches with no filter → all sales
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Sales History</h1>

      {/* Date filter */}
      <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={today}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Filter
        </button>
        <button
          type="button"
          onClick={clearFilter}
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </form>

      {/* States */}
      {loading ? (
        <p className="text-gray-500">Loading sales...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-500">No sales found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Cashier</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {s.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.items.length}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {formatCurrency(s.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.createdBy?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedSale(s)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Details modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedSale.invoiceNumber}
              </h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {formatDate(selectedSale.createdAt)} · Cashier:{" "}
              {selectedSale.createdBy?.name || "—"}
            </p>

            {/* Item lines */}
            <table className="w-full text-sm mb-4">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{item.name}</td>
                    <td className="py-2 text-gray-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-2 text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-800">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>{formatCurrency(selectedSale.discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                <span>Total</span>
                <span>{formatCurrency(selectedSale.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => printInvoice(selectedSale)}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesHistory;