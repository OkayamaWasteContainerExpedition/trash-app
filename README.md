<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Framework-Expo%20SDK%2054-blueviolet" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# 🌸 岡山ゴミ箱MapWiki

🌐 **Language / 言語**: **🇯🇵 日本語** | [🇰🇷 한국어](README.ko.md)

> **旅の途中で、岡山をちょっときれいに。**
>
> 岡山市内を歩く旅行者・地元ユーザーが、街中で見つけたゴミ箱の場所を写真・位置情報・分別情報と一緒に投稿し、みんなで共有できるコミュニティ型マップアプリです。

---

## 📖 目次

- [アプリ概要](#-アプリ概要)
- [主要機能](#-主要機能)
- [画面構成](#-画面構成)
- [技術スタック](#-技術スタック)
- [アーキテクチャ設計](#-アーキテクチャ設計)
- [デザインシステム](#-デザインシステム)
- [ディレクトリ構成](#-ディレクトリ構成)
- [データモデル](#-データモデル)
- [セットアップ & 起動方法](#-セットアップ--起動方法)
- [今後の開発計画](#-今後の開発計画)
- [ライセンス](#-ライセンス)

---

## 🗺️ アプリ概要

| 項目 | 内容 |
|------|------|
| **アプリ名** | 岡山ゴミ箱MapWiki |
| **コンセプト** | 岡山を旅しながら、街をちょっときれいにする地図アプリ |
| **対象ユーザー** | 岡山市内を歩く旅行者・地元住民 |
| **テーマ** | Sakura Travel Clean Map（桜旅 × 清潔感 × 地域貢献） |

### コンセプト

ゴミ箱のアプリでありながら、「汚い」印象を与えない設計思想を採用。春の岡山を歩くような、清潔でやさしい旅行アプリとしてのUXを目指しています。

ユーザーが **「かわいい」「便利」「地域に役立つ」** と感じるUIを実現します。

---

## ✨ 主要機能

### 🗺️ マップ探索
- 岡山市内のゴミ箱を地図上でリアルタイム表示
- カテゴリ別フィルタリング（燃えるごみ / ペットボトル / 缶 / ビン / プラスチック / 紙 / その他）
- 検索バーによるエリア検索
- 現在地へのワンタップ移動

### 📷 写真撮影
- カメラによるゴミ箱の撮影
- ライブラリからの写真選択
- 撮影ガイド枠の表示

### 📝 ゴミ箱登録
- 写真 + 位置情報 + 分別カテゴリの一括登録
- 地図上での位置微調整（モーダルマップ）
- 清潔度・見つけやすさの3段階評価
- 利用可能時間の設定
- AI による写真自動解析（モック実装）

### 📋 詳細表示 & 編集
- ゴミ箱の詳細情報表示（地図 + 写真付き）
- 「助かった！」ボタン
- 情報の編集提案・問題報告
- ゴミ箱の削除機能

---

## 📱 画面構成

本アプリは以下の **5画面** で構成されています。

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │
│  1. マップ    │───▶│  2. カメラ    │───▶│  3. 登録     │
│   (index)    │    │   (camera)   │    │  (register)  │
│              │    │              │    │              │
└──────┬───────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐
│              │    │              │
│  4. 詳細     │───▶│  5. 編集     │
│   (detail)   │    │    (edit)    │
│              │    │              │
└──────────────┘    └──────────────┘
```

| # | 画面名 | ファイル | 役割 |
|---|--------|----------|------|
| 1 | **メイン（マップ）** | `src/app/index.tsx` | 地図上でゴミ箱を探す・選択する |
| 2 | **カメラ** | `src/app/camera.tsx` | ゴミ箱の写真を撮影する |
| 3 | **ゴミ箱登録** | `src/app/register.tsx` | 撮影した写真と情報を入力して登録する |
| 4 | **ゴミ箱詳細** | `src/app/detail.tsx` | 選択したゴミ箱の詳細情報を確認する |
| 5 | **ゴミ箱編集** | `src/app/edit.tsx` | 既存のゴミ箱情報を編集する |

---

## 🛠️ 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| **フレームワーク** | Expo | SDK 54 |
| **言語** | TypeScript | ~6.0.3 |
| **UIフレームワーク** | React Native | 0.81.5 |
| **ルーティング** | Expo Router | ~6.0.24 (ファイルベース) |
| **地図** | react-native-maps | 1.20.1 |
| **カメラ** | expo-camera | ~17.0.10 |
| **画像選択** | expo-image-picker | ~17.0.11 |
| **位置情報** | expo-location | ~19.0.8 |
| **画像表示** | expo-image | ~3.0.11 |
| **ローカルストレージ** | @react-native-async-storage/async-storage | 2.2.0 |
| **アニメーション** | react-native-reanimated | ~4.1.1 |
| **ジェスチャー** | react-native-gesture-handler | ~2.28.0 |
| **コンパイラ** | React Compiler | 有効 |

---

## 🏗️ アーキテクチャ設計

### 全体構成

```
┌─────────────────────────────────────────────┐
│                  Expo Router                 │
│              (ファイルベースルーティング)        │
├─────────────────────────────────────────────┤
│                                             │
│   Screen Layer (画面コンポーネント)            │
│   ┌────────┐ ┌────────┐ ┌────────┐         │
│   │ index  │ │ camera │ │register│ ...      │
│   └───┬────┘ └───┬────┘ └───┬────┘         │
│       │          │          │               │
├───────┼──────────┼──────────┼───────────────┤
│       ▼          ▼          ▼               │
│           Context Layer (状態管理)            │
│   ┌─────────────────────────────────┐       │
│   │         BinContext              │       │
│   │  (ゴミ箱データの一元管理)          │       │
│   │  - bins[]  - selectedBin        │       │
│   │  - capturedImage                │       │
│   │  - addBin / updateBin / remove  │       │
│   └──────────────┬──────────────────┘       │
│                  │                          │
├──────────────────┼──────────────────────────┤
│                  ▼                          │
│           Storage Layer (永続化)             │
│   ┌─────────────────────────────────┐       │
│   │       AsyncStorage              │       │
│   │   @trash_bins_v1                │       │
│   └─────────────────────────────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│         Native APIs (ネイティブ連携)          │
│   ┌────────┐ ┌────────┐ ┌──────────┐       │
│   │ Camera │ │Location│ │ImagePicker│       │
│   └────────┘ └────────┘ └──────────┘       │
└─────────────────────────────────────────────┘
```

### 状態管理

**React Context** (`BinContext`) を用いたシンプルな状態管理を採用しています。

```typescript
// 主要な状態
bins: TrashBin[]            // 全ゴミ箱データ
selectedBin: TrashBin | null // 選択中のゴミ箱
capturedImage: string | null // 撮影済み画像のURI

// 操作関数
addBin()    → 新規登録 + AsyncStorage 永続化
updateBin() → 情報更新 + AsyncStorage 永続化
removeBin() → 削除 + AsyncStorage 永続化
```

### ルーティング

Expo Router のファイルベースルーティングを採用。`src/app/` ディレクトリ構造がそのままURLパスに対応します。

```
src/app/
├── _layout.tsx   → ルートレイアウト（BinProvider でラップ）
├── index.tsx     → /（マップ画面）
├── camera.tsx    → /camera（モーダル表示）
├── register.tsx  → /register
├── detail.tsx    → /detail
└── edit.tsx      → /edit
```

---

## 🎨 デザインシステム

### テーマ名：**Sakura Travel Clean Map**

#### 目指す印象
🌸 桜 ・ 🚶 春旅 ・ 🏯 岡山散歩 ・ ✨ 清潔感 ・ 🤝 地域貢献 ・ 😊 親しみやすさ

#### 避ける印象
❌ 汚い ・ ❌ 暗い ・ ❌ 重い ・ ❌ 業務アプリっぽい ・ ❌ 原色が多すぎる

### カラーパレット

| 用途 | 色名 | HEX | プレビュー |
|------|------|-----|-----------|
| **Primary** | Sakura Pink | `#F58FB2` | 🩷 |
| **Primary Light** | Sakura Mist | `#FFE6EF` | 🌸 |
| **Accent** | Okayama Peach | `#FFB6A3` | 🍑 |
| **Clean Accent** | Fresh Leaf | `#7CCFA6` | 🌿 |
| **Map Accent** | Setouchi Sky | `#8ECDF8` | 🌊 |
| **Background** | Warm Cream | `#FFF8F4` | 🤍 |
| **Surface** | White | `#FFFFFF` | ⬜ |
| **Text Main** | Charcoal | `#30323A` | ⬛ |
| **Text Sub** | Soft Gray | `#8A8F98` | ◽ |
| **Border** | Pale Rose Border | `#F3D8E2` | 🌷 |
| **Shadow** | Pink Shadow | `rgba(245,143,178,0.15)` | - |

### 配色ルール

- **Primary** は必ず Sakura Pink `#F58FB2`
- **背景** は Warm Cream `#FFF8F4` を基本
- **カード** は白 `#FFFFFF` で統一
- **CTAボタン** は桜ピンクを基準
- **緑** は成功・清潔・確認済みの状態だけに使用
- **影** は淡いピンク系で柔らかく（黒く重い影は禁止）

### UIスタイル

| 要素 | 仕様 |
|------|------|
| **角丸（カード）** | 24px |
| **角丸（ボタン）** | 999px（完全丸） / 18〜24px |
| **角丸（入力欄）** | 16px |
| **角丸（写真カード）** | 24px |
| **角丸（ボトムシート）** | 上部 32px |
| **アイコン** | 角丸アウトラインで統一 |
| **フォント** | 日本語が読みやすい丸みのあるゴシック体 |

---

## 📂 ディレクトリ構成

```
trush-app/
├── 📁 src/
│   ├── 📁 app/                    # 画面コンポーネント（Expo Router）
│   │   ├── _layout.tsx            #   ルートレイアウト & BinProvider
│   │   ├── index.tsx              #   マップ画面（メイン）
│   │   ├── camera.tsx             #   カメラ撮影画面
│   │   ├── register.tsx           #   ゴミ箱登録画面
│   │   ├── detail.tsx             #   ゴミ箱詳細画面
│   │   └── edit.tsx               #   ゴミ箱編集画面
│   ├── 📁 components/             # 再利用コンポーネント
│   │   ├── animated-icon.tsx      #   アニメーションアイコン
│   │   ├── app-tabs.tsx           #   タブナビゲーション
│   │   ├── external-link.tsx      #   外部リンク
│   │   ├── hint-row.tsx           #   ヒント行
│   │   ├── themed-view.tsx        #   テーマ対応View
│   │   ├── web-badge.tsx          #   Webバッジ
│   │   └── 📁 ui/                 #   基本UIコンポーネント
│   ├── 📁 constants/              # 定数定義
│   │   └── theme.ts               #   カラーパレット & デザイントークン
│   ├── 📁 contexts/               # React Context
│   │   └── BinContext.tsx          #   ゴミ箱データの状態管理
│   ├── 📁 hooks/                  # カスタムフック
│   │   ├── use-color-scheme.ts    #   カラースキーム検出
│   │   └── use-theme.ts           #   テーマフック
│   └── global.css                 # グローバルスタイル
├── 📁 app-detail/                 # アプリ仕様書
│   └── app-detail.txt             #   詳細仕様（デザイン・UI文言）
├── 📁 assets/                     # 静的アセット（画像・フォント等）
├── 📁 scripts/                    # ユーティリティスクリプト
├── app.json                       # Expo 設定
├── package.json                   # 依存関係管理
├── tsconfig.json                  # TypeScript 設定
└── LICENSE                        # MIT License
```

---

## 📊 データモデル

### TrashBin（ゴミ箱）

```typescript
interface TrashBin {
  id: string;                    // 一意識別子
  latitude: number;              // 緯度
  longitude: number;             // 経度
  title: string;                 // 場所名（例：「岡山駅東口 ベンチ横」）
  distance?: number;             // 現在地からの距離（m）
  categories: BinCategory[];     // 分別カテゴリ（複数選択可）
  cleanliness: Cleanliness;      // 清潔度（3段階）
  visibility: Visibility;        // 見つけやすさ（3段階）
  availableTime?: AvailableTime; // 利用可能時間
  memo: string;                  // メモ
  helpfulCount: number;          // 「助かった！」の数
  lastChecked: string;           // 最終確認日
  imageUrl?: string;             // ゴミ箱の写真URL
  isMine?: boolean;              // 自分が登録したかどうか
}
```

### 型定義

```typescript
// 分別カテゴリ
type BinCategory = '燃えるごみ' | 'ペットボトル' | '缶' | 'ビン' 
                 | 'プラスチック' | '紙' | 'その他';

// 清潔度
type Cleanliness = 'きれい' | '普通' | '少し注意';

// 見つけやすさ
type Visibility = 'すぐ見つかる' | '少し探す' | '目印が必要';

// 利用可能時間
type AvailableTime = '24時間利用可' | '施設の営業時間のみ' | 'その他（メモに記載）';
```

### データの永続化

- **ストレージ**: AsyncStorage
- **キー**: `@trash_bins_v1`
- **形式**: JSON 配列
- **初期データ**: ダミーデータ1件（岡山駅東口 ベンチ横）

---

## 🚀 セットアップ & 起動方法

### 前提条件

- **Node.js** v18 以上
- **npm** または **yarn**
- **Expo Go** アプリ（iOS / Android）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/OkayamaWasteContainerExpedition/Monorepo.git
cd Monorepo

# 依存関係をインストール
npm install
```

### 起動

```bash
# 開発サーバーを起動
npm run start
```

起動後、以下のいずれかで確認できます：

| 方法 | 説明 |
|------|------|
| **Expo Go** | QRコードをスキャン（iOS / Android） |
| **iOS Simulator** | `i` キーを押下 |
| **Android Emulator** | `a` キーを押下 |

### 利用可能なスクリプト

```bash
npm run start      # Expo 開発サーバーの起動
npm run ios        # iOS シミュレーターで起動
npm run android    # Android エミュレーターで起動
npm run web        # Web ブラウザで起動
npm run lint       # ESLint の実行
```

---

## 🗓️ 今後の開発計画

- [ ] バックエンドAPI連携（Firebase / Supabase）
- [ ] 「助かった！」ボタンのカウント実装
- [ ] プッシュ通知（近くのゴミ箱アラート）
- [ ] AI画像認識による自動分別カテゴリ判定


---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。

---

<p align="center">
  <strong>🌸 見つけたゴミ箱が、次の旅人の道しるべに。 🌸</strong><br>
  <em>あなたの投稿が、誰かの"助かった"になります。</em>
</p>
