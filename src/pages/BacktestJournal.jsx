import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function BacktestJournal() {

  const [entries, setEntries] = useState([]);

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
    const snapshot = await getDocs(collection(db, "backtests"));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEntries(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {

    if (!form.asset || !form.chartLink || !form.tag || !form.lesson) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "backtests"), {
      kind: "backtest",   // 🔥 IMPORTANT FIX

      asset: form.asset,
      chartLink: form.chartLink,
      tag: form.tag,
      lesson: form.lesson,

      createdAt: new Date().toISOString(),
    });

    setForm({
      asset: "",
      chartLink: "",
      tag: "",
      lesson: "",
    });

    fetchEntries();
  };

  return (
    <div className="text-white">

      <h1 className="text-4xl font-bold mb-6">Backtest Journal</h1>

      <div className="bg-gray-900 p-6 rounded-2xl space-y-4 mb-8">

        <input name="asset" value={form.asset} onChange={handleChange} placeholder="Asset" className="w-full p-3 bg-black border border-gray-700 rounded-lg" />

        <input name="chartLink" value={form.chartLink} onChange={handleChange} placeholder="Chart Link" className="w-full p-3 bg-black border border-gray-700 rounded-lg" />

        <input name="tag" value={form.tag} onChange={handleChange} placeholder="Tag" className="w-full p-3 bg-black border border-gray-700 rounded-lg" />

        <textarea name="lesson" value={form.lesson} onChange={handleChange} placeholder="Lesson" className="w-full p-3 bg-black border border-gray-700 rounded-lg h-40" />

        <button onClick={handleSave} className="w-full bg-green-600 p-3 rounded-lg">
          Save Backtest
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-4">
        {entries.map((e) => (
          <div key={e.id} className="bg-gray-900 p-5 rounded-xl">
            <h2 className="text-xl font-bold">{e.asset}</h2>
            <p className="text-blue-400">{e.tag}</p>
            <a className="text-blue-500 underline" href={e.chartLink} target="_blank">Chart</a>
            <p className="mt-2 text-gray-300">{e.lesson}</p>
          </div>
        ))}
      </div>

    </div>
  );
}