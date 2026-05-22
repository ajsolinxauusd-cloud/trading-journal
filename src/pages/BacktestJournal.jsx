import { useState } from "react";

export default function BacktestJournal() {

  const [form, setForm] = useState({
    asset: "",
    chartLink: "",
    tag: "",
    lesson: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  return (

    <div className="text-white">

      <h1 className="text-4xl font-bold mb-6">
        Backtest Journal
      </h1>

      <div className="bg-gray-900 p-6 rounded-2xl space-y-4">

        <input
          type="text"
          name="asset"
          placeholder="Asset"
          value={form.asset}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-black border border-gray-700"
        />

        <input
          type="text"
          name="chartLink"
          placeholder="Chart Link"
          value={form.chartLink}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-black border border-gray-700"
        />

        <input
          type="text"
          name="tag"
          placeholder="Tag"
          value={form.tag}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-black border border-gray-700"
        />

        <textarea
          name="lesson"
          placeholder="Lesson"
          value={form.lesson}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-black border border-gray-700 h-40"
        />

      </div>

    </div>

  );

}