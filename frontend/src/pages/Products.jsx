import { useState, useEffect } from "react";
import api from "../api/axios";
import ProductModal from "../components/ProductModal";
import { formatCurrency } from "../utils/format";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Search + pagination state
  const [search, setSearch] = useState("");           // what's typed in the box
  const [submittedSearch, setSubmittedSearch] = useState(""); // what we actually query with
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products whenever the page or the submitted search changes.
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", {
        params: { search: submittedSearch, page, limit: 5 },
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, submittedSearch]);

  // Live search: 400ms after the user stops typing, apply the term.
  // The cleanup cancels the timer if they type again before it fires,
  // so we only ever send one request per "pause" in typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmittedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Pressing the Search button / Enter applies the term immediately.
  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedSearch(search);
    setPage(1);
  };
  
  // Delete a product after confirming.
  const handleDelete = async (product) => {
    // Simple browser confirm dialog — keeps it simple, no extra modal.
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/products/${product._id}`);
      fetchProducts(); // refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product")
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button  onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Product
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Search
        </button>
      </form>

      {/* States */}
      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button  onClick={() => {
                        setEditingProduct(p);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button  onClick={() => handleDelete(p)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
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
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}

export default Products;