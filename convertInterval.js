const moment = require("moment");
let { data } = require("./constatnts");

//resort data
data = data.sort((a, b) => {
  const aTime = moment(a.Time, "HH:mm:ss");
  const bTime = moment(b.Time, "HH:mm:ss");
  if (aTime.isBefore(bTime)) return -1;
  if (aTime.isAfter(bTime)) return 1;
  return 0;
});

function convertToTimeFrame(data, minutesPerCandle) {
  const result = [];
  let group = [];
  for (let i = 0; i < data.length; i++) {
    group.push(data[i]);
    if (minutesPerCandle === 60) {
      if (
        moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 60 ||
        (moment(data[i].Time, "HH:mm:ss").hour() === 11 &&
          moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 30)
      ) {
        // if (group.length === minutesPerCandle) {
        const tradingDate = group[0].TradingDate;
        const time =
          moment(data[i].Time, "HH:mm:ss").hour() === 9
            ? "09:00:00"
            : group[0].Time;
        const open = group[0].Open;
        const close = group[group.length - 1].Close;
        const high = Math.max(...group.map((item) => item.High));
        const low = Math.min(...group.map((item) => item.Low));
        const volume = group.reduce(
          (sum, item) => sum + parseInt(item.Volume),
          0
        );
        result.push({
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume,
          TradingDate: tradingDate,
          Time: time,
        });
        group = [];
      }
    } else if (minutesPerCandle === 120) {
      // console.log("hour(): ", moment(data[i].Time, "HH:mm:ss").hour());
      if (
        (moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 60 &&
          moment(data[i].Time, "HH:mm:ss").hour() % 2 === 0) ||
        (moment(data[i].Time, "HH:mm:ss").hour() === 11 &&
          moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 30)
      ) {
        // if (group.length === minutesPerCandle) {
        const tradingDate = group[0].TradingDate;
        const time =
          moment(data[i].Time, "HH:mm:ss").hour() === 10
            ? "09:00:00"
            : group[0].Time;
        const open = group[0].Open;
        const close = group[group.length - 1].Close;
        const high = Math.max(...group.map((item) => item.High));
        const low = Math.min(...group.map((item) => item.Low));
        const volume = group.reduce(
          (sum, item) => sum + parseInt(item.Volume),
          0
        );
        result.push({
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume,
          TradingDate: tradingDate,
          Time: time,
        });
        group = [];
      }
    } else if (minutesPerCandle === 180) {
      console.log("hour(): ", moment(data[i].Time, "HH:mm:ss").hour());
      if (
        (moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 30 &&
          moment(data[i].Time, "HH:mm:ss").hour() === 11) ||
        (moment(data[i].Time, "HH:mm:ss").hour() === 14 &&
          moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 46)
      ) {
        // if (group.length === minutesPerCandle) {
        const tradingDate = group[0].TradingDate;
        const time =
          moment(data[i].Time, "HH:mm:ss").hour() === 11
            ? "09:00:00"
            : moment(data[i].Time, "HH:mm:ss").hour() === 14
            ? "12:00:00"
            : group[0].Time;
        const open = group[0].Open;
        const close = group[group.length - 1].Close;
        const high = Math.max(...group.map((item) => item.High));
        const low = Math.min(...group.map((item) => item.Low));
        const volume = group.reduce(
          (sum, item) => sum + parseInt(item.Volume),
          0
        );
        result.push({
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume,
          TradingDate: tradingDate,
          Time: time,
        });
        group = [];
      }
    } else if (minutesPerCandle === 240) {
      if (
        (moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 30 &&
          moment(data[i].Time, "HH:mm:ss").hour() === 11) ||
        (moment(data[i].Time, "HH:mm:ss").hour() === 14 &&
          moment(data[i].Time, "HH:mm:ss").minutes() + 1 === 46)
      ) {
        // if (group.length === minutesPerCandle) {
        const tradingDate = group[0].TradingDate;
        const time =
          moment(data[i].Time, "HH:mm:ss").hour() === 11
            ? "09:00:00"
            : moment(data[i].Time, "HH:mm:ss").hour() === 14
            ? "13:00:00"
            : group[0].Time;
        const open = group[0].Open;
        const close = group[group.length - 1].Close;
        const high = Math.max(...group.map((item) => item.High));
        const low = Math.min(...group.map((item) => item.Low));
        const volume = group.reduce(
          (sum, item) => sum + parseInt(item.Volume),
          0
        );
        result.push({
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume,
          TradingDate: tradingDate,
          Time: time,
        });
        group = [];
      }
    } else {
      if (
        (moment(data[i].Time, "HH:mm:ss").minutes() + 1) % minutesPerCandle ===
        0
      ) {
        // if (group.length === minutesPerCandle) {
        const tradingDate = group[0].TradingDate;
        const time = group[0].Time;
        const open = group[0].Open;
        const close = group[group.length - 1].Close;
        const high = Math.max(...group.map((item) => item.High));
        const low = Math.min(...group.map((item) => item.Low));
        const volume = group.reduce(
          (sum, item) => sum + parseInt(item.Volume),
          0
        );
        result.push({
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume,
          TradingDate: tradingDate,
          Time: time,
        });
        group = [];
      }
    }
  }
  // Xử lý nhóm cuối cùng nếu chúng không đủ số phút
  if (group.length > 0) {
    const tradingDate = group[0].TradingDate;
    const time = group[0].Time;
    const open = group[0].Open;
    const close = group[group.length - 1].Close;
    const high = Math.max(...group.map((item) => item.High));
    const low = Math.min(...group.map((item) => item.Low));
    const volume = group.reduce((sum, item) => sum + parseInt(item.Volume), 0);
    result.push({
      Open: open,
      High: high,
      Low: low,
      Close: close,
      Volume: volume,
      TradingDate: tradingDate,
      Time: time,
    });
  }
  return result;
}

const fiveMinData = convertToTimeFrame(data, 5);
// console.log("fiveMinData: ", fiveMinData);
const fifteenMinData = convertToTimeFrame(data, 15);
// console.log("fifteenMinData: ", fifteenMinData);
const oneHourData = convertToTimeFrame(data, 60);
// console.log("oneHourData: ", oneHourData);
const twoHourData = convertToTimeFrame(data, 120);
// console.log("twoHourData: ", twoHourData);
const threeHourData = convertToTimeFrame(data, 180);
// console.log("threeHourData: ", threeHourData);
const fourHourData = convertToTimeFrame(data, 240);
console.log("fourHourData: ", fourHourData);

module.exports = {
  convertToTimeFrame,
};
