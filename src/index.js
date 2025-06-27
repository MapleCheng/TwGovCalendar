const path = require("path");
const fs = require("fs");
const csv = require("csv");
const dayjs = require("dayjs");
const iconv = require("iconv-lite");
const fsPromises = fs.promises;

const rootDir = path.join(__dirname, "..");

// 檢測文件編碼的函數
function detectFileEncoding(buffer) {
  // 檢查是否有 UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return 'utf8';
  }
  
  // 簡單的 UTF-8 vs Big5 檢測
  // 檢查前幾個字節是否為有效的 UTF-8 序列
  const sample = buffer.slice(0, Math.min(100, buffer.length));
  let isValidUTF8 = true;
  
  try {
    // 嘗試將樣本解碼為 UTF-8
    const utf8Text = iconv.decode(sample, 'utf8');
    // 檢查是否包含中文字符且沒有亂碼
    if (utf8Text.includes('西元日期') || utf8Text.includes('星期')) {
      return 'utf8';
    }
  } catch (e) {
    isValidUTF8 = false;
  }
  
  // 如果不是有效的 UTF-8，假設是 Big5
  return 'big5';
}

async function readCsvData(filePath) {
  return new Promise(async (resolve, reject) => {
    const buffer = await fsPromises.readFile(filePath);
    
    // 檢測文件編碼
    const encoding = detectFileEncoding(buffer);
    console.log(`Processing ${path.basename(filePath)} with encoding: ${encoding}`);
    
    // 根據檢測到的編碼解碼文件
    const input = iconv.decode(buffer, encoding);

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
