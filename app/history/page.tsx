"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Sale {
  id: string;
  itemName: string;
  quantity: number; // total sold
  sellingPrice: number;
  profit: number;
  date?: string;
  lastSold?: string;
  remaining?: number;
}

export default function HistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const snapshot = await getDocs(collection(db, "history"));
      setSales(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[]
      );
    };
    fetchSales();
  }, []);

  const totalProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📜 Sales History</h1>
      {sales.length === 0 ? (
        <p className="text-gray-600">No sales recorded yet.</p>
      ) : (
        <>
          <table className="w-full border border-gray-300 text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-black">Item</th>
                <th className="p-2 text-black">Total Sold</th>
                <th className="p-2 text-black">Price</th>
                <th className="p-2 text-black">Profit</th>
                <th className="p-2 text-black">Remaining</th>
                <th className="p-2 text-black">Last Sold</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-2">{sale.itemName}</td>
                  <td className="p-2">{sale.quantity}</td>
                  <td className="p-2">Rs {sale.sellingPrice}</td>
                  <td className="p-2 text-green-700">Rs {sale.profit}</td>
                  <td className="p-2">{sale.remaining ?? "-"}</td>
                  <td className="p-2">
                    {sale.lastSold
                      ? new Date(sale.lastSold).toLocaleString()
                      : sale.date
                      ? new Date(sale.date).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-bold text-lg">
            Total Profit: Rs {totalProfit}
          </p>
        </>
      )}
    </div>
  );
}
