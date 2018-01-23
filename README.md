# 写経タイピング
- タイピングゲームの作成ができるアプリケーション
- Google・Twitter・GitHubの外部認証を利用してログイン
- 非公開に設定して自分だけで利用するとこも可能
- 公開設定されたゲームのプレイはログイン不要
- ログインをすることで、コメントやブックマークなどの利用ができるようになる
- ディスプレイサイズは 992px 以上
- Windows10の最新版のChromeのみテスト
## 使い方
### ゲームのプレイ
1. トップページ等のパネルの「PLAY GAME」をクリックする
2. スペースキーでゲームスタート
### ゲームの作成
1. ナビゲーション・バーの「NEW GAME」をクリック
2. New ページで、ゲームタイトルとタグとプライバシー設定を入力
3. Edit ページで、タイピングする文章とそのタイトルを入力(複数登録が可能)
4. タイピングでの判定は半角英数字記号のみで、他の文字はスペースキーでスキップできる
## 要件定義
- Gameをプレイできる
- Gameを作成できる
- GameにStageを作成できる
- Gameに対してコメントの投稿できる
- Gameに対して「ブックマーク」ができる
- Gameに対して「いいね！」ができる
- Gameを文字で検索するとことができる
- Gameをタグで検索するとことができる
- Gameを編集できる
- Gameを削除できる
- Stageを削除できる
- コメントを削除できる
## 用語定義
| 用語 | 英語表記 | 意味 |
| :-- | :-- | :-- |
| ユーザー | user | 写経タイピングの利用者 |
| ゲーム | game | ユーザーがプレイできるタイピングゲーム |
| ステージ | stage | タイピングゲームで出題される文章 |
| コメント | comment | ゲームに対してユーザーがつけるコメント |
| ブックマーク | favorite | ゲームに対してユーザーがブックマーク登録すること |
| いいね！ | like | 気に入ったゲームに対するユーザーの意思表示 |
## データモデリング
### user
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| userId | 文字列 | ユーザーID (PK) |
| username | 文字列 | ユーザー名 |
| image | 文字列 | ユーザーのプロフィール画像のURL |
- user 1 ___ 0...* game
- user 1 ___ 0...* stage
- user 1 ___ 0...* like
- user 1 ___ 0...* comment
### game
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| gameId | UUID | ゲームID (PK) |
| gameName | 文字列 | ゲーム名 |
| tags | 文字列 | タグ名を\nでつなげた文字列 |
| privacy | 数値 | 非公開: 0, 公開: 1 |
| createdBy | 文字列 | ユーザーID (FK) |
| createdAt | 日付 | 作成日時 |
| updatedAt | 日付 | 更新日時 |
- game 1 ___ 1...* stage
- game 1 ___ 0...* favorite
- game 1 ___ 0...* like
- game 1 ___ 0...* comment
### stage
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| stageId | 数値 | ステージID (PK) |
| stageTitle | 文字列 | ゲームで出題される文字列のタイトル |
| stageContent | 文字列 | ゲームで出題される文字列 |
| createdAt | 文字列 | ユーザーID |
| gameId | UUID | ゲームID (FK) |
| createdAt | 日付 | 作成日時 |
| updatedAt | 日付 | 更新日時 |
### comment
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| commentId | 数値 | 投稿ID (PK) |
| comment | 文字列 | TEXT |
| createdBy | 文字列 | ユーザーID (FK) |
| gameId | UUID | ゲームID (FK) |
| createdAt | 日付 | 作成日時 |
| updatedAt | 日付 | 更新日時 |
### favorite
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| userId | 文字列 | ユーザーID (PK) |
| gameId | UUID | ゲームID (PK) (FK) |
| favorite | 数値 | off: 0, on: 1 |
### like
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| userId | 文字列 | ユーザーID (PK) |
| gameId | UUID | ゲームID (PK) |
| likeState | 数値 | off: 0, on: 1 |
## URL設計
### ページの URL 一覧
| パス | メソッド | ページ内容 |
| :-- | :-- | :-- |
| / | GET | トップページ・公開ゲーム一覧 |
| /games/new | GET | ゲームの新規作成 |
| /games/:gameId | GET | ゲームの詳細・ステージ一覧・コメントの投稿・コメント一覧 |
| /games/:gemeId/edit | GET | ゲームの編集・ステージの作成 |
| /games/tags/:tag | GET | タグのゲーム一覧 |
| /games?q=XXXX | GET | 検索のゲーム一覧 |
| /games/users/:userId | GET | ユーザーの公開ゲーム一覧 |
| /users/:userId | GET | ログインユーザーのゲーム一覧 |
| /users/:userId/favorites | GET | ログインユーザーの「ブックマーク」ゲーム一覧 |
| /login | GET | ログイン |
| /logout | GET | ログアウト |
### Web API の URL 一覧
| パス | メソッド | 処理内容 | 利用方法 |
| :-- | :-- | :-- | :-- |
| /games | POST | ゲームの新規作成 | フォーム |
| /games/:gameId?edit=1 | POST | ゲームの編集 | フォーム |
| /games/:gameId?delete=1 | POST | ゲームの削除 | フォーム |
| /games/:gameId/stages | POST | ステージの追加 | フォーム |
| /games/:gameId/stages/delete | POST | ステージの削除 | フォーム |
| /games/:gameId/comments | POST | コメントの投稿 | フォーム |
| /games/:gameId/comments/delete | POST | コメントの削除 | フォーム |
| /users/:userId/games/:gameId/favorites | POST | ゲームを「ブックマーク」に追加 | AJAX |
| /users/:userId/games/:gameId/like | POST | ゲームを「いいね！」に追加 | AJAX |
## モジュール設計
| ファイル名 | 責務 |
| :-- | :-- |
| routes/index.js | トップページに関する処理 |
| routes/gemes.js | ゲームに関する処理 |
| routes/stages.js | ステージに関する処理 |
| routes/comments.js | コメントに関する処理 |
| routes/users.js | ログインユーザーに関する処理 |
| routes/others.js | 利用ユーザーに関する処理 |
| routes/favorites.js | 「ブックマーク」に関する処理 |
| routes/likes.js | 「いいね！」に関する処理 |
| routes/tags.js | タグに関する処理 |
| routes/search.js | 検索に関する処理 |
| routes/login.js | ログイン処理 |
| routes/logout.js | ログアウト処理 |