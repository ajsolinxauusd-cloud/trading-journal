import { useState } from "react";
import TradeForm from "../components/TradeForm";
import TradeList from "../components/TradeList";

export default function Journal() {
  const [trades, setTrades] = useState([]);

  const addTrade = (trade) => {
    setTrades([...trades, trade]);
  };

  return (
    <div>
      <h1 className="text-3xl mb-6">Trade Journal</h1>

      <TradeForm addTrade={addTrade} />
      <TradeList trades={trades} />
    </div>
  );
}