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

const socket = new WebSocket("wss://stream.binance.com:9443/ws");
const tickersHandlers = new Map();

socket.addEventListener("message", (e) => {
  const { s: symbolName, p: newPrice } = JSON.parse(e.data);
  if (newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(symbolName.toLowerCase()) ?? [];
  handlers.forEach((cb) => cb(newPrice));
});

const sendMessageToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const subscribeToSymbolOnWS = (symbolName) => {
  sendMessageToWebSocket({
    method: "SUBSCRIBE",
    params: [`${symbolName}@trade`],
    id: 1,
  });
};
const unsubscribeFromSymbolOnWS = (symbolName) => {
  sendMessageToWebSocket({
    method: "UNSUBSCRIBE",
    params: [`${symbolName}@trade`],
    id: 312,
  });
};

export const subscribeToSymbol = (symbolName, cb) => {
  const subscribers = tickersHandlers.get(symbolName) ?? [];
  tickersHandlers.set(symbolName, [...subscribers, cb]);
  subscribeToSymbolOnWS(symbolName);
};
export const unsubscribeFromSymbol = (symbolName) => {
  tickersHandlers.delete(symbolName);
  unsubscribeFromSymbolOnWS(symbolName);
};
