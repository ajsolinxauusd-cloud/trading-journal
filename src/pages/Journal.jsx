import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

export default function Journal() {

  const [trades, setTrades] =
    useState([]);

  const [form, setForm] =
    useState({
      asset: "",
      type: "Buy",
      entry: "",
      exit: "",
      stopLoss: "",
      takeProfit: "",
      rr: "",
      profit: "",
      tag: "",
      lesson: "",
      screenshot: "",
      date:
        new Date().toLocaleDateString(
          "en-CA"
        ),
    });

  useEffect(() => {
    fetchTrades();
  }, []);

  // ✅ FETCH
  const fetchTrades = async () => {

    const snapshot = await getDocs(
      collection(db, "trades")
    );

    const data = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (t) =>
          t.kind !== "withdrawal" &&
          t.kind !== "deposit"
      );

    setTrades(data.reverse());

  };

  // ✅ HANDLE INPUT
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

  };

  // ✅ SAVE TRADE
  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    await addDoc(
      collection(db, "trades"),
      {
        ...form,
        profit: Number(
          form.profit
        ),
        rr: Number(form.rr),
        entry: Number(
          form.entry
        ),
        exit: Number(
          form.exit
        ),
        stopLoss: Number(
          form.stopLoss
        ),
        takeProfit: Number(
          form.takeProfit
        ),
      }
    );

    setForm({
      asset: "",
      type: "Buy",
      entry: "",
      exit: "",
      stopLoss: "",
      takeProfit: "",
      rr: "",
      profit: "",
      tag: "",
      lesson: "",
      screenshot: "",
      date:
        new Date().toLocaleDateString(
          "en-CA"
        ),
    });

    fetchTrades();

  };

  return (

    <div>

      <h1 className="text-4xl font-bold mb-6">
        Trading Journal
      </h1>

      {/* ======================= */}
      {/* ✅ FORM */}
      {/* ======================= */}

      <form
        onSubmit={handleSubmit}
        className="
          bg-gray-900
          p-6
          rounded-2xl
          mb-8
          grid
          md:grid-cols-2
          gap-4
        "
      >

        <input
          name="asset"
          placeholder="Asset"
          value={form.asset}
          onChange={handleChange}
          className="input"
          required
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="input"
        >
          <option>
            Buy
          </option>

          <option>
            Sell
          </option>
        </select>

        <input
          name="entry"
          type="number"
          placeholder="Entry"
          value={form.entry}
          onChange={handleChange}
          className="input"
        />

        <input
          name="exit"
          type="number"
          placeholder="Exit"
          value={form.exit}
          onChange={handleChange}
          className="input"
        />

        <input
          name="stopLoss"
          type="number"
          placeholder="Stop Loss"
          value={form.stopLoss}
          onChange={handleChange}
          className="input"
        />

        {/* ✅ TAKE PROFIT */}
        <input
          name="takeProfit"
          type="number"
          placeholder="Take Profit"
          value={form.takeProfit}
          onChange={handleChange}
          className="input"
        />

        <input
          name="rr"
          type="number"
          step="0.01"
          placeholder="R:R"
          value={form.rr}
          onChange={handleChange}
          className="input"
        />

        <input
          name="profit"
          type="number"
          step="0.01"
          placeholder="Profit"
          value={form.profit}
          onChange={handleChange}
          className="input"
        />

        {/* ✅ TAG */}
        <input
          name="tag"
          placeholder="Tag (Scalp, Breakout...)"
          value={form.tag}
          onChange={handleChange}
          className="input"
        />

        <input
          name="screenshot"
          placeholder="Chart Screenshot URL"
          value={form.screenshot}
          onChange={handleChange}
          className="input"
        />

        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="lesson"
          placeholder="Lesson"
          value={form.lesson}
          onChange={handleChange}
          className="
            input
            md:col-span-2
            min-h-[120px]
          "
        />

        <button
          type="submit"
          className="
            bg-green-600
            hover:bg-green-700
            p-3
            rounded-xl
            font-bold
            md:col-span-2
          "
        >
          Save Trade
        </button>

      </form>

      {/* ======================= */}
      {/* ✅ TRADE LIST */}
      {/* ======================= */}

      <div className="space-y-4">

        {trades.map((trade) => (

          <div
            key={trade.id}
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

              <div>

                <h2 className="text-2xl font-bold">
                  {trade.asset}
                </h2>

                <p className="text-gray-400">
                  {trade.date}
                </p>

              </div>

              <span
                className={
                  trade.type === "Buy"
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {trade.type}
              </span>

            </div>

            <div className="
              grid
              md:grid-cols-3
              gap-4
            ">

              <p>
                Entry:
                {" "}
                {trade.entry}
              </p>

              <p>
                Exit:
                {" "}
                {trade.exit}
              </p>

              <p>
                Stop Loss:
                {" "}
                {trade.stopLoss}
              </p>

              {/* ✅ TP */}
              <p>
                Take Profit:
                {" "}
                {trade.takeProfit}
              </p>

              <p>
                R:R:
                {" "}
                {trade.rr}
              </p>

              <p
                className={
                  Number(
                    trade.profit
                  ) >= 0
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                Profit:
                {" "}
                $
                {Number(
                  trade.profit
                ).toFixed(2)}
              </p>

              {/* ✅ TAG */}
              <p>
                Tag:
                {" "}
                <span className="text-blue-400">
                  {trade.tag}
                </span>
              </p>

            </div>

            {/* ✅ LESSON */}
            {trade.lesson && (

              <div className="mt-4">

                <p className="
                  text-gray-400
                  mb-1
                ">
                  Lesson
                </p>

                <p>
                  {trade.lesson}
                </p>

              </div>

            )}

            {/* ✅ SCREENSHOT */}
            {trade.screenshot && (

              <div className="mt-4">

                <a
                  href={
                    trade.screenshot
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    text-blue-400
                    underline
                  "
                >
                  View Chart
                </a>

                <img
                  src={
                    trade.screenshot
                  }
                  alt="chart"
                  className="
                    mt-3
                    rounded-xl
                    border
                    border-gray-700
                    max-h-96
                  "
                />

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}