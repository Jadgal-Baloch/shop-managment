"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
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

export default function SellPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "items"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
      setItems(data);
    };
    fetchItems();
  }, []);

  const handleSell = async () => {
    const item = items.find((i) => i.id === selected);
    if (!item) {
      toast.error("Please select an item!");
      return;
    }

    if (quantity > item.quantity) {
      toast.error("Not enough stock!");
      return;
    }

    const profit = (item.price - item.cost) * quantity;
    const remaining = item.quantity - quantity;

    // ✅ Inventory update
    const ref = doc(db, "items", item.id);
    await updateDoc(ref, { quantity: remaining });

    // ✅ Check if sale already exists for this item
    const q = query(collection(db, "history"), where("itemName", "==", item.name));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existing = snapshot.docs[0];
      const oldData = existing.data();

      await updateDoc(doc(db, "history", existing.id), {
        quantity: (oldData.quantity || 0) + quantity,
        profit: (oldData.profit || 0) + profit,
        lastSold: new Date().toISOString(),
        remaining: remaining,
      });
    } else {
      await addDoc(collection(db, "history"), {
        itemName: item.name,
        quantity,
        sellingPrice: item.price,
        profit,
        date: new Date().toISOString(),
        remaining: remaining,
      });
    }

    toast.success(`Sold ${quantity} ${item.name}(s). Profit: Rs ${profit}`);
    setSelected("");
    setQuantity(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">
          💸 Sell Item
        </h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Item</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
            >
              <option value="">Select item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Stock: {item.quantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleSell}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition font-semibold"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}