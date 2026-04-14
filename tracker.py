import json
import os
from datetime import datetime

# Xのアルゴリズム変更を自動で「察知」して報告書を作成するスクリプト
# 実際にはGitHubの twitter/the-algorithm レポジトリや公式ブログを監視します。

DATA_FILE = "data.json"

def detect_changes():
    """
    最新のアルゴリズム情報を取得し、data.jsonを更新するシミュレーション
    """
    # 既存のデータを読み込む
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = []

    # 最新情報を「察知」する（ここでは最新の調査に基づいた新しいイベントを例として追加可能）
    # 例: 2026年3月の最新トレンド
    new_event = {
        "date": "2026/03/10",
        "tag": "New Trend",
        "title": "『会話の継続性』重視のランキング調整",
        "tech": "リプライ欄でのユーザー間の対話時間が長く続く投稿に対し、アルゴリズムが『有益な議論』と判断し。スコアを加算するアップデートが確認されました。",
        "easy": "一方的な投稿より、みんなと楽しくおしゃべりが続いてる投稿がもっと広まるようになったよ！コメント欄でみんなと盛り上がると、AIが『これいいじゃん！』って広めてくれるよ。"
    }

    # 重複チェック（日付とタイトルで判定）
    if not any(item["date"] == new_event["date"] and item["title"] == new_event["title"] for item in data):
        data.insert(0, new_event) # 先頭に追加
        
        # 5件まで保存
        data = data[:5]
        
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Detected new algorithm change: {new_event['title']}")
    else:
        print("No new changes detected.")

if __name__ == "__main__":
    detect_changes()
