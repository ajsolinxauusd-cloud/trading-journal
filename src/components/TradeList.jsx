export default function TradeList({ trades }) {
  return (
    <div>
      {trades.length === 0 && (
        <p className="text-gray-400">No trades yet</p>
      )}

      {trades.map((trade, index) => (
        <div key={index} className="bg-gray-800 p-4 mb-4 rounded-xl">

          {/* Asset */}
          <p className="text-lg font-semibold">{trade.asset}</p>

          {/* Buy / Sell */}
          <p
            className={
              trade.type === "Buy" ? "text-green-400" : "text-red-400"
            }
          >
            {trade.type}
          </p>

          {/* Prices */}
          <p>Entry: {trade.entry} | Exit: {trade.exit}</p>

          {/* Lot */}
          <p>Lot Size: {trade.lot}</p>

          {/* Profit */}
          <p
            className={
              trade.profit >= 0 ? "text-green-400" : "text-red-400"
            }
          >
            Profit: {trade.profit}
          </p>

          {/* Extra Info */}
          <div className="mt-3 text-sm text-gray-300">
            <p><strong>Note:</strong> {trade.note}</p>
            <p><strong>Emotion:</strong> {trade.emotion}</p>
            <p><strong>Lesson:</strong> {trade.lesson}</p>
            <p className="text-blue-400"><strong>Tag:</strong> {trade.tag}</p>
          </div>

        </div>
      ))}
    </div>
  );
}