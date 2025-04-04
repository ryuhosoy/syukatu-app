import express from "express";
import mongodb from "mongodb";
import env from "dotenv";
import axios from "axios";
// import Redis from "ioredis";
// import zlib from "zlib";
// import msgpack from "msgpack-lite";
// import zstd from "node-zstd";

env.config();
const router = express.Router();
const MongoClient = mongodb.MongoClient;
// const redisClient = new Redis(
//   ""
// );

// redisClient.on("connect", () => {
//   console.log("Redisに接続しました");
// });

// redisClient.on("error", (err) => {
//   console.error("Redisへの接続エラー:", err);
// });
// // await client.set('foo', 'bar');

// // MongoDB から企業データを取得する関数
// const getCompaniesFromMongoDB = async () => {
//   // const mongodbClient = await MongoClient.connect(process.env.MONGO_URI);
//   const mongodbClient = await MongoClient.connect(
//     "mongodb+srv://ryuhosoy:Buchan-ryuhei1@cluster0.utalj.mongodb.net/syukatu?retryWrites=true&w=majority&appName=Cluster"
//   );
//   const syukatudb = mongodbClient.db("syukatu");
//   const companies = await syukatudb.collection("companies").find().toArray();
//   await mongodbClient.close();
//   return companies;
// };

// 企業データ取得 API (キャッシュ対応)
router.get("/companiesData", async (req, res) => {
  try {
    const cacheData = await redisClient.get("companiesData");
    if (cacheData) {
      console.log("redisキャッシュデータがあります");
      return res.json(JSON.parse(cacheData));
    } else {
      console.log("redisキャッシュデータがありません");
    }

    const companies = await getCompaniesFromMongoDB();
    const data = JSON.stringify(companies);

    const minifiedJson = JSON.stringify(data, null, 0);

    // const packedData = msgpack.packb(minifiedJson);
    // JSON を MessagePack に変換
    // const packedData = msgpack.encode(minifiedJson);

    const packedData = zstd.compress(msgpack.encode(minifiedJson), {
      level: 22 // Zstandardの最大圧縮レベル
    });

    const brotliOptions = {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // 最大圧縮
        [zlib.constants.BROTLI_PARAM_LGWIN]: 24, // 最大辞書サイズ
      },
    };

    // MessagePack を Brotli 圧縮
    zlib.brotliCompress(packedData, brotliOptions, (err, compressedData) => {
      if (!err) {
        redisClient.setBuffer("companiesData", compressedData);
      }
    });

    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetcing companies data" });
  }
});

// キャッシュ更新用 API
router.post("/updateCompaniesDataCache", async (req, res) => {
  try {
    const companies = await getCompaniesFromMongoDB();
    await redisClient.set("companiesData", JSON.stringify(companies));
    res.json({ message: "Cache updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating cache" });
  }
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
