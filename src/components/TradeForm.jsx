import { useState } from "react";

export default function TradeForm({ addTrade }) {

  const initialState = {
    kind: "trade",
    date:
      new Date()
        .toISOString()
        .split("T")[0],

    asset: "",
    type: "Buy",

    entry: "",
    exit: "",

    lot: "",

    stopLoss: "",
    takeProfit: "",

    amount: "",

    screenshot: "",

    note: "",
    emotion: "",
    lesson: "",
    tag: "",
  };

  const [trade, setTrade] =
    useState(initialState);

  const handleSubmit = (e) => {

    e.preventDefault();

    // =========================
    // WITHDRAWAL
    // =========================

    if (
      trade.kind ===
      "withdrawal"
    ) {

      addTrade({
        ...trade,
        profit:
          -Math.abs(
            trade.amount
          ),
        type: "Withdrawal",
      });

      setTrade(initialState);

      return;

    }

    // =========================
    // TRADE CALCULATIONS
    // =========================

    let profit = 0;

    // BUY
    if (trade.type === "Buy") {

      profit =
        (trade.exit -
          trade.entry) *
        trade.lot;

    }

    // SELL
    else {

      profit =
        (trade.entry -
          trade.exit) *
        trade.lot;

    }

    // RISK
    const risk =
      Math.abs(
        trade.entry -
          trade.stopLoss
      ) * trade.lot;

    // RR USING TAKE PROFIT
    const reward =
      Math.abs(
        trade.takeProfit -
          trade.entry
      ) * trade.lot;

    const rr = risk
      ? (
          reward / risk
        ).toFixed(2)
      : 0;

    addTrade({
      ...trade,
      profit,
      risk,
      rr,
    });

    // RESET
    setTrade(initialState);

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="
        bg-gray-800
        p-4
        rounded-xl
        mb-6
      "
    >

      {/* MODE */}

      <select
        className="
          block
          mb-2
          p-2
          text-black
          w-full
        "
        value={trade.kind}
        onChange={(e) =>
          setTrade({
            ...trade,
            kind:
              e.target.value,
          })
        }
      >

        <option value="trade">
          Trade
        </option>

        <option value="withdrawal">
          Withdrawal
        </option>

      </select>

      {/* DATE */}

      <input
        type="date"
        className="
          block
          mb-2
          p-2
          text-black
          w-full
        "
        value={trade.date}
        onChange={(e) =>
          setTrade({
            ...trade,
            date:
              e.target.value,
          })
        }
      />

      {/* ========================= */}
      {/* WITHDRAWAL */}
      {/* ========================= */}

      {trade.kind ===
        "withdrawal" && (

        <input
          type="number"
          placeholder="Withdrawal Amount"
          className="
            block
            mb-2
            p-2
            text-black
            w-full
          "
          value={trade.amount}
          onChange={(e) =>
            setTrade({
              ...trade,
              amount:
                Number(
                  e.target.value
                ),
            })
          }
        />

      )}

      {/* ========================= */}
      {/* TRADE */}
      {/* ========================= */}

      {trade.kind ===
        "trade" && (

        <>

          {/* ASSET */}

          <input
            placeholder="Asset"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.asset}
            onChange={(e) =>
              setTrade({
                ...trade,
                asset:
                  e.target.value,
              })
            }
          />

          {/* BUY / SELL */}

          <select
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.type}
            onChange={(e) =>
              setTrade({
                ...trade,
                type:
                  e.target.value,
              })
            }
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
            placeholder="Entry"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.entry}
            onChange={(e) =>
              setTrade({
                ...trade,
                entry:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          {/* EXIT */}

          <input
            type="number"
            placeholder="Exit"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.exit}
            onChange={(e) =>
              setTrade({
                ...trade,
                exit:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          {/* LOT */}

          <input
            type="number"
            placeholder="Lot Size"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.lot}
            onChange={(e) =>
              setTrade({
                ...trade,
                lot:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          {/* STOP LOSS */}

          <input
            type="number"
            placeholder="Stop Loss"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.stopLoss}
            onChange={(e) =>
              setTrade({
                ...trade,
                stopLoss:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          {/* TAKE PROFIT */}

          <input
            type="number"
            placeholder="Take Profit"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={
              trade.takeProfit
            }
            onChange={(e) =>
              setTrade({
                ...trade,
                takeProfit:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

          {/* TAG */}

          <input
            type="text"
            placeholder="Tag"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={trade.tag}
            onChange={(e) =>
              setTrade({
                ...trade,
                tag:
                  e.target.value,
              })
            }
          />

          {/* LESSON */}

          <textarea
            placeholder="Lesson"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
              min-h-[100px]
            "
            value={trade.lesson}
            onChange={(e) =>
              setTrade({
                ...trade,
                lesson:
                  e.target.value,
              })
            }
          />

          {/* SCREENSHOT */}

          <input
            placeholder="Screenshot URL (TradingView / Drive)"
            className="
              block
              mb-2
              p-2
              text-black
              w-full
            "
            value={
              trade.screenshot
            }
            onChange={(e) =>
              setTrade({
                ...trade,
                screenshot:
                  e.target.value,
              })
            }
          />

        </>

      )}

      {/* BUTTON */}

      <button
        className="
          bg-white
          text-black
          px-4
          py-2
          mt-2
          w-full
          rounded-lg
          font-semibold
        "
      >
        Add Entry
      </button>

    </form>

  );

}