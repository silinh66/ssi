var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var cron = require("node-cron");
const WebSocket = require("ws");
const TelegramBot = require("node-telegram-bot-api");
const socketIo = require("socket.io");
const http = require("http");
const telegramBotToken = "6081064704:AAGpOoJig4bTO7-TQlfac6WOHpv81TOUXDI";
const bot = new TelegramBot(telegramBotToken, { polling: false });
let chat_id = isProduct ? ["-955808797"] : ["-955808797"];

var isProduct = false;

const { default: axios } = require("axios");
const { groupBy } = require("lodash");
const moment = require("moment");

const fs = require("fs");

const ma = require("moving-averages");

const boll = require("bollinger-bands");

const SMA = require("technicalindicators").SMA;

var BB = require("technicalindicators").BollingerBands;

var RSI = require("technicalindicators").RSI;

const EMA = require("technicalindicators").EMA;
const MFI = require("technicalindicators").MFI;
const ADX = require("technicalindicators").ADX;
const StochasticRSI = require("technicalindicators").StochasticRSI;
const Stochastic = require("technicalindicators").Stochastic;
const WilliamsR = require("technicalindicators").WilliamsR;
const MACD = require("technicalindicators").MACD;
const query = require("./common/query");
const { convertToTimeFrame } = require("./convertInterval");
var whitelist = ["http://103.196.144.131:5001"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(isProduct ? corsOptions : { origin: "http://localhost:5001" }));
app.use(bodyParser.json({ type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.all("*", function (req, res, next) {
  /**
   * Response settings
   * @type {Object}
   */
  var responseSettings = {
    AccessControlAllowOrigin: req.headers.origin,
    AccessControlAllowHeaders:
      "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
    AccessControlAllowMethods: "POST, GET, PUT, DELETE, OPTIONS",
    AccessControlAllowCredentials: true,
  };

  /**
   * Headers
   */
  res.header(
    "Access-Control-Allow-Credentials",
    responseSettings.AccessControlAllowCredentials
  );
  res.header(
    "Access-Control-Allow-Origin",
    responseSettings.AccessControlAllowOrigin
  );
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"]
      ? req.headers["access-control-request-headers"]
      : "x-requested-with"
  );
  res.header(
    "Access-Control-Allow-Methods",
    req.headers["access-control-request-method"]
      ? req.headers["access-control-request-method"]
      : responseSettings.AccessControlAllowMethods
  );

  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

let rawConfig = fs.readFileSync("listConfig.json");
var listConfig = JSON.parse(rawConfig);
console.log("listConfig: ", listConfig);

const listIntervals = [
  { interval: "1m", seconds: 60 },
  { interval: "5m", seconds: 300 },
  { interval: "15m", seconds: 900 },
  { interval: "30m", seconds: 1800 },
  { interval: "1h", seconds: 3600 },
  { interval: "2h", seconds: 7200 },
  { interval: "4h", seconds: 14400 },
  { interval: "12h", seconds: 43200 },
  { interval: "1d", seconds: 86400 },
  { interval: "3d", seconds: 259200 },
  { interval: "1w", seconds: 604800 },
  { interval: "1M", seconds: 2592000 },
];

let listMatchRSIUp = [];
let listMatchRSIDown = [];

let listMatchMA = [];
let listMatchRSI = [];
let listMatchMACD = [];

app.get("/", function (req, res) {
  return res.send({ error: false, message: "hello Linh Ken" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log("Node app is running on port 5000");
});

// config
app.post("/config", function (req, res) {
  let data = req.body.data;
  console.log("data", data);
  if (!data) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide data" });
  }
  // let listRuSymbol = data.listsymbol.filter((item) => {
  //   return listConfig.listsymbol.indexOf(item) < 0;
  // });
  // let listOldSymbol = data.listsymbol.filter((item) => {
  //   return listConfig.listsymbol.indexOf(item) > -1;
  // });
  // let listRunInterval = data.listInterval.filter((item) => {
  //   return listConfig.listInterval.indexOf(item) < 0;
  // });
  listConfig = data;
  fs.writeFileSync("listConfig.json", JSON.stringify(data));
  // if (listRunInterval.length > 0) {
  //   run(listOldSymbol, listRunInterval, true);
  // }
  // if (listRuSymbol.length > 0) {
  //   run(listRuSymbol, data.listInterval, true);
  // }

  let curTime = new Date();
  // console.log(`Config changed:
  //   ${JSON.stringify(listConfig)}
  //   ${moment(curTime).format("HH:mm:ss")}`);
  const { listPair, ...dataSend } = data;
  for (let i = 0; i < chat_id.length; i++) {
    bot.sendMessage(
      chat_id[i],
      `Config changed:
    ${JSON.stringify(dataSend)}`
    );
  }

  console.log(`Config changed:
      ${JSON.stringify(data)}
      ${moment(curTime).add(5, "hours").format("HH:mm:ss")}`);

  return res.send({ error: false, data: data, message: "config list." });
});

app.get("/getConfig", function (req, res) {
  return res.send({ error: false, data: listConfig, message: "config list." });
});

app.post("/quan_tri_von", async function (req, res) {
  let data = req.body.data;
  data = data.map((item) => [item]);
  console.log("data", data);
  if (!data) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide data" });
  }
  await query("INSERT INTO quan_tri_von (symbol) VALUES ?", [data]);
  res.send({ error: false, data: data, message: "Thêm mã thành công" });
});

app.get("/quan_tri_von", async function (req, res) {
  let data = await query("SELECT * FROM quan_tri_von");
  let rows = await query("SELECT * from data");
  let mapData = data.map((item, index) => {
    let itemRealtime = rows.find((itemRealtime) => {
      return itemRealtime.symbol === item.symbol;
    });
    console.log("itemRealtime: ", itemRealtime);
    return {
      ...item,
      id: index,
      key: item.id,
      stt: index + 1,
      price: String(itemRealtime ? itemRealtime.close : "").replace(
        /(.)(?=(\d{3})+$)/g,
        "$1,"
      ),
      volume: String(itemRealtime ? itemRealtime.volume : "").replace(
        /(.)(?=(\d{3})+$)/g,
        "$1,"
      ),
    };
  });
  res.send({ error: false, data: mapData, message: "config list." });
});

app.put("/quan_tri_von", async function (req, res) {
  let data = req.body.data;
  console.log("data", data);
  if (!data) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide data" });
  }
  await query("UPDATE quan_tri_von SET ? WHERE symbol = ?", [
    data,
    data.symbol,
  ]);
  res.send({ error: false, data: data, message: "Cập nhật thành công" });
});

app.post("/input_quan_tri_von", async function (req, res) {
  let data = req.body.data;
  console.log("data", data);
  if (!data) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide data" });
  }
  await query("INSERT INTO input_quan_tri_von SET ?", data);
  res.send({ error: false, data: data, message: "Cập nhật thành công" });
});

app.get("/input_quan_tri_von", async function (req, res) {
  let data = await query("SELECT * FROM input_quan_tri_von");
  console.log("data: ", data);
  res.send({
    error: false,
    data: data[data.length - 1],
    message: "input_quan_tri_von list.",
  });
});

cron.schedule("3 */5 * * * *", () => {
  console.log("running a task every 5 minutes", moment().format("HH:mm:ss"));
  // console.log("listMatchRSIUp", listMatchRSIUp);
  // console.log("listMatchRSIDown", listMatchRSIDown);
  // console.log('listMatchRSIUp.length', listMatchRSIUp.length);
  if (listMatchRSIUp.length > 0) {
    const groupList = groupBy(listMatchRSIUp, "time");
    // console.log("groupList: ", groupList);
    let resultString = "MATCHED RSI UP:";
    const listKey = Object.keys(groupList);
    for (let i = 0; i < listKey.length; i++) {
      if (groupList[listKey[i]].length > 0) {
        resultString += `\n---------------------${listKey[i]}---------------------`;
        // resultString += `\n${listKey[i]}:`;
        // console.log('groupList[listKey[i]]', groupList[listKey[i]]);
        for (let j = 0; j < groupList[listKey[i]].length; j++) {
          resultString += `\n ${groupList[listKey[i]][j].symbol}`;
        }
      }
    }
    console.log("resultString: ", resultString);

    // bot.sendMessage(
    //   chat_id[0],
    //   `${resultString}
    //           ${moment().add(5, "hours").format("HH:mm:ss")}`
    // );
  }
  if (listMatchRSIDown.length > 0) {
    const groupList = groupBy(listMatchRSIDown, "time");
    // console.log("groupList: ", groupList);
    let resultString = "MATCHED RSI DOWN:";
    const listKey = Object.keys(groupList);
    for (let i = 0; i < listKey.length; i++) {
      if (groupList[listKey[i]].length > 0) {
        resultString += `\n---------------------${listKey[i]}---------------------`;
        // resultString += `\n${listKey[i]}:`;
        // console.log('groupList[listKey[i]]', groupList[listKey[i]]);
        for (let j = 0; j < groupList[listKey[i]].length; j++) {
          resultString += `\n ${groupList[listKey[i]][j].symbol}`;
        }
      }
    }
    console.log("resultString: ", resultString);

    // bot.sendMessage(
    //   chat_id[1],
    //   `${resultString}
    //           ${moment().add(5, "hours").format("HH:mm:ss")}`
    // );
  }
  if (listMatchMA.length > 0) {
    const groupList = groupBy(listMatchMA, "time");
    // console.log("groupList: ", groupList);
    let resultString = "MATCHED MA:";
    const listKey = Object.keys(groupList);
    for (let i = 0; i < listKey.length; i++) {
      if (groupList[listKey[i]].length > 0) {
        resultString += `\n---------------------${listKey[i]}---------------------`;
        // resultString += `\n${listKey[i]}:`;
        // console.log('groupList[listKey[i]]', groupList[listKey[i]]);
        for (let j = 0; j < groupList[listKey[i]].length; j++) {
          resultString += `\n ${groupList[listKey[i]][j].symbol}`;
        }
      }
    }
    console.log("resultString: ", resultString);

    // bot.sendMessage(
    //   chat_id[0],
    //   `${resultString}
    //           ${moment().add(5, "hours").format("HH:mm:ss")}`
    // );
  }

  listMatchRSIUp = [];
  listMatchRSIDown = [];
  listMatchMA = [];
});

async function getIntradayOhlc() {
  let listData = await query("SELECT symbol from data");
  for (let i = 0; i < listData.length; i++) {
    let isStoch = false;
    let isRSI = false;
    let isRSIdown = false;
    let isMFI = false;
    let isDMI_ADX = false;
    let isMACD = false;
    let isEMA = false;
    let isWilliams = false;
    let isMA = false;
    let isRS = false;

    const { symbol } = listData[i];
    let fromDate = moment().subtract(30, "days").format("DD/MM/YYYY");
    let toDate = moment().format("DD/MM/YYYY");
    let response = await axios.get(
      `http://localhost:3020/IntradayOhlc?symbol=${symbol}&fromDate=${fromDate}&toDate=${toDate}`
    );
    // console.log(
    //   `stt: ${i}, symbol: ${symbol}, response: ${
    //     response.data.data ? response.data.data.length : 0
    //   }`
    // );
    let listSymbol = response.data.data ? response.data.data.reverse() : [];
    // let listSymbol5m = convertToTimeFrame(listSymbol, 5);
    // let listSymbol15m = convertToTimeFrame(listSymbol, 15);
    // let listSymbol30m = convertToTimeFrame(listSymbol, 30);
    // let listSymbol1h = convertToTimeFrame(listSymbol, 60);
    // let listSymbol4h = convertToTimeFrame(listSymbol, 240);

    let bPrices = listSymbol
      ? listSymbol.map((item, index) => {
          return {
            symbol: symbol,
            date: item.TradingDate,
            time: item.Time,
            open: item.Open,
            high: item.High,
            low: item.Low,
            close: item.Close,
            volume: item.Volume,
          };
        })
      : [];
    let mapPrices = bPrices.map((item, index) => {
      return +item.close;
    });
    // console.log(`symbol: ${symbol}, mapPrices: ${mapPrices.length}`);
    // console.log("mapPrices: ", mapPrices);
    let high = bPrices.map((item, index) => {
      return +item.high;
    });
    let low = bPrices.map((item, index) => {
      return +item.low;
    });
    let close = bPrices.map((item, index) => {
      return +item.close;
    });
    let volume = bPrices.map((item, index) => {
      return +item.volume;
    });
    let sma = SMA.calculate({ period: 9, values: mapPrices });
    // console.log("sma: ", sma);
    let curSma = sma[sma.length - 1];
    let lineSMA = `${moment().format("HH:mm:ss")}-1m-${symbol}-${JSON.stringify(
      curSma
    )}\n`;
    fs.appendFileSync("SMA.txt", lineSMA);
    if ((curSma > listConfig.MAValue && listConfig.RSI) || !listConfig.MA) {
      isMA = true;
    }
    // console.log(`stt: ${i}, symbol: ${symbol}, curSma: ${curSma}`);

    //RSI
    let rsi = RSI.calculate({ period: 14, values: mapPrices });
    let curRSI = rsi[rsi.length - 1];
    let lineRSI = `${moment().format("HH:mm:ss")}-1m-${symbol}-${JSON.stringify(
      curRSI
    )}\n`;
    fs.appendFileSync("RSI.txt", lineRSI);
    if ((curRSI > listConfig.RSIValue && listConfig.RSI) || !listConfig.RSI) {
      isRSI = true;
      // console.log("curRSI", curRSI, symbol, time);
    }

    //MACD
    let macd = MACD.calculate({
      values: mapPrices,
      fastPeriod: 5,
      slowPeriod: 14,
      signalPeriod: 3,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    let curMACD = macd[macd.length - 1];
    let prevMACD = macd[macd.length - 2];
    let lineMACD = `${moment().format(
      "HH:mm:ss"
    )}-1m-${symbol}-curMACD:${JSON.stringify(
      curMACD
    )}-prevMACD:${JSON.stringify(prevMACD)}\n`;
    fs.appendFileSync("MACD.txt", lineMACD);
    if (
      (curMACD > listConfig.MACDValue &&
        prevMACD < curMACD &&
        listConfig.MACD) ||
      !listConfig.MACD
    ) {
      isMACD = true;
    }

    //Checking
    if (isMA) {
      listMatchMA.push({
        symbol: symbol,
        time: "1m",
      });
    }
    if (isRSI) {
      listMatchRSI.push({
        symbol: symbol,
        time: "1m",
      });
    }
    if (isMACD) {
      listMatchMACD.push({
        symbol: symbol,
        time: "1m",
      });
    }
    //delay 50ms
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
async function start() {
  // while (true) {
  console.log("Start get new prices");
  await getIntradayOhlc();
  await new Promise((resolve) => setTimeout(resolve, 1000 * 5));
  // }
}

start();

// async function tradingsymbol(symbol, time, isFirstTime) {
//   async function main() {
//     let prices = await binance.fetchOHLCV(symbol, time, undefined, 201);
//     let bPrices = prices.map((price) => {
//       return {
//         timestamp: moment(price[0]).format(),
//         open: price[1],
//         high: price[2],
//         low: price[3],
//         close: price[4],
//         volume: price[5],
//       };
//     });
//     bPrices.pop();
//     // while (true) {
//     // await tick();
//     // await delay(10000 * 1000);
//     // console.log(symbol, time);
//     // tick();
//     // await delay(10000 * 1000);
//     let socket = new WebSocket(
//       `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${time}`
//     );
//     socket.onmessage = function (event) {
//       // Easier and shorter.
//       let data = JSON.parse(event.data);
//       // "x" means: Is this kline closed? Return "true" if closed. Closed means new line to be added.
//       if (data.k.x === true) {
//         let isStoch = false;
//         let isRSI = false;
//         let isRSIdown = false;
//         let isMFI = false;
//         let isDMI_ADX = false;
//         let isMACD = false;
//         let isEMA = false;
//         let isWilliams = false;
//         // console.log(data);
//         // console.log("Add line.");
//         let newCandle = {
//           timestamp: moment(data.k.t).format(),
//           open: data.k.o,
//           high: data.k.h,
//           low: data.k.l,
//           close: data.k.c,
//           volume: data.k.v,
//         };
//         let line = `${time}-${symbol}-${JSON.stringify(newCandle)}\n`;
//         fs.appendFileSync("result.txt", line);
//         bPrices.shift();
//         bPrices.push(newCandle);
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         // console.log("length", bPrices.length, symbol, time);
//         let mapPrices = bPrices.map((item, index) => {
//           return item.close;
//         });
//         let high = bPrices.map((item, index) => {
//           return item.high;
//         });
//         let low = bPrices.map((item, index) => {
//           return item.low;
//         });
//         let close = bPrices.map((item, index) => {
//           return item.close;
//         });
//         let volume = bPrices.map((item, index) => {
//           return item.volume;
//         });

//         let ema = EMA.calculate({
//           period: listConfig.EMAValue,
//           values: mapPrices,
//         });
//         let curEma = ema[ema.length - 1];
//         let lineEMA = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-${JSON.stringify(curEma)}\n`;
//         fs.appendFileSync("EMA.txt", lineEMA);
//         // console.log("curEma: ", curEma);
//         // console.log("curPrice", bPrices[bPrices.length - 2]);
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         //open < close
//         //close > ema50
//         if (
//           (curEma < bPrices[bPrices.length - 1].close &&
//             bPrices[bPrices.length - 1].close >
//               bPrices[bPrices.length - 1].open &&
//             bPrices[bPrices.length - 1].open < curEma &&
//             listConfig.EMA) ||
//           !listConfig.EMA
//         ) {
//           isEMA = true;
//         }
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }

//         //RSI
//         let rsi = RSI.calculate({ period: 14, values: mapPrices });
//         let curRSI = rsi[rsi.length - 1];
//         let lineRSI = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-${JSON.stringify(curRSI)}\n`;
//         fs.appendFileSync("RSI.txt", lineRSI);
//         if (
//           (curRSI > listConfig.RSIValue && listConfig.RSI) ||
//           !listConfig.RSI
//         ) {
//           isRSI = true;
//           // console.log("curRSI", curRSI, symbol, time);
//         }
//         if (
//           (curRSI < listConfig.RSIdownValue && listConfig.RSIdown) ||
//           !listConfig.RSIdown
//         ) {
//           isRSIdown = true;
//           // console.log("curRSI", curRSI, symbol, time);
//         }
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         //StochRSI
//         // let stochRSI = StochasticRSI.calculate({
//         //   values: mapPrices,
//         //   rsiPeriod: 14,
//         //   stochasticPeriod: 14,
//         //   kPeriod: 3,
//         //   dPeriod: 3,
//         // });
//         //STOCH
//         let stoch = Stochastic.calculate({
//           high: high,
//           low: low,
//           close: close,
//           signalPeriod: 3,
//           period: 14,
//         });
//         let curStoch = stoch[stoch.length - 1];
//         let lineStoch = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-${JSON.stringify(curStoch)}\n`;
//         fs.appendFileSync("Stoch.txt", lineStoch);
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         if (curStoch !== undefined) {
//           if (
//             (curStoch.k > listConfig.StochValue &&
//               curStoch.d > listConfig.StochValue &&
//               listConfig.Stoch) ||
//             !listConfig.Stoch
//           ) {
//             isStoch = true;
//             // console.log("curStoch", curStoch, symbol, time);
//           }
//         }
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         //MACD
//         let macd = MACD.calculate({
//           values: mapPrices,
//           fastPeriod: 5,
//           slowPeriod: 14,
//           signalPeriod: 3,
//           SimpleMAOscillator: false,
//           SimpleMASignal: false,
//         });
//         let curMACD = macd[macd.length - 1];
//         let prevMACD = macd[macd.length - 2];
//         let lineMACD = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-curMACD:${JSON.stringify(
//           curMACD
//         )}-prevMACD:${JSON.stringify(prevMACD)}\n`;
//         fs.appendFileSync("MACD.txt", lineMACD);
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         if (
//           (curMACD > 0 && prevMACD < curMACD && listConfig.MACD) ||
//           !listConfig.MACD
//         ) {
//           isMACD = true;
//           // console.log("curMACD", curMACD, symbol, time);
//         }
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         //Wiliams
//         let williamsR = WilliamsR.calculate({
//           high: high,
//           low: low,
//           close: close,
//           period: 14,
//         });
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         let curWilliams = williamsR[williamsR.length - 1];
//         let lineWilliams = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-${JSON.stringify(curWilliams)}\n`;
//         fs.appendFileSync("Williams.txt", lineWilliams);
//         if (
//           (curWilliams > listConfig.WiliamsValue && listConfig.Williams) ||
//           !listConfig.Williams
//         ) {
//           isWilliams = true;
//           // console.log("williams", curWilliams, symbol, time);
//         }
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         //MFI
//         let mfi = MFI.calculate({
//           high: high,
//           low: low,
//           close: close,
//           volume: volume,
//           period: 14,
//         });
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         let curMFI = mfi[mfi.length - 1];
//         let lineMFI = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-${JSON.stringify(curMFI)}\n`;
//         fs.appendFileSync("MFI.txt", lineMFI);
//         if (
//           (curMFI > listConfig.MFIValue && listConfig.MFI) ||
//           !listConfig.MFI
//         ) {
//           isMFI = true;
//           // console.log("mfi", curMFI, symbol, time);
//         }
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }

//         // console.log("isRSI: ", isRSI);
//         // console.log("isStoch: ", isStoch);
//         // console.log("isMACD: ", isMACD);
//         // console.log("isWilliams: ", isWilliams);
//         // console.log("isMFI: ", isMFI);
//         // console.log("isDMI_ADX: ", isDMI_ADX);
//         // console.log("\n");

//         let adx = ADX.calculate({
//           high: high,
//           low: low,
//           close: close,
//           period: 14,
//         });
//         curAdx = adx[adx.length - 1];
//         prevAdx = adx[adx.length - 2];
//         let lineAdx = `${moment().format(
//           "HH:mm:ss"
//         )}-${time}-${symbol}-curAdx:${JSON.stringify(
//           curAdx
//         )}-prevAdx:${JSON.stringify(prevAdx)}\n`;
//         fs.appendFileSync("Adx.txt", lineAdx);
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         // console.log("adx", adx[adx.length - 1]);
//         // console.log("adx", adx[adx.length - 2]);
//         // console.log("adx", adx[adx.length - 3]);
//         // console.log("adx", adx[adx.length - 4]);
//         if (curAdx !== undefined) {
//           if (
//             (curAdx.pdi > curAdx.mdi && listConfig.DMI_ADX) ||
//             !listConfig.DMI_ADX
//           ) {
//             isDMI_ADX = true;
//             // console.log("mfi", curMFI, symbol, time);
//           }
//         }

//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           return;
//         }
//         //pdi[-2] > mdi[-2]
//         //pdi[-3] < mdi[-3] bỏ
//         //pdi xanh
//         //mdi nâu
//         let curTime = new Date();
//         //RSI up
//         if (
//           isRSI &&
//           isStoch &&
//           isMACD &&
//           isWilliams &&
//           isMFI &&
//           isEMA &&
//           isDMI_ADX
//         ) {
//           // console.log("MATCHED", symbol, time);
//           if (isProduct) {
//             for (let i = 0; i < chat_id.length; i++) {
//               //Bắn notif về group RSI up
//               if (i === 0) {
//                 // bot.sendMessage(
//                 //   chat_id[i],
//                 //   `MATCHED RSI UP:
//                 // ${symbol}
//                 // ${time}
//                 // ${moment(curTime).add(5, "hours").format("HH:mm:ss")}`
//                 // );
//               }
//             }
//           }
//           listMatchRSIUp.push({ symbol, time });
//           // console.log(`MATCHED RSI UP:
//           //       ${symbol}
//           //       ${time}
//           //       ${moment(curTime).format("HH:mm:ss")}`);
//           // let matchLine = `${moment().format("HH:mm:ss")}-${time}-${symbol}\n`;
//           // fs.appendFileSync("match.txt", matchLine);
//         }
//         //RSI down
//         if (
//           isRSIdown &&
//           isStoch &&
//           isMACD &&
//           isWilliams &&
//           isMFI &&
//           isEMA &&
//           isDMI_ADX
//         ) {
//           // console.log("MATCHED", symbol, time);
//           if (isProduct) {
//             for (let i = 0; i < chat_id.length; i++) {
//               //Bắn notif về group RSI down
//               if (i === 1) {
//                 // bot.sendMessage(
//                 //   chat_id[i],
//                 //   `MATCHED RSI DOWN:
//                 // ${symbol}
//                 // ${time}
//                 // ${moment(curTime).add(5, "hours").format("HH:mm:ss")}`
//                 // );
//               }
//             }
//           }
//           listMatchRSIDown.push({ symbol, time });
//           // console.log(`MATCHED RSI DOWN:
//           //       ${symbol}
//           //       ${time}
//           //       ${moment(curTime).format("HH:mm:ss")}`);
//           // let matchLine = `${moment().format("HH:mm:ss")}-${time}-${symbol}\n`;
//           // fs.appendFileSync("match.txt", matchLine);
//         }
//         // Adding a line with my custom function.
//         // addLine(data);
//       } else {
//         if (
//           !listConfig.listInterval.includes(time) ||
//           !listConfig.listsymbol.includes(symbol)
//         ) {
//           socket.close();
//           return;
//         }
//         // console.log("Update line.");
//         // Updating line with my custom function.
//         // updatePrice(data);
//       }
//     };
//     // while (1) {
//     //   if (
//     //     !listConfig.listInterval.includes(time) ||
//     //     !listConfig.listsymbol.includes(symbol)
//     //   ) {
//     //     socket.close();
//     //     return;
//     //   }
//     // }
//     // }
//   }
//   main();
// }

// async function run(listRuSymbol, listRunInterval, isFirstTime) {
//   //   console.log("listRunInterval: ", listRunInterval);
//   //   console.log("listRuSymbol: ", listRuSymbol);
//   // console.log(
//   //   `Trading bot is running on ${isProduct ? "VPS " : "local "} at: ${moment(
//   //     curTime
//   //   ).format("HH:mm:ss")}`
//   // );

//   for (let k = 0; k < listRuSymbol.length; k++) {
//     for (let j = 0; j < listRunInterval.length; j++) {
//       tradingsymbol(listRuSymbol[k], listRunInterval[j], isFirstTime);
//       // await delay(1 * 1000);
//     }
//   }
// }

// let curTime = new Date();
// if (isProduct) {
//   for (let i = 0; i < chat_id.length; i++) {
//     const lineCheckRunning = `Trading bot is running on ${
//       isProduct ? "VPS " : "local "
//     } at: ${moment(curTime).add(5, "hours").format("HH:mm:ss")}`;
//     // bot.sendMessage(
//     //   chat_id[i],
//     //   `Trading bot is running on ${isProduct ? "VPS " : "local "} at: ${moment(
//     //     curTime
//     //   )
//     //     .add(5, "hours")
//     //     .format("HH:mm:ss")}`
//     // );
//     fs.appendFileSync("checkRunning.txt", lineCheckRunning);
//   }
// }

// run(listConfig.listsymbol, listConfig.listInterval, true);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

setInterval(async () => {
  let rows = await query("SELECT * from data");
  io.sockets.emit("FromAPI", rows);
}, 1000);

const portSocket = 7000;

server.listen(portSocket, () =>
  console.log(`Socket is listening on port ${portSocket}`)
);

module.exports = app;
