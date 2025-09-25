"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";

export default function AddItemPage() {
  const [form, setForm] = useState({
    name: "",
    cost: 0,
    price: 0,
    quantity: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, cost, price, quantity } = form;
    const costNum = Number(cost);
    const priceNum = Number(price);
    const qtyNum = Number(quantity);

    if (!name || costNum <= 0 || priceNum <= 0 || qtyNum <= 0) {
      toast.error("Please fill all fields correctly!");
      return;
    }

    const expectedProfit = (priceNum - costNum) * qtyNum;

    await addDoc(collection(db, "items"), {
      name,
      cost: costNum,
      price: priceNum,
      quantity: qtyNum,
      expectedProfit,
      createdAt: new Date().toISOString(),
    });

    toast.success("Item added successfully with expected profit tracking!");

    setForm({ name: "", cost: 0, price: 0, quantity: 0 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" />
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">
          ➕ Add New Item
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter item name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cost Price</label>
            <input
              type="number"
              name="cost"
              placeholder="Enter cost price"
              value={form.cost}
              onChange={handleChange}
              className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Selling Price</label>
            <input
              type="number"
              name="price"
              placeholder="Enter selling price"
              value={form.price}
              onChange={handleChange}
              className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition font-semibold"
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
}