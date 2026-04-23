import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Insights() {
  const [trades, setTrades] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTrades = async () => {
      const snapshot = await getDocs(collection(db, "trades"));
      const data = snapshot.docs.map(doc => doc.data());
      setTrades(data);
    };

    fetchTrades();
  }, []);

  // 🔎 FILTER LESSONS
  const filteredTrades = trades.filter((t) =>
    t.lesson?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl mb-6">Insights</h1>

      {/* Search */}
      <input
        placeholder="Search lessons..."
        className="p-2 text-black w-full mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Insights List */}
      {filteredTrades.map((trade, index) => (
        <div key={index} className="bg-gray-800 p-4 mb-4 rounded-xl">
          <p className="text-lg font-semibold">{trade.asset}</p>

          <p className="text-sm text-gray-400 mb-2">
            Emotion: {trade.emotion}
          </p>

          <p><strong>Lesson:</strong> {trade.lesson}</p>
        </div>
      ))}
    </div>
  );
}