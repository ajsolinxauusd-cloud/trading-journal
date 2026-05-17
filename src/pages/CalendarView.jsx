import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { db } from "../firebase";

import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function CalendarView() {

  const [trades, setTrades] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  useEffect(() => {
    fetchTrades();
  }, []);

  // ✅ FETCH TRADES
  const fetchTrades = async () => {

    const snapshot = await getDocs(
      collection(db, "trades")
    );

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTrades(data);
  };

  // ✅ LOCAL DEVICE DATE
  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA");
  };

  const selected =
    formatDate(selectedDate);

  // =========================
  // ✅ DAY TRADES
  // =========================

  const tradesForDay = trades.filter(
    (t) =>
      t.date === selected &&
      t.kind !== "withdrawal" &&
      t.kind !== "deposit"
  );

  // =========================
  // ✅ DAY STATS
  // =========================

  const totalProfit =
    tradesForDay.reduce(
      (sum, t) =>
        sum + Number(t.profit || 0),
      0
    );

  const totalTrades =
    tradesForDay.length;

  const wins =
    tradesForDay.filter(
      (t) => Number(t.profit) > 0
    ).length;

  const winRate =
    totalTrades > 0
      ? (
          (wins / totalTrades) *
          100
        ).toFixed(1)
      : 0;

  // ✅ RR (ONLY WINS)
  const winningTrades =
    tradesForDay.filter(
      (t) => Number(t.profit) > 0
    );

  const avgRR =
    winningTrades.length > 0
      ? (
          winningTrades.reduce(
            (sum, t) =>
              sum + Number(t.rr || 0),
            0
          ) / winningTrades.length
        ).toFixed(2)
      : 0;

  // =========================
  // ✅ MONTH TRADES
  // =========================

  const monthTrades = trades.filter(
    (t) => {

      if (
        t.kind === "withdrawal" ||
        t.kind === "deposit"
      ) {
        return false;
      }

      const tradeDate =
        new Date(t.date);

      return (
        tradeDate.getMonth() ===
        selectedMonth
      );
    }
  );

  // =========================
  // ✅ MONTH PROFIT
  // =========================

  const monthProfit =
    monthTrades.reduce(
      (sum, t) =>
        sum + Number(t.profit || 0),
      0
    );

  // =========================
  // ✅ MONTH WITHDRAWALS
  // =========================

  const monthWithdrawals =
    trades
      .filter((t) => {

        if (
          t.kind !== "withdrawal"
        ) {
          return false;
        }

        const tradeDate =
          new Date(t.date);

        return (
          tradeDate.getMonth() ===
          selectedMonth
        );

      })
      .reduce(
        (sum, t) =>
          sum + Number(t.amount || 0),
        0
      );

  // =========================
  // ✅ MONTH DEPOSITS
  // =========================

  const monthDeposits =
    trades
      .filter((t) => {

        if (
          t.kind !== "deposit"
        ) {
          return false;
        }

        const tradeDate =
          new Date(t.date);

        return (
          tradeDate.getMonth() ===
          selectedMonth
        );

      })
      .reduce(
        (sum, t) =>
          sum + Number(t.amount || 0),
        0
      );

  // =========================
  // ✅ WEEKLY PROFITS
  // =========================

  const weeklyProfits = {};

  monthTrades.forEach((trade) => {

    const day =
      new Date(trade.date).getDate();

    const week =
      Math.ceil(day / 7);

    if (!weeklyProfits[week]) {
      weeklyProfits[week] = 0;
    }

    weeklyProfits[week] +=
      Number(trade.profit || 0);

  });

  // =========================
  // ✅ WEEKLY WITHDRAWALS
  // =========================

  const weeklyWithdrawals = {};

  trades
    .filter((t) => {

      if (
        t.kind !== "withdrawal"
      ) {
        return false;
      }

      const tradeDate =
        new Date(t.date);

      return (
        tradeDate.getMonth() ===
        selectedMonth
      );

    })
    .forEach((trade) => {

      const day =
        new Date(trade.date).getDate();

      const week =
        Math.ceil(day / 7);

      if (
        !weeklyWithdrawals[week]
      ) {
        weeklyWithdrawals[week] = 0;
      }

      weeklyWithdrawals[week] +=
        Number(trade.amount || 0);

    });

  // =========================
  // ✅ WEEKLY DEPOSITS
  // =========================

  const weeklyDeposits = {};

  trades
    .filter((t) => {

      if (
        t.kind !== "deposit"
      ) {
        return false;
      }

      const tradeDate =
        new Date(t.date);

      return (
        tradeDate.getMonth() ===
        selectedMonth
      );

    })
    .forEach((trade) => {

      const day =
        new Date(trade.date).getDate();

      const week =
        Math.ceil(day / 7);

      if (
        !weeklyDeposits[week]
      ) {
        weeklyDeposits[week] = 0;
      }

      weeklyDeposits[week] +=
        Number(trade.amount || 0);

    });

  // =========================
  // ✅ CALENDAR COLORS
  // =========================

  const tileClassName = ({
    date,
    view,
  }) => {

    if (view !== "month") {
      return "";
    }

    const d =
      formatDate(date);

    const dayTrades =
      trades.filter(
        (t) =>
          t.date === d &&
          t.kind !== "withdrawal" &&
          t.kind !== "deposit"
      );

    if (!dayTrades.length) {
      return "";
    }

    const profit =
      dayTrades.reduce(
        (sum, t) =>
          sum +
          Number(t.profit || 0),
        0
      );

    if (profit > 0) {
      return "profit-day";
    }

    if (profit < 0) {
      return "loss-day";
    }

    return "";
  };

  return (
    <div>

      <h1 className="text-4xl font-bold mb-6">
        Calendar
      </h1>

      {/* ========================= */}
      {/* ✅ MONTH SELECTOR */}
      {/* ========================= */}

      <div className="card p-4 mb-6 flex justify-between items-center">

        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(
              Number(e.target.value)
            )
          }
          className="w-52"
        >
          <option value={0}>January</option>
          <option value={1}>February</option>
          <option value={2}>March</option>
          <option value={3}>April</option>
          <option value={4}>May</option>
          <option value={5}>June</option>
          <option value={6}>July</option>
          <option value={7}>August</option>
          <option value={8}>September</option>
          <option value={9}>October</option>
          <option value={10}>November</option>
          <option value={11}>December</option>
        </select>

        <div className="text-right">

          <p className="text-gray-400 text-sm">
            Month Profit
          </p>

          <p
            className={
              monthProfit >= 0
                ? "text-green-400 text-3xl font-bold"
                : "text-red-400 text-3xl font-bold"
            }
          >
            ${monthProfit.toFixed(2)}
          </p>

        </div>

      </div>

      {/* ========================= */}
      {/* ✅ MONTH STATS */}
      {/* ========================= */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="card p-4">

          <p className="text-gray-400">
            Monthly Profit
          </p>

          <p className="text-green-400 text-2xl font-bold">
            ${monthProfit.toFixed(2)}
          </p>

        </div>

        <div className="card p-4">

          <p className="text-gray-400">
            Monthly Withdrawals
          </p>

          <p className="text-red-400 text-2xl font-bold">
            ${monthWithdrawals.toFixed(2)}
          </p>

        </div>

        <div className="card p-4">

          <p className="text-gray-400">
            Monthly Deposits
          </p>

          <p className="text-blue-400 text-2xl font-bold">
            ${monthDeposits.toFixed(2)}
          </p>

        </div>

      </div>

      {/* ========================= */}
      {/* ✅ WEEKLY BREAKDOWN */}
      {/* ========================= */}

      <div className="card p-5 mb-6">

        <h2 className="text-2xl font-bold mb-4">
          Weekly Breakdown
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {[1, 2, 3, 4, 5].map((week) => (

            <div
              key={week}
              className="bg-gray-800 p-4 rounded-xl"
            >

              <h3 className="font-bold mb-3">
                Week {week}
              </h3>

              <div className="space-y-2">

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Profit
                  </span>

                  <span className="text-green-400 font-bold">
                    $
                    {(
                      weeklyProfits[
                        week
                      ] || 0
                    ).toFixed(2)}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Withdrawals
                  </span>

                  <span className="text-red-400 font-bold">
                    $
                    {(
                      weeklyWithdrawals[
                        week
                      ] || 0
                    ).toFixed(2)}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Deposits
                  </span>

                  <span className="text-blue-400 font-bold">
                    $
                    {(
                      weeklyDeposits[
                        week
                      ] || 0
                    ).toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ========================= */}
      {/* ✅ CALENDAR */}
      {/* ========================= */}

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      {/* ========================= */}
      {/* ✅ DAY DETAILS */}
      {/* ========================= */}

      <div className="card p-6 mt-6">

        <h2 className="text-2xl font-bold mb-6">
          {selected}
        </h2>

        <div className="grid md:grid-cols-4 gap-4 mb-6">

          <div>

            <p className="text-gray-400">
              Total Profit
            </p>

            <p
              className={
                totalProfit >= 0
                  ? "text-green-400 text-2xl font-bold"
                  : "text-red-400 text-2xl font-bold"
              }
            >
              ${totalProfit.toFixed(2)}
            </p>

          </div>

          <div>

            <p className="text-gray-400">
              Trades
            </p>

            <p className="text-2xl font-bold">
              {totalTrades}
            </p>

          </div>

          <div>

            <p className="text-gray-400">
              Win Rate
            </p>

            <p className="text-2xl font-bold">
              {winRate}%
            </p>

          </div>

          <div>

            <p className="text-gray-400">
              Avg R:R (Wins)
            </p>

            <p className="text-2xl font-bold">
              {avgRR}
            </p>

          </div>

        </div>

        {/* ========================= */}
        {/* ✅ TRADES */}
        {/* ========================= */}

        {tradesForDay.length === 0 && (
          <p className="text-gray-500">
            No trades for this day.
          </p>
        )}

        {tradesForDay.map(
          (trade, index) => (

            <div
              key={index}
              className="bg-gray-800 p-5 rounded-xl mb-4"
            >

              <div className="flex justify-between items-center mb-3">

                <h3 className="text-xl font-bold">
                  {trade.asset}
                </h3>

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

              <p className="mb-2">
                Entry: {trade.entry}
              </p>

              <p className="mb-2">
                Exit: {trade.exit}
              </p>

              <p
                className={
                  Number(trade.profit) >= 0
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                Profit: $
                {Number(
                  trade.profit || 0
                ).toFixed(2)}
              </p>

              {/* 📸 SCREENSHOT */}
              {trade.screenshot && (

                <div className="mt-4">

                  <a
                    href={trade.screenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline"
                  >
                    View Chart
                  </a>

                  <img
                    src={trade.screenshot}
                    alt="chart"
                    className="mt-3 rounded-xl max-h-72 border border-gray-700"
                  />

                </div>

              )}

            </div>

          )
        )}

      </div>

    </div>
  );
}