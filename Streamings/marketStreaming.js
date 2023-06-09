const signalr = require("signalr-client");
const db_ssi = require("../database/index.js");
const query = require("../common/query.js");

function addSlash(str) {
  return str.substr(-1) !== "/" ? str + "/" : str;
}

var api = {
  SIGNALR: "signalr",
};

function resoleURL(baseURL, query) {
  return addSlash(baseURL) + query;
}

var client = {};

/**
 * Init client stream order
 * @param {{url: string, consumer_id:string,consumer_secret:string}} options
 */
exports.initStream = function (options) {
  var url = resoleURL(options.url, api.SIGNALR);
  client = new signalr.client(url, ["FcMarketDataV2Hub"], 10, true);

  client._eventsListener = [];
  client.headers["Authorization"] = options.token;

  client.on("FcMarketDataV2Hub", "Broadcast", async function (message) {
    let data = JSON.parse(message);
    let content = JSON.parse(data.Content);
    let listData = await query("SELECT * from data");

    let symbolData = await query("SELECT * from data WHERE symbol = ?", [
      content.Symbol,
    ]);

    if (symbolData.length > 0) {
      await query("UPDATE data SET ? WHERE symbol = ?", [
        {
          close: content.Close,
          high: content.High,
          low: content.Low,
          open: content.Open,
          volume: content.Volume,
          date: content.TradingDate,
          time: content.Time,
        },
        content.Symbol,
      ]);
    } else {
      console.log(
        `symbolData 1:  ${symbolData.length}, symbol: ${content.Symbol}`
      );
      symbolData = await query("SELECT * from data WHERE symbol = ?", [
        content.Symbol,
      ]);
      console.log(
        `symbolData 2:  ${symbolData.length}, symbol: ${content.Symbol}`
      );

      if (symbolData.length === 0) {
        await query("INSERT INTO data SET ?", {
          symbol: content.Symbol,
          close: content.Close,
          high: content.High,
          low: content.Low,
          open: content.Open,
          volume: content.Volume,
          date: content.TradingDate,
          time: content.Time,
        });
      }
    }
    if (content.Symbol === "VNM") {
      console.log("listData: ", listData.length);
      console.log("bbb", content);
    }
  });

  client.on("FcMarketDataV2Hub", "Reconnected", function (message) {
    console.log("Reconnected" + message);
  });

  client.on("FcMarketDataV2Hub", "Disconnected", function (message) {
    console.log("Disconnected" + message);
  });

  client.on("FcMarketDataV2Hub", "Error", function (message) {
    console.log(message);
  });
};
exports.streamClient = client;

/**
 * Start listen stream from server.
 */
exports.start = function start() {
  client.start();
  return client;
};
