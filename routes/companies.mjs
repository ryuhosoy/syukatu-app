import express from "express";
import mongodb from "mongodb";
import env from "dotenv";
import axios from "axios";

env.config();
const router = express.Router();
const MongoClient = mongodb.MongoClient;

router.get("/companiesData", async (req, res) => {
  MongoClient.connect(process.env.MONGO_URI)
    .then((client) => {
      const syukatudb = client.db("syukatu");
      return syukatudb.collection("companies").find().toArray();
    })
    .then((companies) => {
      // // データ容量のログ出力
      // const dataSize = JSON.stringify(companies).length;
      // console.log(`データ容量: ${(dataSize / 1024 / 1024).toFixed(2)} MB`);
      // console.log(`レコード数: ${companies.length}`);
      
      // // サンプルデータの構造を確認
      // if (companies.length > 0) {
      //   console.log('サンプルデータ構造:', Object.keys(companies[0]));
      // }

      return res.status(200).json(companies);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json(err);
    });
});

router.post("/corporateNumber", async (req, res) => {
  try {
    const { corporateName } = req.body;
    const apiToken = "Md2oMReMvlBhy1WqAmnKKfL8HgOyoZOU";

    const response = await axios.get(
      `https://info.gbiz.go.jp/hojin/v1/hojin?name=${encodeURIComponent(
        corporateName
      )}&page=1&limit=1000`,
      {
        headers: {
          "X-hojinInfo-api-token": apiToken,
          Accept: "application/json",
        },
      }
    );

    console.log(response.data);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching workplace data:", err);
    res.status(500).send("Error fetching workplace data");
  }
});

router.post("/companiesWorkplaceInfo", async (req, res) => {
  try {
    const { corporateNumber } = req.body;
    const apiToken = "Md2oMReMvlBhy1WqAmnKKfL8HgOyoZOU";
    
    const response = await axios.get(
      `https://info.gbiz.go.jp/hojin/v1/hojin/${encodeURIComponent(
        corporateNumber
      )}/workplace`,
      {
        headers: {
          "X-hojinInfo-api-token": apiToken,
          Accept: "application/json",
        },
      }
    );

    console.log(response.data);
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching workplace data:", err);
    res.status(500).send("Error fetching workplace data");
  }
});

export default router;
