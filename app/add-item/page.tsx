"use client";

import { useState } from "react";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AddItemPage() {
  const [form, setForm] = useState({ name: "", quantity: 0, cost: 0, price: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Check if item already exists
      const q = query(collection(db, "items"), where("name", "==", form.name));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // 👉 Item exists → update stock
        const existingDoc = snapshot.docs[0];
        const oldData = existingDoc.data();

        await updateDoc(doc(db, "items", existingDoc.id), {
          quantity: (oldData.quantity || 0) + form.quantity,
          cost: form.cost, // cost aur price bhi update karenge (agar change karna ho)
          price: form.price,
        });

        alert(`Stock updated! New quantity: ${(oldData.quantity || 0) + form.quantity}`);
      } else {
        // 👉 Item doesn't exist → add new
        await addDoc(collection(db, "items"), form);
        alert("Item added!");
      }

      setForm({ name: "", quantity: 0, cost: 0, price: 0 });
    } catch (error) {
      console.error("Error adding/updating item:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">➕ Add / Update Item</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md bg-gray-100 p-6 rounded-lg shadow"
      >
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Item Name
          </label>
          <input
            type="text"
            placeholder="Enter item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Quantity
          </label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            required
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Cost Price
          </label>
          <input
            type="number"
            placeholder="Enter cost price"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: +e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            required
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Selling Price
          </label>
          <input
            type="number"
            placeholder="Enter selling price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: +e.target.value })}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition"
        >
          Save Item
        </button>
      </form>
    </div>
  );
}
