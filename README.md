# TwGovCalendar

資料來源為 [中華民國政府行政機關辦公日曆表](https://data.gov.tw/dataset/14718) 的 `.csv` 檔案，並將 `.csv` 檔轉換為 `json` 格式進行使用

### 使用

GitHub Raw link

```
https://raw.githubusercontent.com/MapleCheng/TwGovCalendar/main/date/{year}.json
```

以 2024 年為例

```
https://raw.githubusercontent.com/MapleCheng/TwGovCalendar/main/date/2024.json
```

### 自己跑

Step1:

```shell
npm install
```

Step2: 將 [中華民國政府行政機關辦公日曆表](https://data.gov.tw/dataset/14718) 下載的 `.csv` 檔案放到 `source` 資料夾中(不要下載到 Google 行事曆專用的檔案)。

Step3:

```shell
npm run build
```

### 說明

資料格式為 JSON, 如下所示:

```json
[
  {
    "date": "日期(string)",
    "name": "節日或紀念日名稱(string)",
    "week": "星期(string)",
    "isHoliday": "是否放假(boolean)"
  }
]
```

## 授權

原始資料使用[政府資料開放授權條款-第 1 版](https://data.gov.tw/license) 授權，依照第三條第二項要求標示出處為[政府資料開放平台](https://data.gov.tw/)且依第四條第二項說明使用「創用 CC 授權 姓名標示 4.0 國際版本」授權釋出。
