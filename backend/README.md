# OkayamaWasteContainerExpedition

このリポジトリのバックエンド実装は [`backend/`](backend/) にあります。

```bash
cd backend
python3 -m venv ../.venv
../.venv/bin/python -m pip install -e ".[dev]"
../.venv/bin/python -m app
```

Swagger UI は起動後に <http://127.0.0.1:8000/docs> または <http://127.0.0.1:8000/swagger> で確認できます。
