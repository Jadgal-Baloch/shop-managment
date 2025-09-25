"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
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

interface Sale {
  itemId: string;
  itemName: string;
  quantity: number;
  profit: number;
  remaining: number;
  historyId?: string; // history doc id
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [lastSale, setLastSale] = useState<Sale | null>(null); // ✅ Last sell state

  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, "items"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Item[];
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Remove item with confirmation
  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    await deleteDoc(doc(db, "items", id));
    toast.success("Item removed successfully!");
    fetchItems();
  };

  // ✅ Sell item (ask quantity) + store last sale
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
    const profit = (item.price - item.cost) * quantity;

    await updateDoc(doc(db, "items", item.id), {
      quantity: remaining,
    });

    const q = query(collection(db, "history"), where("itemName", "==", item.name));
    const snapshot = await getDocs(q);

    let historyId: string | undefined = undefined;

    if (!snapshot.empty) {
      const existing = snapshot.docs[0];
      const oldData = existing.data();
      historyId = existing.id;

      await updateDoc(doc(db, "history", existing.id), {
        quantity: (oldData.quantity || 0) + quantity,
        profit: (oldData.profit || 0) + profit,
        lastSold: new Date().toISOString(),
        remaining: remaining,
      });
    } else {
      const newDoc = await addDoc(collection(db, "history"), {
        itemName: item.name,
        quantity: quantity,
        sellingPrice: item.price,
        profit,
        date: new Date().toISOString(),
        remaining: remaining,
      });
      historyId = newDoc.id;
    }

    // ✅ Store last sale for undo
    setLastSale({
      itemId: item.id,
      itemName: item.name,
      quantity,
      profit,
      remaining: remaining,
      historyId,
    });

    fetchItems();
    toast.success(`Sold ${quantity} ${item.name}(s). Profit: Rs ${profit}`);
  };

  // ✅ Undo last sell
  const handleUndo = async () => {
    if (!lastSale) return toast.error("No sale to undo!");

    const itemDoc = doc(db, "items", lastSale.itemId);
    const itemSnap = await getDocs(collection(db, "items"));
    const item = items.find((i) => i.id === lastSale.itemId);
    if (!item) return toast.error("Item not found!");

    // Revert inventory quantity
    await updateDoc(itemDoc, {
      quantity: item.quantity + lastSale.quantity,
    });

    // Revert history
    if (lastSale.historyId) {
      const historyDoc = doc(db, "history", lastSale.historyId);
      const historySnap = await getDocs(collection(db, "history"));
      const oldQty = item.quantity; // approximate
      await updateDoc(historyDoc, {
        quantity: (oldQty - lastSale.quantity) >= 0 ? oldQty - lastSale.quantity : 0,
        profit: 0, // simple reset for last sell
        remaining: item.quantity + lastSale.quantity,
      });
    }

    toast.success(`Undo successful! Restored ${lastSale.quantity} ${lastSale.itemName}(s).`);
    setLastSale(null);
    fetchItems();
  };

  // ✅ Filtered + Sorted
  let filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "name") filteredItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "quantity") filteredItems = [...filteredItems].sort((a, b) => b.quantity - a.quantity);
  else if (sortBy === "price") filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
  else if (sortBy === "profit") filteredItems = [...filteredItems].sort((a, b) => (b.price - b.cost) - (a.price - a.cost));

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6">📦 Inventory</h1>

      {/* Undo Last Sell */}
      {lastSale && (
        <div className="mb-4">
          <button
            onClick={handleUndo}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            ↩ Undo Last Sell
          </button>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by item name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 w-full md:w-1/2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 "
        >
          <option className="text-black" value="">Sort By default</option>
          <option  className="text-black" value="name">Name (A-Z)</option>
          <option  className="text-black" value="quantity">Quantity (High → Low)</option>
          <option  className="text-black" value="price">Price (High → Low)</option>
          <option  className="text-black" value="profit">Profit (High → Low)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-200">
            <tr className="text-black">
              <th className="p-2">Name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Cost Price</th>
              <th className="p-2">Selling Price</th>
              <th className="p-2">Profit</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-600">
                  No matching items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isLow = item.quantity < 5;
                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className={`p-2 ${isLow ? "text-red-600 font-semibold" : ""}`}>
                      {item.quantity}
                    </td>
                    <td className="p-2">Rs {item.cost}</td>
                    <td className="p-2">Rs {item.price}</td>
                    <td className="p-2 text-green-600">Rs {item.price - item.cost}</td>
                    <td className="p-2">
                      {isLow ? (
                        <span className="text-red-600 font-semibold">⚠ Low Stock!</span>
                      ) : (
                        <span className="text-gray-600">In Stock</span>
                      )}
                    </td>
                    <td className="p-2 space-x-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSell(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Sell
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
