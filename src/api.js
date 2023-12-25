export const fetchTickers = () => {
  const tickers = fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  )
    .then((res) => res.json())
    .then((rawData) => rawData.Data)
    .then((tickerList) => Object.keys(tickerList));

  return tickers;
};

export const fetchSymbolsFromBinance = () => {
  const symbols = fetch("https://api2.binance.com/api/v3/exchangeInfo")
    .then((res) => res.json())
    .then((data) => data.symbols)
    .then((symbols) =>
      symbols.map((symbolInfo) => ({
        baseAsset: symbolInfo.baseAsset,
        quoteAsset: symbolInfo.quoteAsset,
        symbol: symbolInfo.symbol,
      }))
    );

  return symbols;
};

const tickersHandlers = new Map();

export const subscribeToTicker = (ticker, cb) => {
  const socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${ticker}@trade`
  );

  cb.socket = socket;

  const subscribers = tickersHandlers.get(ticker) ?? [];
  tickersHandlers.set(ticker, [...subscribers, cb]);

  socket.addEventListener("message", (e) => {
    const { p: newPrice } = JSON.parse(e.data);

    if (newPrice === undefined) return;

    const handlers = tickersHandlers.get(ticker) ?? [];

    handlers.forEach((fn) => fn(newPrice));
  });
};

export const unsubscribeFromTickerOnWS = (ticker) => {
  const subscribers = tickersHandlers.get(ticker) ?? [];

  tickersHandlers.delete(ticker);
  subscribers.forEach((cb) => {
    const socket = cb.socket;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  });
};
