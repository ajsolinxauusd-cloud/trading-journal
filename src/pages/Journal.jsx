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

  const initialForm = {
    asset: "",
    type: "Buy",

    entry: "",
    exit: "",

    stopLoss: "",
    takeProfit: "",

    lot: "",

    rr: "",
    profit: "",

    tag: "",

    lesson: "",

    screenshot: "",

    date:
      new Date()
        .toISOString()
        .split("T")[0],
  };

  const [form, setForm] =
    useState(initialForm);

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

  // ✅ INPUT
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

    const entry =
      Number(form.entry);

    const exit =
      Number(form.exit);

    const stopLoss =
      Number(form.stopLoss);

    const takeProfit =
      Number(form.takeProfit);

    const lot =
      Number(form.lot);

    // ✅ PROFIT
    let profit = 0;

    if (form.type === "Buy") {

      profit =
        (exit - entry) * lot;

    } else {

      profit =
        (entry - exit) * lot;

    }

    // ✅ RISK
    const risk =
      Math.abs(
        entry - stopLoss
      ) * lot;

    // ✅ REWARD
    const reward =
      Math.abs(
        takeProfit - entry
      ) * lot;

    // ✅ RR
    const rr =
      risk > 0
        ? (
            reward / risk
          ).toFixed(2)
        : 0;

    await addDoc(
      collection(db, "trades"),
      {
        ...form,

        entry,
        exit,

        stopLoss,
        takeProfit,

        lot,

        profit:
          Number(
            profit.toFixed(2)
          ),

        rr: Number(rr),
      }
    );

    setForm(initialForm);

    fetchTrades();

  };

  return (

    <div>

      <h1 className="
        text-5xl
        font-bold
        mb-8
      ">
        Journal
      </h1>

      {/* ====================== */}
      {/* FORM */}
      {/* ====================== */}

      <form
        onSubmit={handleSubmit}
        className="
          bg-gray-900
          p-6
          rounded-2xl
          mb-8
        "
      >

        <div className="
          grid
          md:grid-cols-2
          gap-4
        ">

          {/* ASSET */}
          <input
            type="text"
            name="asset"
            placeholder="Asset"
            value={form.asset}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
            required
          />

          {/* TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
          >
            <option value="Buy">
              Buy
            </option>

            <option value="Sell">
              Sell
            </option>

          </select>

          {/* ENTRY */}
          <input
            type="number"
            name="entry"
            placeholder="Entry"
            value={form.entry}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
            required
          />

          {/* EXIT */}
          <input
            type="number"
            name="exit"
            placeholder="Exit"
            value={form.exit}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
            required
          />

          {/* STOP LOSS */}
          <input
            type="number"
            name="stopLoss"
            placeholder="Stop Loss"
            value={form.stopLoss}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
            required
          />

          {/* TAKE PROFIT */}
          <input
            type="number"
            name="takeProfit"
            placeholder="Take Profit"
            value={form.takeProfit}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
            required
          />

          {/* LOT */}
          <input
            type="number"
            name="lot"
            placeholder="Lot Size"
            value={form.lot}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
            required
          />

          {/* TAG */}
          <input
            type="text"
            name="tag"
            placeholder="Tag (Breakout / Scalping)"
            value={form.tag}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
          />

          {/* SCREENSHOT */}
          <input
            type="text"
            name="screenshot"
            placeholder="Chart Link / Screenshot URL"
            value={form.screenshot}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
          />

          {/* DATE */}
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="
              p-3
              rounded-lg
              bg-black
              border
              border-gray-700
            "
          />

        </div>

        {/* LESSON */}
        <textarea
          name="lesson"
          placeholder="Lesson learned..."
          value={form.lesson}
          onChange={handleChange}
          className="
            w-full
            mt-4
            p-3
            rounded-lg
            bg-black
            border
            border-gray-700
            min-h-[120px]
          "
        />

        {/* BUTTON */}
        <button
          type="submit"
          className="
            mt-4
            w-full
            bg-green-600
            hover:bg-green-700
            p-3
            rounded-lg
            font-semibold
          "
        >
          Save Trade
        </button>

      </form>

      {/* ====================== */}
      {/* TRADE HISTORY */}
      {/* ====================== */}

      <div className="space-y-4">

        {trades.map((trade) => (

          <div
            key={trade.id}
            className="
              bg-gray-900
              p-5
              rounded-2xl
            "
          >

            <div className="
              flex
              justify-between
              items-center
              mb-4
            ">

              <h2 className="
                text-2xl
                font-bold
              ">
                {trade.asset}
              </h2>

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
              gap-3
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

              <p>
                Take Profit:
                {" "}
                {trade.takeProfit}
              </p>

              <p>
                Lot:
                {" "}
                {trade.lot}
              </p>

              <p>
                R:R:
                {" "}
                {trade.rr}
              </p>

            </div>

            <p
              className={
                Number(trade.profit) >= 0
                  ? "text-green-400 font-bold mt-3"
                  : "text-red-400 font-bold mt-3"
              }
            >
              Profit:
              {" "}
              $
              {Number(
                trade.profit
              ).toFixed(2)}
            </p>

            {/* TAG */}
            {trade.tag && (

              <p className="mt-2">

                <span className="
                  text-blue-400
                  font-semibold
                ">
                  Tag:
                </span>

                {" "}
                {trade.tag}

              </p>

            )}

            {/* LESSON */}
            {trade.lesson && (

              <p className="mt-2">

                <span className="
                  text-yellow-400
                  font-semibold
                ">
                  Lesson:
                </span>

                {" "}
                {trade.lesson}

              </p>

            )}

            {/* SCREENSHOT */}
            {trade.screenshot && (

              <div className="mt-4">

                <a
                  href={trade.screenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    text-blue-400
                    underline
                  "
                >
                  View Chart
                </a>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}