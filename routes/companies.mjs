import express from "express";
import mongodb from "mongodb";
import env from "dotenv";

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
      console.log(companies);
      return res.status(200).json(companies);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json(err);
    });
});

export default router;
