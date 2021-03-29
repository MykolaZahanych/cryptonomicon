const API_KEY =
  "74d69dedaa6cb171e21ee14fa35fe63411538ab3ce2e4ff535d3c69f59adf632";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    e.data
  );
  if (type !== AGGREGATE_INDEX) return;
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
  const stingifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stingifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stingifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`'5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`'5~CCCAGG~${ticker}~USD`]
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeToTickerOnWs(ticker);
};

window.tickersHandlers = tickersHandlers;
