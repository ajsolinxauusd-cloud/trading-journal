export default function TradeList({ trades }) {
  return (
    <div>
      {trades.map((trade, index) => (
        <div key={index} className="bg-gray-800 p-4 mb-4 rounded-xl">

          <p className="font-semibold text-lg">{trade.asset}</p>

          <p>Entry: {trade.entry} | Exit: {trade.exit}</p>

          <p className={trade.profit >= 0 ? "text-green-400" : "text-red-400"}>
            Profit: {trade.profit}
          </p>

          <div className="mt-3 text-sm text-gray-300">
            <p><strong>Note:</strong> {trade.note}</p>
            <p><strong>Emotion:</strong> {trade.emotion}</p>
            <p><strong>Lesson:</strong> {trade.lesson}</p>
          </div>

        
          <p className="text-blue-400 text-sm mt-2">
            Tag: {trade.tag}
          </p>

        </div>
      ))}
    </div>
  );
}