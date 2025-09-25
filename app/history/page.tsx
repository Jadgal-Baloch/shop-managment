

"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore"; // ✅ import Timestamp
import { db } from "../lib/firebase";

interface Sale {
  id: string;
  itemName: string;
  quantity: number; // sold
  sellingPrice: number;
  cost: number;
  remaining?: number;
  date?: Timestamp | string; // Firebase Timestamp or string
  lastSold?: Timestamp | string; // Firebase Timestamp or string
}

export default function HistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = async () => {
    const snapshot = await getDocs(collection(db, "history"));
    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Sale[];
    setSales(data);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // ✅ Properly type date parameter
  const formatTime = (date?: Timestamp | string) => {
    if (!date) return "-";
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Add missing state and function for clearHistory and loading
  const [loading, setLoading] = useState(false);

  const clearHistory = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "history"));
    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "history", docSnap.id))
    );
    await Promise.all(deletePromises);
    await fetchSales();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">📜 Sales History</h1>
          {sales.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={loading}
              className="mt-4 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition font-semibold"
            >
              {loading ? "Clearing..." : "Clear History"}
            </button>
          )}
        </div>

        {sales.length === 0 ? (
          <p className="text-gray-400 text-center">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 text-left text-gray-200">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Item</th>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Stock Added</th>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Sold</th>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Remaining</th>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Expected Profit</th>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Actual Profit</th>
                  <th className="p-3 text-sm sm:text-base font-medium text-white">Last Sold</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const stockAdded = (sale.quantity || 0) + (sale.remaining || 0);
                  const expectedProfit = (sale.sellingPrice - (sale.cost || 0)) * stockAdded;
                  const actualProfit = (sale.sellingPrice - (sale.cost || 0)) * (sale.quantity || 0);

                  return (
                    <tr key={sale.id} className="border-t border-gray-700 hover:bg-gray-600 transition">
                      <td className="p-3 text-sm sm:text-base">{sale.itemName}</td>
                      <td className="p-3 text-sm sm:text-base">{stockAdded}</td>
                      <td className="p-3 text-sm sm:text-base">{sale.quantity}</td>
                      <td className="p-3 text-sm sm:text-base">{sale.remaining ?? "-"}</td>
                      <td className="p-3 text-sm sm:text-base text-blue-400">Rs {expectedProfit}</td>
                      <td className="p-3 text-sm sm:text-base text-green-400">Rs {actualProfit}</td>
                      <td className="p-3 text-sm sm:text-base">
                        {sale.lastSold
                          ? formatTime(sale.lastSold)
                          : sale.date
                          ? formatTime(sale.date)
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}