import { useState, useEffect } from "react";
import api from "../api/axios";

function NewSale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  // "categories" = show the tiles; "products" = show a product list
  const [view, setView] = useState("categories");

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("amount"); // "amount" (Rs.) or "percent" (%)

  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load ACTIVE products for the current category/search.
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: {
          search: submittedSearch,
          status: "active",
          category: selectedCategory,
          limit: 50,
        },
      });
      setProducts(data.products);
    } catch {
      setMessage({ type: "error", text: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  // Load the category list once, for the tiles.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get("/products/categories");
        setCategories(data);
      } catch {
        // If it fails, we just show no tiles.
      }
    };
    loadCategories();
  }, []);

  // Fetch products only when we're in the product view.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (view === "products") fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedCategory, submittedSearch]);

  // Live search: 400ms after typing stops, show matching products.
  // Typing switches away from the category tiles; clearing the box
  // (when not inside a category) returns to the tiles.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        setSelectedCategory("");
        setSubmittedSearch(search);
        setView("products");
      } else if (view === "products" && !selectedCategory) {
        setSubmittedSearch("");
        setView("categories");
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Clicking a category tile.
  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearch("");
    setSubmittedSearch("");
    setView("products");
  };

  // Search jumps straight to a product list (across all categories).
  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedCategory("");
    setSubmittedSearch(search);
    setView("products");
  };

  // Back to the category tiles.
  const backToCategories = () => {
    setView("categories");
    setSelectedCategory("");
    setSearch("");
    setSubmittedSearch("");
  };

  // Add a product to the cart (or bump its quantity if already there).
  const addToCart = (product) => {
    setMessage(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
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

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product !== productId) return i;
        const next = i.quantity + delta;
        if (next < 1) return i;
        if (next > i.stock) return i;
        return { ...i, quantity: next };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount("");
    setMessage(null);
  };

  // --- Money calculations ---
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountInput = Math.max(0, Number(discount) || 0);
  // Convert the entered value into an actual rupee amount.
  // For %, cap at 100 so the discount can never exceed the subtotal.
  const discountAmount =
    discountType === "percent"
      ? (subtotal * Math.min(discountInput, 100)) / 100
      : Math.min(discountInput, subtotal); // never exceed subtotal (total can't go negative)
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async () => {
    setMessage(null);
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Cart is empty" });
      return;
    }
    if (discountAmount > subtotal) {
      setMessage({ type: "error", text: "Discount cannot exceed subtotal" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((i) => ({ product: i.product, quantity: i.quantity })),
        // Always send a rupee amount (rounded to 2 decimals) — backend stores the real money off.
        discount: Number(discountAmount.toFixed(2)),
      };
      const { data } = await api.post("/sales", payload);

      setMessage({
        type: "success",
        text: `Sale completed! Invoice ${data.invoiceNumber} — Total Rs. ${data.total.toFixed(
          2
        )}`,
      });

      setCart([]);
      setDiscount("");
      if (view === "products") fetchProducts(); // refresh stock numbers
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Checkout failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Pick a soft background color for each category (same category → same color).
  const tileColors = [
    "bg-blue-50 border-blue-200 hover:border-blue-400",
    "bg-green-50 border-green-200 hover:border-green-400",
    "bg-amber-50 border-amber-200 hover:border-amber-400",
    "bg-purple-50 border-purple-200 hover:border-purple-400",
    "bg-pink-50 border-pink-200 hover:border-pink-400",
    "bg-teal-50 border-teal-200 hover:border-teal-400",
  ];
  const colorFor = (name) => {
    // Turn the name into a stable number, then pick a color.
    const sum = name.split("").reduce((n, ch) => n + ch.charCodeAt(0), 0);
    return tileColors[sum % tileColors.length];
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">New Sale</h1>

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
        {/* LEFT: category tiles / product list */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Search is always available */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
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
            <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Search
            </button>
          </form>

          {view === "categories" ? (
            /* --- CATEGORY TILES --- */
            <div>
              <h2 className="text-sm text-gray-500 mb-3">Select a category</h2>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-sm">No categories found.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCategory(c)}
                      className={`aspect-square flex items-center justify-center text-center p-3 border rounded-lg text-gray-800 font-medium capitalize ${colorFor(c)}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* --- PRODUCT LIST --- */
            <div>
              <button
                onClick={backToCategories}
                className="text-sm text-blue-600 hover:underline mb-3"
              >
                ← Categories
              </button>
              <h2 className="text-sm font-medium text-gray-700 mb-2">
                {selectedCategory
                  ? selectedCategory
                  : `Search results for "${submittedSearch}"`}
              </h2>

              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">No products found.</p>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {products.map((p) => (
                    <li key={p._id}>
                      {/* The whole row is one button — click anywhere to add. */}
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                        className="w-full py-2 px-2 flex items-center justify-between text-left rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div>
                          <p className="text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-500">
                            Rs. {p.price.toFixed(2)} · {p.stock} in stock
                          </p>
                        </div>
                        {/* Visual "Add" pill (a span, not a nested button) */}
                        <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
                          {p.stock === 0 ? "Out" : "Add"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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

          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Discount</span>
              <div className="flex items-center gap-2">
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value);
                    setDiscount(""); // reset so "50" doesn't jump between Rs. and %
                  }}
                  disabled={cart.length === 0}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="amount">Rs.</option>
                  <option value="percent">%</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max={discountType === "percent" ? "100" : undefined}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  disabled={cart.length === 0}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* When using %, show the actual rupee amount being taken off */}
            {discountType === "percent" && discountAmount > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Discount amount</span>
                <span>− Rs. {discountAmount.toFixed(2)}</span>
              </div>
            )}
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