const EXCHANGE_INFO_URL = "https://api2.binance.com/api/v3/exchangeInfo";

export const fetchAllTickers = () => {
  const tickers = fetch(EXCHANGE_INFO_URL)
    .then((res) => res.json())
    .then((data) => data.symbols)
    .then((tickers) =>
      tickers.map((symbolInfo) => ({
        baseAsset: symbolInfo.baseAsset,
        quoteAsset: symbolInfo.quoteAsset,
        name: symbolInfo.symbol,
      }))
    );

  return tickers;
};

const tickersHandlers = new Map();

const WS_URL = "wss://stream.binance.com:443/ws";
const socket = new WebSocket(WS_URL);

socket.addEventListener("message", (e) => {
  const { s: symbolName, p: newPrice } = JSON.parse(e.data);
  if (newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(symbolName.toLowerCase()) ?? [];
  handlers.forEach((cb) => cb(newPrice));
});

const sendMessageToWS = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  // Has the socket already been opened?
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener("open", () => socket.send(stringifiedMessage), {
    once: true,
  });
};

const subscribeToTickerOnWS = (tickerName) => {
  sendMessageToWS({
    method: "SUBSCRIBE",
    params: [`${tickerName}@trade`],
    id: 1,
  });
};
const unsubscribeFromTickerOnWS = (tickerName) => {
  sendMessageToWS({
    method: "UNSUBSCRIBE",
    params: [`${tickerName}@trade`],
    id: 312,
  });
};

export const subscribeToTicker = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) ?? [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
  subscribeToTickerOnWS(tickerName);
};
export const unsubscribeToTicker = (tickerName) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromTickerOnWS(tickerName);
};
