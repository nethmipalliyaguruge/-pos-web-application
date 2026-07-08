import { useState, useEffect } from "react";
import api from "../api/axios";

// `product` is null when adding, or an existing product when editing.
// `onClose` closes the modal; `onSaved` tells the parent to refresh the list.
function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(product);

  // When editing, pre-fill the form with the existing product's values.
  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      });
    }
  }, [product]);

  // One handler for all fields. Checkboxes use `checked`, others use `value`.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Convert price/stock from text to numbers before sending.
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (isEditing) {
        await api.put(`/products/${product._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      onSaved(); // refresh list in parent
      onClose(); // close modal
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    // Dark overlay behind the modal
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Name" name="name" value={form.name} onChange={handleChange} />
          <Field label="SKU" name="sku" value={form.sku} onChange={handleChange} />
          <Field
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
          <Field
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />
          <Field
            label="Stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
          />

          {/* Active checkbox */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active (available for sale)
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// A small reusable labeled input.
function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        min={type === "number" ? "0" : undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default ProductModal;