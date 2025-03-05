import requests
import datetime
import pandas as pd
import time
import zipfile
import warnings
import os
import sys
import urllib.request
from glob import glob
import chardet
from dateutil.relativedelta import relativedelta
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(".env")
# mongoURI = os.getenv()
client = MongoClient("mongodb+srv://ryuhosoy:Buchan-ryuhei1@cluster0.utalj.mongodb.net/")

# 警告を特定のものに限定する
warnings.filterwarnings("ignore", category=DeprecationWarning)


class GetDocid:
    # 1 コンストラクタ・日付リストの作成
    def __init__(self, start_date, end_date):
        self.start_date = start_date
        self.end_date = end_date
        self.day_list = self.create_day_list()

    def create_day_list(self):
        day_list = []
        period = (self.end_date - self.start_date).days
        for d in range(period + 1):
            day = self.start_date + datetime.timedelta(days=d)
            day_list.append(day)
        return day_list

    # 2 レポートリストの作成
    def create_report_list(self):
        report_list = []
        for day in self.day_list:
            url = "https://api.edinet-fsa.go.jp/api/v2/documents.json"
            params = {
                "date": day,
                "type": 2,
                "Subscription-Key": "39459a691efa40a19a37ef106ab93e73",
            }
            try:
                res = requests.get(url, params=params)
                res.raise_for_status()
                json_data = res.json()
                time.sleep(3)  # APIのレート制限に従って調整
            except requests.RequestException as e:
                print(f"Request failed: {e}")
                continue

            for result in json_data.get("results", []):
                if result["ordinanceCode"] == "010" and result["formCode"] == "030000":
                    report_list.append(
                        {
                            "会社名": result["filerName"],
                            "書類名": result["docDescription"],
                            "docID": result["docID"],
                            "証券コード": result["secCode"],
                            "ＥＤＩＮＥＴコード": result["edinetCode"],
                            "決算期": result["periodEnd"],
                            "提出日": day,
                        }
                    )
        return report_list

    # 3 データフレームの作成と保存
    def create_docid_df(self, base_dir):
        # ファイルパスを動的に設定
        zip_url = "https://disclosure2dl.edinet-fsa.go.jp/searchdocument/codelist/Edinetcode.zip"
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
            return None

        # ZIPファイルの展開
        try:
            with zipfile.ZipFile(zip_path, "r") as zip_f:
                zip_f.extractall(extract_dir)
            print(f"Extracted zip file to {extract_dir}")
        except zipfile.BadZipFile:
            print("Failed to unzip the file")
            return None

        # CSVファイルの読み込み
        try:
            df_info = pd.read_csv(df_info_path, encoding="cp932", skiprows=[0])
            df_report = pd.DataFrame(self.create_report_list())
            df_info = df_info[["ＥＤＩＮＥＴコード", "提出者業種"]]
            merged_df = pd.merge(
                df_report, df_info, how="inner", on="ＥＤＩＮＥＴコード"
            )
            merged_df.to_csv(output_path, index=False)
            print(f"Data saved to {output_path}")
        except Exception as e:
            print(f"Failed to process data: {e}")
            return None

        return merged_df


start_date = datetime.date(2024, 3, 1)
end_date = datetime.date.today()

gd = GetDocid(start_date, end_date)
edinet_df = gd.create_docid_df("../content-edinet")
print(edinet_df)

docid_list = edinet_df["docID"].tolist()

print(docid_list)

from datetime import datetime


def translate_period(report_end_date: str, duration: str) -> str:
    """duration を対応する日付情報に変換"""
    report_end_date_datetime = datetime.strptime(report_end_date, "%Y-%m-%d")
    if duration == "CurrentYearInstant":
        return report_end_date_datetime.strftime("%Y-%m-%d")
    else:
        n_year = int(duration[5])
        n_year_previous_date = report_end_date_datetime - relativedelta(years=n_year)
        return n_year_previous_date.strftime("%Y-%m-%d")


# docid_listから一つずつダウンロードしていき、売り上げを取得
for docId in docid_list:
    docID = docId
    url = f"https://api.edinet-fsa.go.jp/api/v2/documents/{docID}?type=5&Subscription-Key=39459a691efa40a19a37ef106ab93e73"
    output_dir = "../content-edinet/financial_zip_files"
    
    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)
    
    companyName = edinet_df[edinet_df["docID"] == docID]["会社名"].tolist()[0]
    print(companyName)

    try:
        # ZIPファイルのダウンロード
        with urllib.request.urlopen(url) as res:
            content = res.read()
            output_path = os.path.join(output_dir, f"{docID}.zip")
        with open(output_path, "wb") as file_out:
            file_out.write(content)
            print(f"File saved to {output_path}")
    except urllib.error.HTTPError as e:
        if e.code >= 400:
            sys.stderr.write(e.reason + "\n")
        else:
            raise e

    # 解凍先のディレクトリを作成
    extract_dir = os.path.join(output_dir, docID)
    os.makedirs(extract_dir, exist_ok=True)

    with zipfile.ZipFile(output_path) as zip_f:
        zip_f.extractall(extract_dir)

    # 一つずつのdocId(S-----)に対してjpcrpを名前に含むcsvファイルを読みこみ、jpcrp_cor:NetSalesSummaryOfBusinessResultsのCurrentYearDurationをprintする

    xbrl_expression = f"../content-edinet/financial_zip_files/{docID}/XBRL_TO_CSV/jpcrp*"
    xbrl_paths = glob(xbrl_expression, recursive=True)
    print(xbrl_paths)
    # print(xbrl_paths[0])

    # ファイルのエンコーディングを検出
    with open(xbrl_paths[0], "rb") as file:
        result = chardet.detect(file.read())
    encoding = result["encoding"]

    # 検出したエンコーディングでファイルを読み込む
    df = pd.read_csv(xbrl_paths[0], sep="\t", encoding=encoding, on_bad_lines="skip")
    # print(df)

    # 読み込み済みのデータフレームから、指定された要素IDの行のみを取得
    target_element_id_averageAge = "jpcrp_cor:AverageAgeYearsInformationAboutReportingCompanyInformationAboutEmployees"  # ok
    target_element_id_averageLengthOfService = "jpcrp_cor:AverageLengthOfServiceYearsInformationAboutReportingCompanyInformationAboutEmployees"  # ok
    target_element_id_averageAnnualSalary = "jpcrp_cor:AverageAnnualSalaryInformationAboutReportingCompanyInformationAboutEmployees"  # ok
    target_element_id_numberOfEmployees = "jpcrp_cor:NumberOfEmployees"  # ok
    target_element_id_descriptionOfBusiness = (
        "jpcrp_cor:DescriptionOfBusinessTextBlock"  # ok
    )
    target_element_id_representativeName = (
        "jpcrp_cor:TitleAndNameOfRepresentativeCoverPage"  # ok
    )

    filtered_df_element_averageAge = df[df["要素ID"] == target_element_id_averageAge]
    filtered_df_element_averageLengthOfService = df[
        df["要素ID"] == target_element_id_averageLengthOfService
    ]
    filtered_df_element_averageAnnualSalary = df[
        df["要素ID"] == target_element_id_averageAnnualSalary
    ]
    filtered_df_element_descriptionOfBusiness = df[
        df["要素ID"] == target_element_id_descriptionOfBusiness
    ]
    filtered_df_element_representativeName = df[
        df["要素ID"] == target_element_id_representativeName
    ]

    print(
        "averageAge",
        filtered_df_element_averageAge["値"].tolist()[0]
        if filtered_df_element_averageAge["値"].tolist()
        else "None",
    )
    print(
        "averageLengthOfService",
        filtered_df_element_averageLengthOfService["値"].tolist()[0]
        if filtered_df_element_averageLengthOfService["値"].tolist()
        else "None",
    )
    print(
        "averageAnnualSalary",
        filtered_df_element_averageAnnualSalary["値"].tolist()[0]
        if filtered_df_element_averageAnnualSalary["値"].tolist()
        else "None",
    )
    print(
        "descriptionOfBusiness",
        filtered_df_element_descriptionOfBusiness["値"].tolist()[0]
        if filtered_df_element_descriptionOfBusiness["値"].tolist()
        else "None",
    )
    print(
        "representativeName",
        filtered_df_element_representativeName["値"].tolist()[0]
        if filtered_df_element_representativeName["値"].tolist()
        else "None",
    )

    # 結果を表示
    # print("all of result", filtered_df_element)

    durations = [
        "CurrentYearInstant",
        "Prior1YearInstant",
        "Prior2YearInstant",
        "Prior3YearInstant",
        "Prior4YearInstant",
    ]

    company_numberOfEmployees_dict = {}
    company_netsales_dict = {}

    # 会社ごとの売り上げをdurationごとに取得
    for duration in durations:
        target_context_id = duration
        filtered_df_numberOfEmployees = df[
            (df["要素ID"] == target_element_id_numberOfEmployees)
            & (df["コンテキストID"] == target_context_id)
        ]

        # filtered_df_netsales = df[
        #     (df["要素ID"] == target_element_id_netsales)
        #     & (df["コンテキストID"] == target_context_id)
        # ]

        # key = "jpcrp_cor:CurrentFiscalYearEndDateDEI"、context_ref = "FilingDateInstant"のデータを取得し、report_end_dateとして日付を取得
        target_element_id_CFYEDD = "jpdei_cor:CurrentFiscalYearEndDateDEI"
        target_context_id = "FilingDateInstant"
        filtered_df_reportenddate = df[
            (df["要素ID"] == target_element_id_CFYEDD)
            & (df["コンテキストID"] == target_context_id)
        ]
        report_end_date = (
            filtered_df_reportenddate["値"].tolist()[0]
            if filtered_df_reportenddate["値"].tolist()
            else "None",
        )

        print(
            translate_period(report_end_date[0], duration) + ":",
            filtered_df_numberOfEmployees["値"].tolist()[0]
            if filtered_df_numberOfEmployees["値"].tolist()
            and "－" not in filtered_df_numberOfEmployees["値"].tolist()
            else "None",
        )
        # {CurrentYearDuration: 22121}のように辞書に追加していく
        company_numberOfEmployees_dict[
            translate_period(report_end_date[0], duration)
        ] = (
            filtered_df_numberOfEmployees["値"].tolist()[0]
            if filtered_df_numberOfEmployees["値"].tolist()
            and "－" not in filtered_df_numberOfEmployees["値"].tolist()
            else "None"
        )

    print("company_numberOfEmployees_dict", company_numberOfEmployees_dict)

    # [[日付, 売り上げ値], [日付, 売り上げ値], [日付, 売り上げ値]]の配列を作り、mongodbのcompanyNameに入れる
    numberOfEmployeesForInsertToDB = [
        [None for _ in range(2)] for _ in range(len(company_numberOfEmployees_dict))
    ]
    count = 0
    for key, value in company_numberOfEmployees_dict.items():
        numberOfEmployeesForInsertToDB[count][0] = key
        numberOfEmployeesForInsertToDB[count][1] = value
        count += 1
    print("numberOfEmployeesForInsertToDB", numberOfEmployeesForInsertToDB)

    netsalesForInsertToDB = [
        [None for _ in range(2)] for _ in range(len(company_numberOfEmployees_dict))
    ]
    count = 0
    for key, value in company_numberOfEmployees_dict.items():
        netsalesForInsertToDB[count][0] = key
        netsalesForInsertToDB[count][1] = value
        count += 1
    print("numberOfEmployeesForInsertToDB", netsalesForInsertToDB)

    try:
        # companiesにはそれぞれ会社名、売り上げ、オフィス場所などが格納されている
        # 会社名も取得し、以下の形式でdatabaseへinsertする
        # {
        #     "companyName": "-",
        #     "netsales": [], → [[日付, 売り上げ値], [日付, 売り上げ値], [日付, 売り上げ値]]
        # }

        database = client.get_database("syukatu")
        companies = database.get_collection("companies")
        # 会社名が見つかれば上書き、見つからなければ会社を新しく作り挿入
        if companies.find_one({"companyName": companyName}):
            companies.update_one(
                {"companyName": companyName},
                # {"$set": {"netsales": netsalesForInsertToDB}},
                {
                    "$set": {
                        "averageAge": filtered_df_element_averageAge["値"].tolist()[0]
                        if filtered_df_element_averageAge["値"].tolist()
                        else "None",
                        "averageLengthOfService": filtered_df_element_averageLengthOfService[
                            "値"
                        ].tolist()[0]
                        if filtered_df_element_averageLengthOfService["値"].tolist()
                        else "None",
                        "averageAnnualSalary": filtered_df_element_averageAnnualSalary[
                            "値"
                        ].tolist()[0]
                        if filtered_df_element_averageAnnualSalary["値"].tolist()
                        else "None",
                        "descriptionOfBusiness": filtered_df_element_descriptionOfBusiness[
                            "値"
                        ].tolist()[0]
                        if filtered_df_element_descriptionOfBusiness["値"].tolist()
                        else "None",
                        "representativeName": filtered_df_element_representativeName[
                            "値"
                        ].tolist()[0]
                        if filtered_df_element_representativeName["値"].tolist()
                        else "None",
                        "numberOfEmployees": numberOfEmployeesForInsertToDB,
                    }
                },
            )
        else:
            companies.insert_one(
                {
                    "companyName": companyName,
                    "averageAge": filtered_df_element_averageAge["値"].tolist()[0]
                    if filtered_df_element_averageAge["値"].tolist()
                    else "None",
                    "averageLengthOfService": filtered_df_element_averageLengthOfService[
                        "値"
                    ].tolist()[0]
                    if filtered_df_element_averageLengthOfService["値"].tolist()
                    else "None",
                    "averageAnnualSalary": filtered_df_element_averageAnnualSalary[
                        "値"
                    ].tolist()[0]
                    if filtered_df_element_averageAnnualSalary["値"].tolist()
                    else "None",
                    "descriptionOfBusiness": filtered_df_element_descriptionOfBusiness[
                        "値"
                    ].tolist()[0]
                    if filtered_df_element_descriptionOfBusiness["値"].tolist()
                    else "None",
                    "representativeName": filtered_df_element_representativeName[
                        "値"
                    ].tolist()[0]
                    if filtered_df_element_representativeName["値"].tolist()
                    else "None",
                    "numberOfEmployees": numberOfEmployeesForInsertToDB,
                }
            )

    except Exception as e:
        raise Exception("Unable to find the document due to the following error: ", e)

client.close()
