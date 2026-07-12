# AGENTS.md

## 1. プロジェクトの目的

このリポジトリでは、岡山地域の旅行者や市民が周辺のごみ箱を探し、新しい設置場所を登録できる地図ベースのアプリケーション **OkayamaWasteContainerExpedition** の FastAPI バックエンドを実装する。

本プロジェクトの最終成果物はクラウドサービスではなく、**利用者の1台のPC上で動作するローカルアプリケーション**である。開発時だけローカルで動かすのではなく、完成後もローカル環境で利用する。

Codex は次の目標を最優先する。

1. クラウドアカウントや外部サーバーなしで実行できること。
2. アプリケーションデータとアップロード画像をすべて利用者のローカルディスクに保存すること。
3. 既定の実行状態では外部ネットワークへ公開しないこと。
4. インストールと起動手順が簡単で再現可能であること。
5. アプリケーションを終了して再起動しても登録データが保持されること。

製品要件の基準文書は `backend(2).md` とする。リポジトリへ追加する際は、必要に応じて `docs/backend-design.md` などの安定したパスへ移動し、本ファイル内の参照も更新する。利用者から明示的な依頼がない限り、製品要件文書を独断で変更しない。

## 2. ローカルファースト原則

すべての技術選定と実装判断は、次の原則に従う。

- 最終実行対象は Windows、macOS、Linux の一般的なPC1台とする。
- 実行中にインターネット接続、クラウドAPI、リモートDBがなくても、バックエンドの主要機能が動作すること。
- 既定のサーバーアドレスは `127.0.0.1` とし、利用者の明示的な依頼がない限り `0.0.0.0` で公開しない。
- データベースはプロジェクト内のローカルデータディレクトリに置く SQLite ファイルを使用する。
- アップロード画像はプロジェクト内のローカルデータディレクトリに保存する。
- APIレスポンスに本番ドメインや特定PCの絶対パスを含めない。
- Unix 固有機能に依存せず、ファイルパスは `pathlib.Path` で扱う。
- 外部テレメトリ、分析SDK、エラー収集SaaSを追加しない。
- 利用者が依頼しない限り、Docker、Kubernetes、Nginx、systemd、CI/CD、クラウド配備設定を作成しない。

依存関係のインストールにはインターネット接続が必要な場合があるが、インストール完了後は4つのMVP APIが外部サービスなしで動作すること。

## 3. MVP の範囲

対応する利用フローは次の4つに限定する。

1. 地図上でごみ箱一覧を確認する。
2. 特定のごみ箱の詳細情報を取得する。
3. ごみ箱の写真をアップロードする。
4. 新しいごみ箱の位置を登録する。

MVP API は次の4つに限定する。

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/api/v1/containers` | 地図に表示するごみ箱一覧の取得 |
| `GET` | `/api/v1/containers/{container_id}` | 特定のごみ箱詳細の取得 |
| `POST` | `/api/v1/containers` | 新しいごみ箱の登録 |
| `POST` | `/api/v1/container-images` | 画像をアップロードし、ローカル静的ファイルURLを返す |

利用者から明示的な依頼がない限り、次の機能を追加しない。

- 認証、会員登録、ユーザーアカウント
- 更新・削除API
- 評価、コメント、通報、管理者審査、お気に入り
- PostgreSQL、MySQL、Redis、検索サーバー
- S3 などのクラウドオブジェクトストレージ
- メッセージキュー、バックグラウンドワーカー、マイクロサービス
- 本番配備インフラや公開ドメイン設定
- 現在の4 APIに不要な抽象化や拡張機能

## 4. 固定技術仕様

- Backend: FastAPI
- ASGI server: Uvicorn
- Database: SQLite
- ORM: 既存リポジトリに別方針が明確に定義されていない限り SQLAlchemy 2.x スタイル
- 検証・シリアライズ: Pydantic v2 スタイル
- メインDBテーブル: `waste_containers`
- APIリソース名: `containers`
- ORMモデル名: `WasteContainer`
- 公開スキーマ名: `WasteContainerCreate`, `WasteContainerResponse`
- 画像保存先: ローカルファイルシステム
- API prefix: `/api/v1`
- 文字エンコーディング: UTF-8
- 日時保存基準: Asia/Tokyo

無関係な作業で SQLite やローカル画像保存方式を別サービスへ置き換えない。日本語・韓国語の文字列を欠損なく保存・取得できること。

## 5. 推奨リポジトリ構成

既に一貫した構成が存在する場合は、その構成を尊重する。空のリポジトリを初期化する場合は、特別な要件がない限り次の構成を使用する。

```text
.
├── AGENTS.md
├── README.md
├── pyproject.toml
├── .env.example
├── .gitignore
├── app/
│   ├── __init__.py
│   ├── __main__.py            # python -m app のローカル実行入口
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── containers.py
│   │           └── container_images.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── waste_container.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── waste_container.py
│   │   └── container_image.py
│   └── services/
│       ├── __init__.py
│       └── image_storage.py
├── data/
│   ├── .gitkeep
│   └── uploads/
│       └── .gitkeep
└── tests/
    ├── conftest.py
    ├── test_containers.py
    └── test_container_images.py
```

`data/` は実行時に生成される利用者データの既定保存先とする。実際の SQLite ファイルとアップロード画像は Git にコミットしない。

実装が1つしかない抽象レイヤー、汎用ベースリポジトリ、別DIフレームワークなど、現在の要件に不要な構造は作成しない。

## 6. ローカルデータとパス規則

既定のローカルデータ配置は次のとおり。

```text
data/
├── okayama_waste_containers.db
└── uploads/
    └── <uuid>.<extension>
```

規則:

- アプリ起動時、`data/` と `data/uploads/` が存在しなければ安全に作成する。
- 相対パスはターミナルの現在位置に依存させず、プロジェクトルート基準で解決する。
- DBファイルとアップロードディレクトリは設定で変更可能にする。
- 起動時に既存DBやアップロードファイルを削除・初期化しない。
- ローカルデータの保存場所を README に明記し、利用者がバックアップできるようにする。
- APIやログに `C:\...`、`/Users/...`、`/home/...` などの絶対パスを公開しない。
- 画像URLは `/uploads/<generated-filename>` 形式の相対URLとして保存・返却する。
- DBにはファイルシステムの絶対パスを保存しない。
- テストでは実際の `data/` を使わず、`tmp_path` ベースの一時DBとアップロードディレクトリを使用する。

利用者が明示的にポータブル配置やユーザーホーム保存を求めない限り、既定値はリポジトリルートの `data/` とする。

## 7. データモデル契約

`waste_containers` テーブルは次のカラムを持つ。

| カラム | 必須 | 契約 |
|---|---:|---|
| `id` | O | INTEGER 主キー |
| `name` | O | 地図カードに表示する名称 |
| `latitude` | O | `-90` 以上 `90` 以下 |
| `longitude` | O | `-180` 以上 `180` 以下 |
| `memo` | X | 利用可能時間、注意事項など |
| `image_url` | X | `/uploads/...` 形式の相対URL |
| `created_at` | O | Asia/Tokyo 作成日時 |
| `updated_at` | O | Asia/Tokyo 更新日時 |

新規実装の基本規則:

- 文字列入力の前後空白を除去する。
- 空白除去後の `name` が空なら拒否する。
- 既存契約がなければ `name` 100文字、`memo` 2,000文字を上限とする。
- 画像アップロード結果を登録リクエストへ渡せるよう、`WasteContainerCreate.image_url` は任意項目とする。
- クライアントから `id`、`created_at`、`updated_at` を指定できないようにする。
- Python・Pydantic境界では timezone-aware な `datetime` を使用し、ISO 8601 の Asia/Tokyo 形式でシリアライズする。
- 作成時は `created_at` と `updated_at` に同じ値を設定する。
- `updated_at` のためだけにMVPへ更新APIを追加しない。

DBセッションはリクエスト単位で作成する。書き込み成功時は commit 後に refresh し、失敗時は rollback する。変更可能なグローバル SQLAlchemy セッションを作成しない。

## 8. API 契約

### `GET /api/v1/containers`

- `200 OK` と `WasteContainerResponse` の配列を返す。
- データがない場合は `[]` を返す。
- 並び順は決定的であり、既定は `id` 昇順とする。
- 依頼される前にページネーション、地図bboxフィルター、検索パラメーターを追加しない。

### `GET /api/v1/containers/{container_id}`

- 存在する場合は `200 OK` と `WasteContainerResponse` を返す。
- 存在しない場合は `404 Not Found` を返す。
- `container_id` は正の整数として検証する。

### `POST /api/v1/containers`

- `WasteContainerCreate` に一致するJSONを受け取る。
- 保存済みの `WasteContainerResponse` を `201 Created` で返す。
- 不正な入力には FastAPI の `422 Unprocessable Entity` を使用する。
- 不正な座標を勝手に補正したり、項目を黙って破棄しない。

想定リクエスト:

```json
{
  "name": "後楽園 入口横",
  "latitude": 34.6671,
  "longitude": 133.9358,
  "memo": "開園時間内に利用可能",
  "image_url": "/uploads/2f82957c-4e8a-4e56-87d3-646f4e113ca8.jpg"
}
```

### `POST /api/v1/container-images`

- `multipart/form-data` の `file` フィールドを1つ受け取る。
- 次のレスポンスを `201 Created` で返す。

```json
{
  "image_url": "/uploads/<generated-filename>"
}
```

- 既定の許可形式は JPEG、PNG、WebP とする。
- 既定の最大サイズは10 MiBとし、ローカル設定で変更可能にする。
- UUIDベースのファイル名を生成し、許可リストにある正規化済み拡張子のみを使用する。
- クライアントから送られた元ファイル名を保存名に使用しない。
- 未対応形式は `415 Unsupported Media Type` で拒否する。
- サイズ超過は `413 Payload Too Large` で拒否する。
- 宣言されたMIMEタイプと基本的なファイルシグネチャを可能な範囲で確認する。
- 保存失敗時に不完全なファイルを残さない。
- 設定されたアップロードディレクトリを `/uploads` の静的ファイルとして公開する。
- パストラバーサルとファイル名衝突を防止する。

FastAPI の通常のJSONレスポンスを使用する。明示的な要件がない限り、全体を `{ "success": ..., "data": ... }` で包まない。

## 9. SQLite 規則

本プロジェクトはローカル単一利用者向けMVPのため、原則として1つの SQLite ファイルを使用する。

- 既定URLは `sqlite:///./data/okayama_waste_containers.db` とする。
- FastAPI リクエストで必要な SQLite 接続オプションを適用する。
- 起動時にテーブルがなければ `Base.metadata.create_all()` で作成してよい。
- 利用者がマイグレーション管理を求めない限り、Alembic を必須にしない。
- スキーマ変更時は既存ローカルデータを保持する方法を優先する。
- 既存DBの削除・再作成を通常のアップグレード手順にしない。
- テストDBと実データDBを明確に分離する。
- テーブル名を `containers` に変更したり、ORMモデル名を曖昧に省略しない。

既存リポジトリで Alembic を使用している場合はその方式を維持し、適用済み migration を変更せず新規 migration を追加する。

## 10. ローカル実行設定

環境変数は型付き settings オブジェクトから読み取る。`.env` がなくても安全なローカル既定値で起動できるようにし、コミット可能な `.env.example` を提供する。

推奨設定:

```text
APP_NAME=OkayamaWasteContainerExpedition API
API_V1_PREFIX=/api/v1
APP_HOST=127.0.0.1
APP_PORT=8000
DATABASE_URL=sqlite:///./data/okayama_waste_containers.db
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_BYTES=10485760
CORS_ORIGINS=http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:5173,http://localhost:5173
```

規則:

- `.env` は任意とする。
- 秘密鍵やクラウド資格情報がないと起動できない構成にしない。
- CORS はローカルfrontend originのみを明示的に許可する。
- credentials を許可しながら `allow_origins=["*"]` を使用しない。
- 既定の実行URLは `http://127.0.0.1:8000` とする。
- APIドキュメントは `http://127.0.0.1:8000/docs` で開けること。
- LAN上の別端末からの接続を利用者が求めた場合にのみ `APP_HOST=0.0.0.0` の使用方法を文書化する。
- 開発時は `--reload` を使用してよいが、最終ローカル実行コマンドでは既定で使用しない。
- 新規リポジトリでは `python -m app` で実行できる小さな `app/__main__.py` を用意し、`APP_HOST` と `APP_PORT` を Uvicorn へ渡す。同等の入口が既にある場合は重複作成しない。

## 11. 起動・終了時の動作

起動時に次を自動実行する。

1. ローカル設定を読み込む。
2. データディレクトリとアップロードディレクトリを作成する。
3. SQLite 接続を初期化する。
4. 必要なテーブルがなければ作成する。
5. `/uploads` の静的ファイルパスと `/api/v1` router を登録する。

起動時に次を行わない。

- 既存DBの初期化やサンプルデータの強制投入
- 既存アップロード画像の削除
- 外部サーバー接続確認
- クラウド資格情報の確認
- リモート migration 実行
- 外部テレメトリ送信

正常終了後に再起動しても、以前に登録した項目と画像をそのまま取得できること。

## 12. コーディング規則

- 公開関数、endpoint signature、dependency、service、戻り値に Python の型ヒントを付ける。
- 現行の FastAPI、Pydantic v2、SQLAlchemy 2.x の慣用表現を使用する。
- endpoint は薄く保つ。HTTP・検証は route、画像保存は service、永続化処理は明確に命名したコードへ分離する。
- 将来の仮想要件向けパターンより、現在のローカル要件を直接解決するコードを優先する。
- `container_id`、`waste_container`、`image_url` など意味が明確な名前を使う。
- より明確な名前が使えるローカル変数では、Python組み込み名、特に `id` を上書きしない。
- ファイルパスには `pathlib.Path` を使用する。
- アプリケーションコードでパス区切り文字を手動連結しない。
- 日時処理は Asia/Tokyo へ統一する。
- docstring は自明でない動作を説明する場合にのみ書く。
- 意図したアプリ境界でログ・変換後に再送出する場合を除き、広範な `except Exception` を使用しない。
- APIレスポンスへ stack trace、SQLエラー、絶対ファイルパスを公開しない。
- Unicode検証のため、テストに日本語文字列を含める。
- ローカルコンソールログは簡潔にし、画像の生バイトやrequest body全体を出力しない。

format と lint には Ruff を使用する。無関係なファイルを大規模に再formatしない。

## 13. 依存関係規則

- 既存の package manager と lockfile を維持する。
- 新規リポジトリでは `pyproject.toml` と再現可能な依存関係定義を使用する。
- 本番依存関係は最小限にする。
- 通常の本番依存候補は FastAPI、Uvicorn、SQLAlchemy、Pydantic Settings、`python-multipart` とする。
- SQLiteドライバーは Python 標準環境を使用する。
- 通常の開発依存候補は pytest、HTTPX、Ruff とする。
- 標準ライブラリや既存依存で解決できる場合は、新しい本番依存を追加しない。
- クラウドSDK、リモートDBドライバー、ジョブキュークライアントを追加しない。
- 新規依存を追加した場合は、最終変更概要に目的を記載する。

## 14. テスト要件

pytest と FastAPI TestClient または HTTPX ASGI transport を使用する。テストでは一時 SQLite DB と一時アップロードディレクトリを使用し、利用者の実ローカルデータを読み書きしない。

最低限の契約テスト:

1. 空DBの一覧取得が `200` と `[]` を返す。
2. 正常な登録が `201`、生成ID、timestampを返す。
3. 作成した項目が一覧・詳細取得に現れる。
4. 存在しないIDが `404` を返す。
5. 空の名前と範囲外座標が `422` を返す。
6. 任意項目と `image_url` を省略または null にできる。
7. 日本語文字列が登録・取得の往復で保持される。
8. 正常な JPEG、PNG、WebP が安全な `/uploads/...` パスを返す。
9. 未対応形式が `415` を返す。
10. サイズ超過が `413` を返す。
11. 保存名がサーバー側で生成され、ディレクトリ移動できない。
12. 返却された画像URLを静的ファイルmount経由で取得できる。
13. データディレクトリがなくても初期化時に自動作成される。
14. アプリまたはDBセッションを再初期化しても同じ一時DBのデータが保持される。
15. テスト実行がリポジトリの実 `data/` を変更しない。

テストは非公開の実装詳細より公開動作を検証する。バグ修正時は必ず回帰テストを追加する。

## 15. 実行・検証コマンド

まずリポジトリを確認し、既存 README と lockfile に定義されたコマンドを使用する。新規Pythonプロジェクトでは、選択した package manager で次と同等のコマンドを提供する。

```bash
# lint
python -m ruff check .

# formatting check
python -m ruff format --check .

# tests
python -m pytest -q
```

開発用ローカル実行:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

最終ローカル実行:

```bash
python -m app
```

`app/__main__.py` は既定で `127.0.0.1:8000` 上に reload なしで Uvicorn を起動する。既存プロジェクトに別 launcher がなければ、内部動作は次と同等にする。

```python
import uvicorn

from app.core.config import get_settings

settings = get_settings()
uvicorn.run(
    "app.main:app",
    host=settings.app_host,
    port=settings.app_port,
    reload=False,
)
```

`uv` などの runner を使用する場合は、`uv run pytest -q` のように同じモジュールをその runner 経由で実行する。

実行していないテストを通過したと報告しない。検証コマンドを実行できない場合は、正確なコマンド、失敗理由、未検証範囲を報告する。

## 16. README 要件

FastAPI が生成する OpenAPI schema と `/docs` が、実際のschema・status codeと一致すること。

`README.md` には次を最新状態で記載する。

- 対応Pythonバージョン
- 依存関係のインストール方法
- `.env` なしで起動する基本手順
- 任意の `.env` 設定方法
- 開発用実行コマンドと最終ローカル実行コマンド
- ブラウザで開くローカルURLと `/docs` URL
- DBファイルとアップロード画像の保存場所
- ローカルデータのバックアップは `data/` をコピーすればよいこと
- test、lint、formatting check コマンド
- 4つのMVP endpointに対するローカル `curl` 例
- LAN公開が既定ではないこと

README に製品設計書全文を重複記載せず、設計文書へのリンクを置く。クラウド配備手順は利用者から依頼された場合のみ別文書として追加する。

## 17. セキュリティとローカルデータ保護

ローカルアプリでも入力とファイルを信用しない。

- 画像アップロードとすべての文字列入力を検証する。
- アップロード内容をコードとして評価・実行しない。
- 許可した画像形式のみ、安全な生成ファイル名で保存する。
- パストラバーサルと既存ファイル上書きを防止する。
- 画像の生バイトや機密性のあるrequest bodyをログへ残さない。
- 絶対パス、環境変数値、DB内部エラーをAPIへ公開しない。
- ORMのparameterized queryを使用する。
- サーバーは既定で loopback interface のみに bind する。
- 利用者から依頼がない限り、認証のないAPIをLANやインターネットへ公開しない。
- 破壊的コマンドを避け、利用者が対象と範囲を明確に指定しない限り `data/` を削除しない。

`.gitignore` には最低限次を含める。

```gitignore
.env
.venv/
__pycache__/
.pytest_cache/
.ruff_cache/
*.pyc
data/*.db
data/*.db-*
data/uploads/*
!data/uploads/.gitkeep
```

## 18. Codex の作業手順

すべての作業で次の順序に従う。

1. 変更前に本ファイル、関連設計文書、現行実装を読む。
2. 依頼内容がローカル最終実行という目標と一致するか確認する。
3. 正常に動作している既存慣例を維持する。推奨構成と異なるという理由だけで全面書き換えしない。
4. API契約、DB schema、データパス、依存関係、または3ファイル以上へ影響する変更では、実装前に簡潔な計画を書く。
5. 依頼を満たす最小の完結した変更を実装する。
6. 変更した動作に対するテストを追加・修正する。
7. まず関連範囲の狭いテストを実行し、その後に全体の lint、format、test を実行する。
8. 可能であれば実際にローカルサーバーを起動し、`/docs`、API、静的画像URLを確認する。
9. diffを確認し、スコープ拡大、ローカルデータ破損、外部サービス依存、エラー処理漏れを探す。
10. 変更により古くなった README、`.env.example`、OpenAPI metadata を更新する。
11. 最終報告には、変更ファイル、主要動作、実際に実行した検証コマンドと結果、ローカルデータ保存場所、残る前提を含める。

無関係なファイルを変更したり、リポジトリ全体を一括再formatしない。コマンド結果を捏造したり、失敗した検証を隠さない。

## 19. 完了条件

次をすべて満たした時点で作業完了とする。

- 一般的なPC1台でバックエンドを実行できる。
- クラウドアカウント、外部DB、Dockerが不要である。
- 既定サーバーが `127.0.0.1` のみで待ち受ける。
- 起動時にローカルデータディレクトリと SQLite テーブルが安全に準備される。
- 登録データと画像が再起動後も保持される。
- 4つのMVP APIが製品設計と一致する。
- DBとアップロードパスをローカル設定で制御できる。
- テストが利用者の実 `data/` を変更しない。
- 関連 test、lint、formatting check が通過する。
- ローカルDB、実アップロード画像、`.env`、cache、仮想環境ファイルがコミットされない。
- READMEだけでインストール、起動、確認、データ保存場所の把握ができる。
- 最終応答に変更内容と検証内容が明確に記載される。

利用者の明示的な依頼が本ファイルと衝突する場合は利用者の依頼を優先する。ただし逸脱は必要最小限とし、最終概要に変更した前提を記載する。
