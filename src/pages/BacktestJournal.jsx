import { useState, useEffect } from "react";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

export default function BacktestJournal() {

  const [entries, setEntries] =
    useState([]);

  const [form, setForm] =
    useState({
      asset: "",
      chartLink: "",
      tag: "",
      lesson: "",
    });

  // ✅ FETCH ENTRIES
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {

    const snapshot = await getDocs(
      collection(db, "backtests")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEntries(data);

  };

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // ✅ SAVE BACKTEST
  const handleSave = async () => {

    // VALIDATION
    if (
      !form.asset ||
      !form.chartLink ||
      !form.tag ||
      !form.lesson
    ) {
      alert("Fill all fields");
      return;
    }

    await addDoc(
      collection(db, "backtests"),
      {
        ...form,
        createdAt: new Date(),
      }
    );

    // RESET FORM
    setForm({
      asset: "",
      chartLink: "",
      tag: "",
      lesson: "",
    });

    // REFRESH
    fetchEntries();

    alert("Backtest saved!");

  };

  return (

    <div className="text-white">

      <h1 className="text-4xl font-bold mb-6">
        Backtest Journal
      </h1>

      {/* ✅ FORM */}
      <div className="
        bg-gray-900
        p-6
        rounded-2xl
        space-y-4
        mb-8
      ">

        <input
          type="text"
          name="asset"
          placeholder="Asset"
          value={form.asset}
          onChange={handleChange}
          className="
            w-full
            p-3
            rounded-lg
            bg-black
            border
            border-gray-700
          "
        />

        <input
          type="text"
          name="chartLink"
          placeholder="Chart Link"
          value={form.chartLink}
          onChange={handleChange}
          className="
            w-full
            p-3
            rounded-lg
            bg-black
            border
            border-gray-700
          "
        />

        <input
          type="text"
          name="tag"
          placeholder="Tag"
          value={form.tag}
          onChange={handleChange}
          className="
            w-full
            p-3
            rounded-lg
            bg-black
            border
            border-gray-700
          "
        />

        <textarea
          name="lesson"
          placeholder="Lesson"
          value={form.lesson}
          onChange={handleChange}
          className="
            w-full
            p-3
            rounded-lg
            bg-black
            border
            border-gray-700
            h-40
          "
        />

        {/* ✅ SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="
            w-full
            bg-green-600
            hover:bg-green-700
            p-3
            rounded-lg
            font-bold
            transition
          "
        >
          Save Backtest
        </button>

      </div>

      {/* ✅ SAVED ENTRIES */}
      <div className="space-y-4">

        {entries.length === 0 && (

          <div className="
            bg-gray-900
            p-6
            rounded-2xl
            text-gray-400
          ">
            No backtests saved yet.
          </div>

        )}

        {entries.map((entry) => (

          <div
            key={entry.id}
            className="
              bg-gray-900
              p-6
              rounded-2xl
            "
          >

            <div className="
              flex
              justify-between
              items-center
              mb-4
            ">

              <h2 className="text-2xl font-bold">
                {entry.asset}
              </h2>

              <span className="
                bg-blue-600
                px-3
                py-1
                rounded-full
                text-sm
              ">
                {entry.tag}
              </span>

            </div>

            <a
              href={entry.chartLink}
              target="_blank"
              rel="noreferrer"
              className="
                text-blue-400
                underline
                break-all
              "
            >
              View Chart
            </a>

            <div className="mt-4">

              <p className="
                text-gray-400
                mb-2
              ">
                Lesson
              </p>

              <p className="
                bg-black
                p-4
                rounded-xl
                whitespace-pre-wrap
              ">
                {entry.lesson}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}