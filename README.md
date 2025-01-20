# 就活支援アプリケーション

## 概要
就活生が企業の情報を簡単に検索・管理できるWebアプリケーションです。

## 主な機能
- 企業検索機能
  - 企業名から企業の強み、企業理念、求める人物像などを検索
  - ChatGPTを活用した企業情報の要約表示
- お気に入り企業管理機能
- 企業のオフィス位置をGoogleマップで表示
- 企業の最新ニュース表示機能(Bing News API連携)
- 上場企業の財務情報表示(EDINET API連携)
- ユーザー認証機能

## 技術スタック
- フロントエンド
  - React
  - React Router
- バックエンド
  - Node.js
  - Express
- データベース
  - MongoDB
- 外部API
  - OpenAI API (ChatGPT)
  - Bing News API
  - EDINET API
  - Google Maps API

## セットアップ方法
1. リポジトリをクローン
2. 必要な環境変数を設定
3. 依存パッケージをインストール
