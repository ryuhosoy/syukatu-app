import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import authRoute from "./routes/auth.mjs";
import usersRoute from "./routes/users.mjs";
import postsRoute from "./routes/posts.mjs";
import mongoose from "mongoose";
import env from "dotenv";
import https from "https";

env.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DBと接続中");
  })
  .catch((err) => {
    console.log(err);
  });

const openai = new OpenAI({
  apiKey: process.env.OpenAI_API_KEY,
});

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: true,
    method: [],
  })
);

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);

app.get("/", async (req, res) => {
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
        // content: `${prompt}の会社情報として、強い事業や魅力などを教えて。`,
        content: `${prompt}の会社情報として、次の例と同等レベルの情報を教えて。海外進出してるかも教えて
                「#26卒
        【ファーストリテイリング インターン対策】

        ユニクロ、GUの会社だね
        ここは採用人数多いだけじゃなく、1000万到達の社員もかなり多い

        アンケート提出後、すぐに適性テストだったはずなので対策してから出そうね

        締切9/17
        年収959万

        面接まで使えるガッツリ企業研究
        ①売上2.13兆円の圧倒的キング
        ②店舗数　UNIQLO：810　GU：439　海外：1502
        ③テック企業と言われるほどのDX力！

        まずファーストリテイリングというアパレル会社は、国内シェア1割に到達するほど、圧倒的なキングです

        売上やシェアでは、すでに国内に敵はおらず
        UNIQLOやGUとどのように差別化を図るかというのが、他の企業のやることになっている

        営業利益率も高めで2490億

        を物語っている

        国内の2位はしまむらを比較材料にすると
        売上5.8億　利益494億

        正直ビジネスをやるならこれだけで、選択理由としては充分だけど、面接で色々言えるように情報も出していくね

        UNIQLOのビジネスを支えているのは圧倒的な『面』
        3527店を世界中で展開

        数字が経営力

        そして、その店舗は地域に根ざした形で、エリート店長が運営している

        人口比率や過去のデータ、季節ごとのディスプレイ
        イベント情報など

        しっかりと『地域密着』で売上をあげられる人材教育がされており、店長の給料も大手企業の役員レベルに高い

        ここからは実際に株主に向けて発信している情報から就活に使える情報を出していくよ

        企業理念
        「服を変え、常識を変え、世界を変えていく」

        服づくりのコンセプト
        LifeWear（究極の普段着）は、あらゆる人の生活をより豊かにする、生活ニーズから考え抜かれたシンプルで上質な服

        昨年の実績のレビュー
        UNIQLO
        、外出ニーズの高まりに伴い、感動ジャケット・感動パンツやシャツの販売が好調だったことに加え、７月以降は気温が高く推移したことから夏物商品が好調となり、同4.7％増収

        海外が特に好調
        コア商品の情報発信やブランディングの強化により、ユニクロのプレゼンスが徐々に確立され、売上を大きく伸ばす
        売上収益は１兆1,187億円（前期比20.3％増)、営業利益は1,583億円（同42.4％増)

        これは大幅増　どころじゃないよな

        GU
        こちらは人気商品のストックを切らしたこと、商品数を多く展開しすぎたことが原因で、少し苦戦
        カラースラックスやスウェット風のＴシャツなどマストレンドを捉えた商品の販売には成功したと発信されていました

        UNIQLOは東レと共同開発した素材で独自の機能性がある衣服の作成から、カゴから出すことなく会計ができる無人レジの導入など

        最新技術を取り入れるのも非常にうまいです

        究極のLifeWearを世界中に展開するために前進を続ける会社ですので、是非受けてみてください

        適性テストについては、一度この2つで結果を見ておくといいよ

        特に性格診断系で、どんな人物像に見られるかは必ず知っておこう
        1個目
        https://d-ap.net/link.php?i=phq8o2bqfb3d&m=mgzcs8f77w0u
        ここの適性テストは必ず受けて欲しい！
        最初の基本情報を入れれば、ソース100万人の正確な適性テストが受けられる

        2個目
        https://d-ap.net/link.php?i=phlve8sxuq98&m=mgzcs8f77w0u
        Android↓
        https://d-ap.net/link.php?i=phlve99l3pn4&m=mgzcs8f77w0u

        どっちもやって15分ぐらいだと思う」
        `,
      },
    ],
  });
  //`${prompt}の会社情報として、「平均年収、就職難易度、面接で使える企業情報、売上(前期比も)、利益(前期比も)、店舗数、魅力、企業理念」を教えて。答えられるものだけでいい。答えられませんは避けて。できるだけ情報量、文字数は多くして。`
  //`${prompt}の会社情報として、「何してる会社かを」200文字以内詳しく教えて。それ以外の文章は含まず。`
  //`${prompt}の会社情報として、「強み：　、企業理念：　、求める人物：　」のように200文字以内で3つ教えて。それ以外の文章は含まず。`
  console.log(completion.choices[0].message.content);
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

const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
