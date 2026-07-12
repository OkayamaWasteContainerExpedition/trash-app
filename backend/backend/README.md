# OkayamaWasteContainerExpedition Backend

岡山地域のごみ箱情報をローカルPC上で保存・取得する FastAPI バックエンドです。製品要件と実装方針は [../agents/AGENTS.md](../agents/AGENTS.md) を基準にしています。

## 動作環境

- Python 3.11 以上
- クラウドアカウント、外部DB、Docker は不要
- 既定の待ち受け先は `127.0.0.1:8000`

## セットアップ

```bash
python3 -m venv ../.venv
../.venv/bin/python -m pip install --upgrade pip
../.venv/bin/python -m pip install -e ".[dev]"
```

Windows PowerShell の場合:

```powershell
py -3 -m venv ..\.venv
..\.venv\Scripts\python.exe -m pip install --upgrade pip
..\.venv\Scripts\python.exe -m pip install -e ".[dev]"
```

## 設定

`.env` は任意です。設定しない場合もローカル既定値で起動します。変更したい場合は `.env.example` を参考に `.env` を作成してください。

主な既定値:

- `APP_HOST=127.0.0.1`
- `APP_PORT=8000`
- `DATABASE_URL=sqlite:///./data/okayama_waste_containers.db`
- `UPLOAD_DIR=./data/uploads`
- `MAX_UPLOAD_BYTES=10485760`

LAN上の別端末へ公開する設定は既定ではありません。必要な場合のみ `APP_HOST=0.0.0.0` を明示的に指定してください。

## 起動

開発用:

```bash
../.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

通常のローカル実行:

```bash
../.venv/bin/python -m app
```

ブラウザで開くURL:

- API: <http://127.0.0.1:8000>
- Swagger UI: <http://127.0.0.1:8000/docs>
- Swagger alias: <http://127.0.0.1:8000/swagger>
- OpenAPI schema: <http://127.0.0.1:8000/openapi.json>

## ローカルデータ

アプリ起動時に `data/` と `data/uploads/` がなければ自動作成されます。

- SQLite DB: `data/okayama_waste_containers.db`
- アップロード画像: `data/uploads/`

バックアップは `data/` ディレクトリをコピーしてください。DBファイル、アップロード画像、`.env` は Git にコミットしない設定です。

## MVP API

### 一覧取得

```bash
curl http://127.0.0.1:8000/api/v1/containers
```

### 詳細取得

```bash
curl http://127.0.0.1:8000/api/v1/containers/1
```

### 新規登録

```bash
curl -X POST http://127.0.0.1:8000/api/v1/containers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "後楽園 入口横",
    "latitude": 34.6671,
    "longitude": 133.9358,
    "memo": "開園時間内に利用可能",
    "image_url": "/uploads/2f82957c-4e8a-4e56-87d3-646f4e113ca8.jpg"
  }'
```

### 画像アップロード

```bash
curl -X POST http://127.0.0.1:8000/api/v1/container-images \
  -F "file=@./sample.jpg;type=image/jpeg"
```

レスポンス例:

```json
{
  "image_url": "/uploads/2f82957c-4e8a-4e56-87d3-646f4e113ca8.jpg"
}
```

返却されたURLは `http://127.0.0.1:8000/uploads/<filename>` として取得できます。

## 検証コマンド

```bash
../.venv/bin/python -m ruff check .
../.venv/bin/python -m ruff format --check .
../.venv/bin/python -m pytest -q
```
