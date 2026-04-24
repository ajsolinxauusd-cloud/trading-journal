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

          <h2 className="text-xl mb-2 text-gray-300">
            {date}
          </h2>

          {tradesOnDate.map((trade, index) => (
            <div key={index} className="bg-gray-800 p-4 mb-2 rounded-xl">

              <p className="text-lg font-semibold">{trade.asset}</p>

              <p className={trade.type === "Buy" ? "text-green-400" : "text-red-400"}>
                {trade.type}
              </p>

              <p>Entry: {trade.entry} | Exit: {trade.exit}</p>
              <p>Lot Size: {trade.lot}</p>

              <p className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
                Profit: {trade.profit}
              </p>

              <p>Risk: {trade.risk}</p>
              <p>R:R Ratio: {trade.rr}</p>

              <div className="mt-2 text-sm text-gray-300">
                <p><strong>Emotion:</strong> {trade.emotion}</p>
                <p><strong>Lesson:</strong> {trade.lesson}</p>
                <p className="text-blue-400"><strong>Tag:</strong> {trade.tag}</p>
              </div>

            </div>
          ))}
        </div>
      ))}
    </div>
  );
}