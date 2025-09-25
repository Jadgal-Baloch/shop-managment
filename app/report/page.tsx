// ReportsPage.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";

interface Sale {
  id: string;
  itemName: string;
  quantity: number;
  sellingPrice: number;
  profit: number;
  date: string;
  remaining?: number;
}

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = async () => {
    const snapshot = await getDocs(collection(db, "history"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Sale[];
    setSales(data);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const totalProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

  const exportCSV = () => {
    if (sales.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const headers = ["Item Name", "Quantity Sold", "Selling Price", "Profit", "Date", "Remaining Stock"];
    const rows = sales.map((s) => [
      s.itemName ?? "",
      s.quantity?.toString() ?? "0",
      s.sellingPrice?.toString() ?? "0",
      s.profit?.toString() ?? "0",
      s.date ? new Date(s.date).toLocaleString() : "",
      s.remaining !== undefined ? s.remaining.toString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully!");
  };

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6">📊 Sales Reports</h1>

      <div className="overflow-x-auto">
        {sales.length === 0 ? (
          <p className="text-gray-600">No sales recorded yet.</p>
        ) : (
          <>
            <table className="w-full border border-gray-300 text-left mb-4">
              <thead className="bg-gray-200">
                <tr className="text-black">
                  <th className="p-2">Item</th>
                  <th className="p-2">Qty Sold</th>
                  <th className="p-2">Selling Price</th>
                  <th className="p-2">Profit</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Remaining Stock</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-t">
                    <td className="p-2">{sale.itemName}</td>
                    <td className="p-2">{sale.quantity ?? 0}</td>
                    <td className="p-2">Rs {sale.sellingPrice ?? 0}</td>
                    <td className="p-2 text-green-700">Rs {sale.profit ?? 0}</td>
                    <td className="p-2">{sale.date ? new Date(sale.date).toLocaleString() : "-"}</td>
                    <td className="p-2">{sale.remaining ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-2 font-bold text-lg">Total Profit: Rs {totalProfit}</p>

            <button
              onClick={exportCSV}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export as CSV
            </button>
          </>
        )}
      </div>
    </div>
  );
}
