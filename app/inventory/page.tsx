"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";

interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);

  // Fetch all items
  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, "items"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Item[];
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add stock
  const handleAddStock = async (item: Item) => {
    const qtyStr = prompt("Enter stock quantity to add:");
    if (!qtyStr) return;
    const quantity = parseInt(qtyStr, 10);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Invalid stock quantity!");
      return;
    }

    // Update item quantity in items collection
    await updateDoc(doc(db, "items", item.id), { quantity: quantity });

    // Add a new history record for stock addition
    await addDoc(collection(db, "history"), {
      itemName: item.name,
      cost: item.cost,
      sellingPrice: item.price,
      quantity: 0, // 0 sold for stock addition
      remaining: quantity,
      date: serverTimestamp(),
    });

    toast.success("Stock added successfully!");
    fetchItems();
  };

  // Sell stock
  const handleSell = async (item: Item) => {
    const qtyStr = prompt(`Enter quantity to sell (Available: ${item.quantity})`);
    if (!qtyStr) return;
    const quantity = parseInt(qtyStr, 10);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Invalid quantity!");
      return;
    }
    if (quantity > item.quantity) {
      toast.error("Not enough stock!");
      return;
    }

    const remaining = item.quantity - quantity;

    // Update item quantity
    await updateDoc(doc(db, "items", item.id), { quantity: remaining });

    // Add a new history record for sale
    await addDoc(collection(db, "history"), {
      itemName: item.name,
      cost: item.cost,
      sellingPrice: item.price,
      quantity: quantity, // sold
      remaining: remaining,
      date: serverTimestamp(),
      lastSold: serverTimestamp(),
    });

    toast.success(`Sold ${quantity} ${item.name}(s)!`);
    fetchItems();
  };

  // Remove item
  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    await deleteDoc(doc(db, "items", id));
    toast.success("Item removed!");
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">📦 Inventory</h1>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-left text-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-sm sm:text-base font-medium text-white">Name</th>
                <th className="p-3 text-sm sm:text-base font-medium text-white">Quantity</th>
                <th className="p-3 text-sm sm:text-base font-medium text-white">Cost</th>
                <th className="p-3 text-sm sm:text-base font-medium text-white">Price</th>
                <th className="p-3 text-sm sm:text-base font-medium text-white">Profit/Item</th>
                <th className="p-3 text-sm sm:text-base font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-600 transition">
                    <td className="p-3 text-sm sm:text-base">{item.name}</td>
                    <td className="p-3 text-sm sm:text-base">{item.quantity}</td>
                    <td className="p-3 text-sm sm:text-base">Rs {item.cost}</td>
                    <td className="p-3 text-sm sm:text-base">Rs {item.price}</td>
                    <td className="p-3 text-sm sm:text-base text-green-400">Rs {item.price - item.cost}</td>
                    <td className="p-3 text-sm sm:text-base space-x-2">
                      {item.quantity === 0 && (
                        <button
                          onClick={() => handleAddStock(item)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                        >
                          Add Stock
                        </button>
                      )}
                      {item.quantity > 0 && (
                        <button
                          onClick={() => handleSell(item)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition"
                        >
                          Sell
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}