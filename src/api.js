export const fetchTickers = async () => {
  const tickers = fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  )
    .then((res) => res.json())
    .then((rawData) => rawData.Data)
    .then((tickerList) => Object.keys(tickerList));

  return tickers;
};
