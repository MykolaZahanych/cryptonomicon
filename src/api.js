const API_KEY =
  "74d69dedaa6cb171e21ee14fa35fe63411538ab3ce2e4ff535d3c69f59adf632";

const tickersHandlers = new Map();

export const loadtickersHandlers = () => {
  if (tickersHandlers.size === 0) return;
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = ticker => {
  // const subscribers = tickersHandlers.get(ticker) || [];
  // tickersHandlers.set(
  //   ticker,
  //   subscribers.filter(fn => fn !== cb)
  // );
  tickersHandlers.delete(ticker);
};

setInterval(loadtickersHandlers, 5000);

window.tickersHandlers = tickersHandlers;
