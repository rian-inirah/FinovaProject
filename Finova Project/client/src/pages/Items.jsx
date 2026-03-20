import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { itemsAPI } from "../services/api";
import toast from "react-hot-toast";

const Items = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setEditValue } = useForm();

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await itemsAPI.getAll({ search: searchTerm });
      setItems(response.data.items || []); // backend filters by user
    } catch {
      toast.error("Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      if (data.image && data.image[0]) formData.append("image", data.image[0]);

      const response = await itemsAPI.create(formData);
      setItems((prev) => [response.data.item, ...prev]);
      setIsAddingItem(false);
      resetAdd();
      toast.success("Item added successfully!");
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleEditItem = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      if (data.image && data.image[0]) formData.append("image", data.image[0]);

      const response = await itemsAPI.update(editingItem.id, formData);
      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? response.data.item : item))
      );
      setEditingItem(null);
      resetEdit();
      toast.success("Item updated successfully!");
    } catch {
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await itemsAPI.delete(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setDeleteConfirm(null);
      setConfirmChecked(false);
      toast.success("Item deleted successfully!");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setEditValue("name", item.name);
    setEditValue("price", item.price);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    resetEdit();
  };

  return (
    <div className="p-6">
      {/* Header + Add button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <button onClick={() => setIsAddingItem(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors">
          <Plus size={18} className="mr-2" />
          Add Item
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center mb-6">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      {/* Add Item Form */}
      {isAddingItem && (
        <form onSubmit={handleSubmitAdd(handleAddItem)} className="mb-6 p-4 border rounded-md shadow">
          <h2 className="font-bold mb-4">Add New Item</h2>
          <input type="text" placeholder="Item Name" {...registerAdd("name", { required: true })} className="border p-2 w-full mb-2" />
          <input type="number" placeholder="Price" {...registerAdd("price", { required: true })} className="border p-2 w-full mb-2" />
          <input type="file" {...registerAdd("image")} className="mb-2" />
          <div className="flex space-x-2">
            <button type="submit" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Save size={16} className="mr-2" /> Save
            </button>
            <button type="button" onClick={() => setIsAddingItem(false)} className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">
              <X size={16} className="mr-2" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      {isLoading ? (
        <p>Loading items...</p>
      ) : items.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-md shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-600">₹ {item.price}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => startEditing(item)} className="p-2 bg-yellow-400 rounded-md">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDeleteConfirm(item)} className="p-2 bg-red-500 text-white rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No items found.</p>
      )}

      {/* Edit Item Form */}
      {editingItem && (
        <form onSubmit={handleSubmitEdit(handleEditItem)} className="mt-6 p-4 border rounded-md shadow">
          <h2 className="font-bold mb-4">Edit Item</h2>
          <input type="text" placeholder="Item Name" {...registerEdit("name", { required: true })} className="border p-2 w-full mb-2" />
          <input type="number" placeholder="Price" {...registerEdit("price", { required: true })} className="border p-2 w-full mb-2" />
          <input type="file" {...registerEdit("image")} className="mb-2" />
          <div className="flex space-x-2">
            <button type="submit" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Save size={16} className="mr-2" /> Update
            </button>
            <button type="button" onClick={cancelEditing} className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">
              <X size={16} className="mr-2" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="mt-6 p-4 border rounded-md shadow bg-red-50">
          <h2 className="font-bold mb-2 text-red-600">Delete {deleteConfirm.name}?</h2>
          <label className="flex items-center mb-2">
            <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="mr-2" />
            Yes, I want to delete this item.
          </label>
          <div className="flex space-x-2">
            <button disabled={!confirmChecked} onClick={() => handleDeleteItem(deleteConfirm.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300">
              Confirm Delete
            </button>
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
