const axios = require("axios");
const query = require("./common/query");
const fs = require("fs");
const moment = require("moment");

//call to http://localhost:3020/IntradayOhlc

async function getIntradayOhlc() {
  let listData = await query("SELECT symbol from data");
  for (let i = 0; i < listData.length; i++) {
    const { symbol } = listData[i];
    let fromDate = moment().subtract(30, "days").format("DD/MM/YYYY");
    let toDate = moment().format("DD/MM/YYYY");
    let response = await axios.get(
      `http://localhost:3020/IntradayOhlc?symbol=${symbol}&fromDate=${fromDate}&toDate=${toDate}`
    );
    console.log(
      `stt: ${i}, symbol: ${symbol}, response: ${response.data.data.length}`
    );
    //delay 50ms
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
// getIntradayOhlc();

async function getDailyOhlc() {
  let listData = await query("SELECT symbol from data");
  for (let i = 0; i < listData.length; i++) {
    const { symbol } = listData[i];
    let fromDate = moment().subtract(30, "days").format("DD/MM/YYYY");
    let toDate = moment().format("DD/MM/YYYY");
    let response = await axios.get(
      `http://localhost:3020/DailyOhlc?symbol=${symbol}&fromDate=${fromDate}&toDate=${toDate}`
    );
    console.log(
      `stt: ${i}, symbol: ${symbol}, response: ${response.data.data.length}`
    );
    //delay 50ms
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

getDailyOhlc();

async function getListPair() {
  let listData = await query("SELECT symbol from data");
  let listDataMap = listData.map((item) => item.symbol);
  fs.writeFileSync("listData.json", JSON.stringify(listDataMap));
}
// getListPair();
