import { useState, useEffect } from "react";
import api from "../api/axios";

function NewSale() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]); // items chosen for this sale
  const [discount, setDiscount] = useState("");

  const [message, setMessage] = useState(null); // { type: "success"|"error", text }
  const [submitting, setSubmitting] = useState(false);

  // Load ACTIVE products only (inactive ones can't be sold).
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: { search, status: "active", limit: 50 },
      });
      setProducts(data.products);
    } catch {
      setMessage({ type: "error", text: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Add a product to the cart (or bump its quantity if already there).
  const addToCart = (product) => {
    setMessage(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.product === product._id);

      if (existing) {
        // Don't exceed available stock.
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      // New cart line. Store price/name so the cart shows them.
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  };

  // Change quantity with the +/- buttons (kept between 1 and stock).
  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product !== productId) return i;
        const next = i.quantity + delta;
        if (next < 1) return i; // never below 1
        if (next > i.stock) return i; // never above stock
        return { ...i, quantity: next };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product !== productId));
  };

  // Empty the whole cart and reset the discount.
  const clearCart = () => {
    setCart([]);
    setDiscount("");
    setMessage(null);
  };

  // --- Money calculations ---
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountNum = Math.max(0, Number(discount) || 0);
  const total = subtotal - discountNum;

  const handleCheckout = async () => {
    setMessage(null);

    // Basic front-end guards (backend also enforces these).
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Cart is empty" });
      return;
    }
    if (discountNum < 0) {
      setMessage({ type: "error", text: "Discount cannot be negative" });
      return;
    }
    if (discountNum > subtotal) {
      setMessage({ type: "error", text: "Discount cannot exceed subtotal" });
      return;
    }

    setSubmitting(true);
    try {
      // Backend only needs product id + quantity; it re-checks price/stock.
      const payload = {
        items: cart.map((i) => ({ product: i.product, quantity: i.quantity })),
        discount: discountNum,
      };
      const { data } = await api.post("/sales", payload);

      setMessage({
        type: "success",
        text: `Sale completed! Invoice ${data.invoiceNumber} — Total Rs. ${data.total.toFixed(
          2
        )}`,
      });

      // Reset for the next sale and refresh stock numbers.
      setCart([]);
      setDiscount("");
      fetchProducts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Checkout failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">New Sale</h1>

      {/* Message banner */}
      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: product picker */}
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Search
            </button>
          </form>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {products.map((p) => (
                <li
                  key={p._id}
                  className="py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      Rs. {p.price.toFixed(2)} · {p.stock} in stock
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-40"
                  >
                    {p.stock === 0 ? "Out" : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT: cart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Cart</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:underline"
              >
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No items yet. Click "Add" on a product.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 mb-4">
              {cart.map((i) => (
                <li key={i.product} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 text-sm">{i.name}</span>
                    <button
                      onClick={() => removeFromCart(i.product)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(i.product, -1)}
                        className="w-7 h-7 border rounded text-gray-700 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">
                        {i.quantity}
                      </span>
                      <button
                        onClick={() => changeQty(i.product, 1)}
                        className="w-7 h-7 border rounded text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-800">
                      Rs. {(i.price * i.quantity).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Totals */}
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <span>Discount</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                disabled={cart.length === 0}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewSale;