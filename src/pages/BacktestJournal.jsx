import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function BacktestJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.log("No user logged in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get all backtests without filtering
      const q = query(
        collection(db, "backtests"),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched backtests:", data.length);
      setEntries(data);
    } catch (error) {
      console.error("Error fetching backtests:", error);
      alert("Error fetching: " + error.message);
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
      alert("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      
      const backtestData = {
        kind: "backtest",
        userId: auth.currentUser.uid,
        asset: form.asset,
        chartLink: form.chartLink,
        tag: form.tag,
        lesson: form.lesson,
        date: new Date().toLocaleDateString("en-CA"),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "backtests"), backtestData);

      setForm({
        asset: "",
        chartLink: "",
        tag: "",
        lesson: "",
      });

      await fetchEntries();
      alert("Backtest saved successfully!");
    } catch (error) {
      console.error("Error saving backtest:", error);
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this backtest?")) return;
    
    try {
      await deleteDoc(doc(db, "backtests", id));
      await fetchEntries();
      alert("Deleted!");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="text-white text-center py-12">
        <p>Please log in to view backtest journal</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-6">Backtest Journal</h1>

      {/* Form */}
      <div className="bg-gray-900 p-6 rounded-2xl space-y-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Backtest Entry</h2>
        
        <input 
          name="asset" 
          value={form.asset} 
          onChange={handleChange} 
          placeholder="Asset *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
        />

        <input 
          name="chartLink" 
          value={form.chartLink} 
          onChange={handleChange} 
          placeholder="Chart Link (TradingView URL) *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
        />

        <input 
          name="tag" 
          value={form.tag} 
          onChange={handleChange} 
          placeholder="Tag *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white"
        />

        <textarea 
          name="lesson" 
          value={form.lesson} 
          onChange={handleChange} 
          placeholder="Lesson learned *" 
          className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white h-32"
        />

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Backtest"}
        </button>
      </div>

      {/* Display Backtests */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Backtest History</h2>
          <button 
            onClick={fetchEntries} 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <p className="text-gray-400">No backtest entries yet</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-gray-900 p-5 rounded-xl relative">
              <button
                onClick={() => handleDelete(entry.id)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-300"
              >
                🗑️
              </button>
              
              <div className="mb-3">
                <h3 className="text-xl font-bold">{entry.asset || "No asset"}</h3>
                <p className="text-gray-400 text-sm">{formatDate(entry.date)}</p>
              </div>
              
              <div className="mb-3">
                <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-sm">
                  #{entry.tag || "No tag"}
                </span>
              </div>
              
              {entry.chartLink && (
                <a 
                  href={entry.chartLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-400 underline block mb-3"
                >
                  📊 View Chart
                </a>
              )}
              
              {entry.lesson && (
                <div className="mt-3 p-3 bg-black rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Lesson:</p>
                  <p className="text-gray-300">{entry.lesson}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}