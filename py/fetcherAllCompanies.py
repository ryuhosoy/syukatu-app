import requests
import pandas as pd
import zipfile
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(".env")
mongoURI = os.getenv()
client = MongoClient("mongodb+srv://ryuhosoy:Buchan-ryuhei1@cluster0.utalj.mongodb.net/")

base_dir = "../content-edinet"

zip_url = (
    "https://disclosure2dl.edinet-fsa.go.jp/searchdocument/codelist/Edinetcode.zip"
)
zip_path = os.path.join(base_dir, "Edinetcode.zip")
extract_dir = os.path.join(base_dir, "Edinetcode")
df_info_path = os.path.join(extract_dir, "EdinetcodeDlInfo.csv")
output_path = os.path.join(base_dir, "csv", "edinet_df.csv")

# 必要なディレクトリを作成
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# ZIPファイルのダウンロード
try:
    print(f"Downloading zip file from {zip_url}...")
    with requests.get(zip_url, stream=True) as r:
        r.raise_for_status()  # HTTPエラーがあれば例外をスロー
    with open(zip_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
            print("Download completed successfully.")
except requests.RequestException as e:
    print(f"Failed to download zip file: {e}")

# ZIPファイルの展開
try:
    with zipfile.ZipFile(zip_path, "r") as zip_f:
        zip_f.extractall(extract_dir)
        print(f"Extracted zip file to {extract_dir}")
except zipfile.BadZipFile:
    print("Failed to unzip the file")

# CSVファイルの読み込み
try:
    df_info = pd.read_csv(df_info_path, encoding="cp932", skiprows=[0])
    print(df_info)
    for index, row in df_info.iterrows():
        companyName = row["提出者名"]
        try:
            database = client.get_database("syukatu")
            companies = database.get_collection("companies")
            # 会社名が見つかれば上書き、見つからなければ会社を新しく作り挿入
            if (
                not companies.find_one({"companyName": companyName})
                and row["提出者種別"] == "個人（組合発行者を除く）"
            ):
                companies.insert_one({"companyName": companyName})

            elif (
                companies.find_one({"companyName": companyName})
                and row["提出者種別"] == "個人（組合発行者を除く）"
            ):
                print(row["提出者種別"], companyName)
                companies.delete_one({"companyName": companyName})

            elif (
                companies.find_one({"companyName": companyName})
                and not row["提出者種別"] == "個人（組合発行者を除く）"
            ):
                print("companyName", companyName)
                print("location", row["所在地"])
                companies.update_one(
                    {"companyName": companyName},
                    {"$set": {"location": row["所在地"]}},
                )

        except Exception as e:
            raise Exception(
                "Unable to find the document due to the following error: ", e
            )

except Exception as e:
    print(f"Failed to process data: {e}")
