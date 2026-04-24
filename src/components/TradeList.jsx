export default function TradeList({ trades }) {
  const grouped = trades.reduce((acc, trade) => {
    const date = trade.date || "No Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(trade);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([date, tradesOnDate]) => (
        <div key={date} className="mb-6">

          <h2 className="text-xl mb-2 text-gray-300">{date}</h2>

          {tradesOnDate.map((trade, index) => (

            trade.kind === "withdrawal" ? (

              <div key={index} className="bg-yellow-700 p-4 mb-2 rounded-xl">
                <p className="font-semibold">Withdrawal</p>
                <p className="text-red-300">Amount: -{trade.amount}</p>
              </div>

            ) : (

              <div key={index} className="bg-gray-800 p-4 mb-2 rounded-xl">

                <p className="font-semibold">{trade.asset}</p>

                <p className={trade.type === "Buy" ? "text-green-400" : "text-red-400"}>
                  {trade.type}
                </p>

                <p>Entry: {trade.entry} | Exit: {trade.exit}</p>
                <p>Lot: {trade.lot}</p>

                <p className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
                  Profit: {trade.profit}
                </p>

                <p>Risk: {trade.risk}</p>
                <p>R:R: {trade.rr}</p>

              </div>

            )

          ))}

        </div>
      ))}
    </div>
  );
}