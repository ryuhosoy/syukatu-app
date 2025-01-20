import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import authRoute from "./routes/auth.mjs";
import usersRoute from "./routes/users.mjs";
import companiesRoute from "./routes/companies.mjs";
import mongoose from "mongoose";
import env from "dotenv";
import https from "https";
import schedule from 'node-schedule';
import { exec } from 'child_process';
import { promisify } from 'util';

env.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DBと接続中");
  })
  .catch((err) => {
    console.error(err);
  });

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/companies", companiesRoute);

app.get("/", async (req, res) => {
  console.log("Hello, this is the server root!");
  res.send("Hello, this is the server root!");
});

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 4096,
    temperature: 0,
    messages: [
      { role: "system", content: "あなたは就活マスターです。" },
      {
        role: "user",
        content: `${prompt}の会社情報として、海外進出してるか、事業概要、事業の種類、魅、などその会社について分かるようなことを600字程度で説明して`,
      },
    ],
  });
  
  // console.log(completion.choices[0].message.content);
  res.send(completion.choices[0].message.content);
});

app.post("/api/futureGrowthChat", async (req, res) => {
  const { prompt } = req.body;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 4096,
    temperature: 0,
    messages: [
      { role: "system", content: "あなたは就活マスターです。" },
      {
        role: "user",
        content: `${prompt}`,
      },
    ],
  });

  // console.log(completion.choices[0].message.content);
  res.send(completion.choices[0].message.content);
});

app.post("/api/news", async (req, res) => {
  const SUBSCRIPTION_KEY = process.env.AZURE_SUBSCRIPTION_KEY;
  if (!SUBSCRIPTION_KEY) {
    throw new Error("Missing the AZURE_SUBSCRIPTION_KEY environment variable");
  }
  function bingWebSearch(query) {
    https.get(
      {
        hostname: "api.bing.microsoft.com",
        path: "/v7.0/search?q=" + encodeURIComponent(query),
        headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
      },
      (response) => {
        let body = "";
        response.on("data", (part) => (body += part));
        response.on("end", () => {
          for (var header in response.headers) {
            if (
              header.startsWith("bingapis-") ||
              header.startsWith("x-msedge-")
            ) {
              console.log(header + ": " + response.headers[header]);
            }
          }
          console.log("\nJSON Response:\n");
          console.dir(JSON.parse(body), { colors: false, depth: null });
          res.send(JSON.parse(body));
        });
        response.on("error", (e) => {
          console.log("Error: " + e.message);
          throw e;
        });
      }
    );
  }
  const query = `${req.body.companyName}関連ニュース`;
  bingWebSearch(query);
});

// google map api key: AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg

// execを Promise化
const execAsync = promisify(exec);

// Pythonスクリプト実行関数
async function runPythonScripts() {
  try {
    console.log('Pythonスクリプトの実行を開始します');
    
    // fetcherInfoDuringLikeSpan.pyの実行
    const { stdout: stdout1, stderr: stderr1 } = await execAsync('python3 fetcherInfoDuringLikeSpan.py');
    if (stderr1) console.error('fetcherInfoDuringLikeSpan.py エラー:', stderr1);
    if (stdout1) console.log('fetcherInfoDuringLikeSpan.py 出力:', stdout1);
    
    // fetcherAllCompanies.pyの実行
    const { stdout: stdout2, stderr: stderr2 } = await execAsync('python3 fetcherAllCompanies.py');
    if (stderr2) console.error('fetcherAllCompanies.py エラー:', stderr2);
    if (stdout2) console.log('fetcherAllCompanies.py 出力:', stdout2);
    
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}

// 毎日午前3時に実行するスケジュール設定
schedule.scheduleJob("0 3 * * *", runPythonScripts);

const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
