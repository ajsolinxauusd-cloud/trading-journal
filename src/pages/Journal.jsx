import { useEffect, useState } from "react";
import TradeForm from "../components/TradeForm";
import TradeList from "../components/TradeList";

import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Journal() {
  const [trades, setTrades] = useState([]);

  const tradesRef = collection(db, "trades");

  const loadTrades = async () => {
    const snapshot = await getDocs(tradesRef);
    const data = snapshot.docs.map(doc => doc.data());
    setTrades(data);
  };

  const addTrade = async (trade) => {
    await addDoc(tradesRef, trade);
    loadTrades();
  };
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-6">Trade Journal</h1>

      <TradeForm addTrade={addTrade} />
      <input
  placeholder="Filter by tag..."
  className="p-2 text-black mb-4 w-full"
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
/>
      <TradeList
  trades={trades.filter((t) =>
    t.tag?.toLowerCase().includes(filter.toLowerCase())
  )}
/>
    </div>
  );
}