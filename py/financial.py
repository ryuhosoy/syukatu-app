import requests
import pandas as pd
import urllib.request
import time
import sys
import os
import warnings
import zipfile
from glob import glob
import chardet

# APIのエンドポイント
url = "https://disclosure.edinet-fsa.go.jp/api/v2/documents.json"

api_key = "39459a691efa40a19a37ef106ab93e73"

# パラメータの設定（例: 2024年5月17日の書類を取得）
params = {
    "date": "2024-05-17",
    "type": 2,  # 2は有価証券報告書などの決算書類
    "Subscription-Key": api_key,
}

# APIリクエストを送信
response = requests.get(url, params)

# レスポンスのJSONデータを取得
data = response.json()
# print(data)

# データフレームに変換
documents = data["results"]
df = pd.DataFrame(documents)

# 特定のカラムだけを選択
df_filtered = df[
    ["docID", "secCode", "edinetCode", "filerName", "docDescription", "submitDateTime"]
]

# 決算情報のみをフィルタリング
df_financial = df_filtered[
    df_filtered["docDescription"].str.contains("有価証券報告書", na=False)
]
# print(df_financial)

# ドキュメントのダウンロード
# for index, doc in df_financial.iterrows():
#     docID = doc["docID"]
#     url = f"https://api.edinet-fsa.go.jp/api/v2/documents/{docID}?type=5&Subscription-Key={api_key}"
#     output_dir = "./financial_zip_files"

#     print(
#         doc["edinetCode"],
#         doc["docID"],
#         doc["filerName"],
#         doc["docDescription"],
#         doc["submitDateTime"],
#         sep="\t",
#     )

#     try:
#     # ZIPファイルのダウンロード
#         with urllib.request.urlopen(url) as res:
#             content = res.read()
#             output_path = os.path.join(output_dir, f"{docID}.zip")  # ファイルパスを結合
#         with open(output_path, "wb") as file_out:
#             file_out.write(content)
#             print(f"File saved to {output_path}")
#     except urllib.error.HTTPError as e:
#         if e.code >= 400:
#             sys.stderr.write(e.reason + "\n")
#         else:
#             raise e

os.makedirs(f"financial_zip_files/S100T722", exist_ok=True)
with zipfile.ZipFile(f"financial_zip_files/S100T722.zip") as zip_f:
    zip_f.extractall(f"financial_zip_files/S100T722")

xbrl_expression = f"financial_zip_files/S100T722/XBRL_TO_CSV/*.csv"
xbrl_paths = glob(xbrl_expression, recursive=True)
print(xbrl_paths)
print(xbrl_paths[5])

# ファイルのエンコーディングを検出
with open(xbrl_paths[5], "rb") as file:
    result = chardet.detect(file.read())
encoding = result["encoding"]
print(f"Detected encoding: {encoding}")

# 検出したエンコーディングでファイルを読み込む
df = pd.read_csv(xbrl_paths[5], sep='\t', encoding=encoding, on_bad_lines="skip")
print(df.iloc[:])

# 読み込み済みのデータフレームから、指定された要素IDの行のみを取得
target_id = "jppfs_cor:Assets"
filtered_df_element = df[df["要素ID"] == target_id]

# 結果を表示
print(filtered_df_element)


#これからやること→期間を指定するとデータフレームが取れるようにする
#1. 