"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";

interface Sale {
  id: string;
  itemName: string;
  quantity: number; // sold qty
  sellingPrice: number;
  cost: number;
  remaining?: number;
  date: any; // Firestore timestamp
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [monthName, setMonthName] = useState<string>("");

  const fetchSales = async () => {
    try {
      const now = new Date();

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      setMonthName(
        now.toLocaleString("default", { month: "long", year: "numeric" })
      );

      const snapshot = await getDocs(collection(db, "history"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];

      // Filter only this month's data
      const monthData = data.filter((h) => {
        const d = h.date?.toDate ? h.date.toDate() : new Date(h.date);
        return d >= startOfMonth && d < startOfNextMonth;
      });

      setSales(monthData);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Failed to load sales.");
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // 🔹 Summary calculations
  const totalProfit = sales
    .filter((s) => s.quantity > 0)
    .reduce((acc, s) => acc + (s.sellingPrice - s.cost) * s.quantity, 0);

  const totalSales = sales
    .filter((s) => s.quantity > 0)
    .reduce((acc, s) => acc + s.sellingPrice * s.quantity, 0);

  const totalItemsSold = sales
    .filter((s) => s.quantity > 0)
    .reduce((acc, s) => acc + s.quantity, 0);

  const totalRemaining = sales
    .filter((s) => s.remaining !== undefined)
    .reduce((acc, s) => acc + (s.remaining || 0), 0);

  const totalInvested = sales
    .filter((s) => s.quantity === 0) // only stock addition
    .reduce((acc, s) => acc + (s.cost * (s.remaining || 0)), 0);

  // ✅ CSV Export
  const exportCSV = () => {
    if (sales.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const headers = [
      "Item Name",
      "Quantity Sold",
      "Selling Price",
      "Profit",
      "Date",
      "Remaining Stock",
      "Invested",
    ];

    const rows = sales.map((s) => [
      s.itemName ?? "",
      s.quantity?.toString() ?? "0",
      s.sellingPrice?.toString() ?? "0",
      s.quantity && s.quantity > 0 ? ((s.sellingPrice - s.cost) * s.quantity).toString() : "0",
      s.date ? s.date.toDate().toLocaleString() : "",
      s.remaining !== undefined ? s.remaining.toString() : "",
      s.quantity === 0 ? (s.cost * (s.remaining || 0)).toString() : "0",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${monthName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
          📊 Business Report - {monthName}
        </h1>

        {/* 🔹 Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-gray-700 rounded-lg shadow">
            <h2 className="text-gray-300 text-sm sm:text-base">Total Sales</h2>
            <p className="text-xl font-bold text-blue-400">Rs {totalSales}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg shadow">
            <h2 className="text-gray-300 text-sm sm:text-base">Total Profit</h2>
            <p className="text-xl font-bold text-green-400">Rs {totalProfit}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg shadow">
            <h2 className="text-gray-300 text-sm sm:text-base">Items Sold</h2>
            <p className="text-xl font-bold text-purple-400">{totalItemsSold}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg shadow">
            <h2 className="text-gray-300 text-sm sm:text-base">Remaining Stock</h2>
            <p className="text-xl font-bold text-red-400">{totalRemaining}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg shadow">
            <h2 className="text-gray-300 text-sm sm:text-base">Total Invested</h2>
            <p className="text-xl font-bold text-yellow-400">Rs {totalInvested}</p>
          </div>
        </div>

        {/* 🔹 Detailed table */}
        <div className="overflow-x-auto">
          {sales.length === 0 ? (
            <p className="text-gray-400 text-center">No sales recorded this month.</p>
          ) : (
            <>
              <table className="w-full border border-gray-700 text-left text-gray-200 mb-4">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Item</th>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Qty Sold</th>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Selling Price</th>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Profit</th>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Date</th>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Remaining Stock</th>
                    <th className="p-3 text-sm sm:text-base font-medium text-white">Invested</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-t border-gray-700 hover:bg-gray-600 transition">
                      <td className="p-3 text-sm sm:text-base">{s.itemName}</td>
                      <td className="p-3 text-sm sm:text-base">{s.quantity ?? 0}</td>
                      <td className="p-3 text-sm sm:text-base">Rs {s.sellingPrice ?? 0}</td>
                      <td className="p-3 text-sm sm:text-base text-green-400">
                        Rs {s.quantity && s.quantity > 0 ? (s.sellingPrice - s.cost) * s.quantity : 0}
                      </td>
                      <td className="p-3 text-sm sm:text-base">
                        {s.date ? s.date.toDate().toLocaleString() : "-"}
                      </td>
                      <td className="p-3 text-sm sm:text-base">{s.remaining ?? "-"}</td>
                      <td className="p-3 text-sm sm:text-base">
                        Rs {s.quantity === 0 ? (s.cost * (s.remaining || 0)) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 🔹 CSV Export */}
              <button
                onClick={exportCSV}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Export as CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}