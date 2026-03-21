// src/pages/AddItem.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    qty: "",
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (!form.price) {
      toast.error("Please enter price");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: parseFloat(form.price),
        qty: parseInt(form.qty || "0", 10),
        category: form.category,
        description: form.description,
      };

      // change the URL if your backend endpoint differs
      await axios.post("/api/items", payload);

      toast.success("Item added");
      navigate("/items");
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.response?.data?.message || err.message;
      toast.error(message || "Failed to add item");
      console.error("Add item error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Item</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
            placeholder="e.g. Chocolate Bar"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              name="qty"
              type="number"
              value={form.qty}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Optional"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Item"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/items")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
