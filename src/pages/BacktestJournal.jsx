import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function BacktestJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    asset: "",
    chartLink: "",
    tag: "",
    lesson: "",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "backtests"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(data);
    } catch (error) {
      console.error("Error fetching backtests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in");
      return;
    }

    if (!form.asset || !form.chartLink || !form.tag || !form.lesson) {
      alert("Please fill all fields (Asset, Chart Link, Tag, Lesson)");
      return;
    }

    try {
      await addDoc(collection(db, "backtests"), {
        kind: "backtest",
        userId: auth.currentUser.uid,
        asset: form.asset,
        chartLink: form.chartLink,
        tag: form.tag,
        lesson: form.lesson,
        date: new Date().toLocaleDateString("en-CA"),
        createdAt: new Date().toISOString(),
      });

      // Reset form
      setForm({
        asset: "",
        chartLink: "",
        tag: "",
        lesson: "",
      });

      // Refresh entries
      await fetchEntries();
      
      alert("Backtest saved successfully!");
    } catch (error) {
      console.error("Error saving backtest:", error);
      alert("Error saving backtest: " + error.message);
    }
  };

  if (loading) {
    return <div className="text-white">Loading backtests...</div>;
  }

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-6">Backtest Journal</h1>

      <div className="bg-gray-900 p-6 rounded-2xl space-y-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">Add Backtest Entry</h2>
        
        <input 
          name="asset" 
          value={form.asset} 
          onChange={handleChange} 
          placeholder="Asset *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
          required
        />

        <input 
          name="chartLink" 
          value={form.chartLink} 
          onChange={handleChange} 
          placeholder="Chart Link (TradingView URL) *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
          required
        />

        <input 
          name="tag" 
          value={form.tag} 
          onChange={handleChange} 
          placeholder="Tag (e.g., BTC Setup, EURUSD Pattern) *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
          required
        />

        <textarea 
          name="lesson" 
          value={form.lesson} 
          onChange={handleChange} 
          placeholder="Lesson learned from this backtest *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white h-40"
          required
        />

        <button 
          onClick={handleSave} 
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-semibold"
        >
          Save Backtest
        </button>
      </div>

      {/* List of Backtest Entries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Backtest History</h2>
        {entries.length === 0 ? (
          <p className="text-gray-400">No backtest entries yet. Add your first backtest above!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-gray-900 p-5 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-bold">{entry.asset}</h2>
                  <p className="text-gray-400 text-sm">{entry.date}</p>
                </div>
                <p className="text-blue-400 font-semibold">{entry.tag}</p>
              </div>
              
              <a 
                href={entry.chartLink} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-500 underline inline-block mb-3"
              >
                View Chart →
              </a>
              
              <p className="mt-2 text-gray-300 whitespace-pre-line">{entry.lesson}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}