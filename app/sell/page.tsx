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
    if (!item) return;

    if (quantity > item.quantity) {
      alert("Not enough stock!");
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

    alert(`Sold ${quantity} ${item.name}(s). Profit: Rs ${profit}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💸 Sell Item</h1>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border p-2"
      >
        <option value="">Select item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} (Stock: {item.quantity})
          </option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border p-2 ml-2"
      />
      <button
        onClick={handleSell}
        className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
      >
        Sell
      </button>
    </div>
  );
}
