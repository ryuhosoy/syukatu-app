# 就活支援アプリケーション

## 概要
このアプリケーションは、就職活動中の学生をサポートするためのWebアプリケーションです。定期的にCSVファイルをダウンロードし、そこから企業情報を取得・分析し、AIによる将来予測、お気に入り機能など、就活に役立つ様々な機能を提供します。

## 主な機能
### データ収集・分析
- 企業情報の自動収集
  - CSVファイルの定期的な自動ダウンロード（日次更新）
  - データベースへの自動更新処理
  - データの整形・クレンジング
  - gBizINFO APIを利用した企業情報の取得、職場情報の取得（男女比率、平均勤続年数）

### 企業分析機能
- AIによる企業の将来性予測
- 財務データの可視化
  - 売上推移
  - 従業員数の推移
- 企業の基本情報表示
  - 平均年齢
  - 平均年間給与
  - 平均勤続年数
- 従業員データの分析
  - 男女比率
  - 女性従業員の勤続年数
- 企業の所在地（Google Maps連携）

### ユーザー機能
- お気に入り企業の登録・管理
- 企業の最新ニュース表示

## 技術スタック
### フロントエンド
- React.js
- Chart.js
- Google Maps API
- Axios

### バックエンド
- Node.js
- Express
- MongoDB

### 自動化システム
- Python（CSVファイルダウンロードの自動化）
- Github Actions (定期的なPython実行を自動化)

### 使用API
- OpenAI API（企業分析・将来予測）
- Google Maps API（企業所在地の表示）
- Bing News Search API（企業ニュースの取得）
- React Geocode API（住所から緯度経度への変換）
- EDINET API（企業の財務情報取得）
- gBizINFO API（企業の法人番号や所在地情報、職場情報の取得）
