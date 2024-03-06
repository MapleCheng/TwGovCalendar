const path = require("path");
const fs = require("fs");
const csv = require("csv");
const dayjs = require("dayjs");
const iconv = require("iconv-lite");
const fsPromises = fs.promises;

const rootDir = path.join(__dirname, "..");

async function readCsvData(filePath) {
  return new Promise(async (resolve, reject) => {
    const input = iconv.decode(Buffer.from(await fsPromises.readFile(filePath)), "big5");

    const output = [];
    const csvData = csv.parse({
      delimiter: ",",
    });

    csvData.on("readable", function () {
      let record = csvData.read();

      while ((record = csvData.read())) {
        output.push({
          date: dayjs(record[0]).format("YYYY-MM-DD"), // 日期
          name: record[3], // 節日或紀念日名稱
          isHoliday: record[2] === "2", // 是否放假
          day: record[1], // 星期
        });
      }
    });

    csvData.on("error", function (err) {
      console.error(err.message);

      reject();
    });

    csvData.on("end", function () {
      resolve(output);
    });

    csvData.write(input);

    csvData.end();
  });
}

async function renderJsonCalendar() {
  const sourceDir = path.join(rootDir, "source");
  const targetDir = path.join(rootDir, "date");
  const fileNames = await fsPromises.readdir(sourceDir);

  const res = await Promise.all(fileNames.map((fileName) => readCsvData(path.join(sourceDir, fileName))));

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  // output file
  await Promise.all(
    res
      .filter((data) => data.length > 0)
      .map(async (data) => {
        const year = dayjs(data[0].date).format("YYYY");
        const jsonStr = JSON.stringify(data, null, 4);

        await fsPromises.writeFile(path.join(targetDir, `${year}.json`), jsonStr);
      })
  );

  console.log("Done!");
}

renderJsonCalendar();
