# code-typing
プログラミングコードの写経を目的としたタイピングゲーム。Google、Twitter、GitHubの外部認証でログインすることにより、タイピングゲームの作成と公開、「ブックマーク」や「いいね！」ができる。ゲームを非公開に設定することも可能。公開設定されたゲームのプレイはログイン不要。
## 要件定義
- Gameをプレイできる
- Gameが作れる
- GameにStageが作れる
- Gameを「ブックマーク」登録できる
- Gameに対して「いいね！」ができる
- Gameに対してコメントを投稿できる
- Gameを検索するとことができる
- Gameを編集できる
- Gameを削除できる
- Stageを削除できる
- コメントを削除できる
## 用語定義
| 用語 | 英語表記 | 意味 |
| :-- | :-- | :-- |
| ユーザー | user | code-typingの利用者 |
| ゲーム | game | ユーザーがプレイできるタイピングゲーム |
| ステージ | stage | タイピングゲームで出題される問題 |
| ブックマーク | favorite | ゲームに対してユーザーがブックマーク登録すること |
| いいね！ | like | 気に入ったゲームに対するユーザーの意思表示 |
| コメント | comment | ゲームに対してユーザーがつけるコメント |
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
| privacy | 文字列 | 非公開:'secret', 公開:'public' |
| createdBy | 文字列 | ユーザーID (FK) |
| createdAt | 日付 | 作成日時 |
| updatedAt | 日付 | 更新日時 |
- user 1 ___ 0...* comment
- game 1 ___ 0...* favorite
- game 1 ___ 0...* like
- game 1 ___ 0...* comment
### stage
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| stageId | 数値 | ステージID (PK) |
| stageTitle | 文字列 | ゲームの問題のタイトル |
| stageContent | 文字列 | ゲームの問題 |
| createdAt | 文字列 | ユーザーID |
| gameId | UUID | ゲームID (FK) |
### favorite
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| userId | 文字列 | ユーザーID (PK) |
| gameId | UUID | ゲームID (PK) (FK) |
| favorite | 数値 | off: 0, on: 1 |
### like
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| gameId | UUID | ゲームID (PK) |
| userId | 文字列 | ユーザーID (PK) |
| likeState | 数値 | off: 0, on: 1 |
### comment
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| commentId | 数値 | 投稿ID (PK) |
| comment | 文字列 | TEXT |
| gameId | UUID | ゲームID (FK) |
| postedBy | 文字列 | ユーザーID (FK) |
| createdAt | 日付 | 作成日時 |
| updatedAt | 日付 | 更新日時 |
## URL設計
### ページの URL 一覧
| パス | メソッド | ページ内容 |
| :-- | :-- | :-- |
| / | GET | トップページ・公開ゲーム一覧 |
| /games/new | GET | ゲームの新規作成 |
| /users/:userId | GET | ログインユーザーが作ったゲーム一覧 |
| /users/:userId/favorites | GET | ログインユーザーの「ブックマーク」ゲーム一覧 |
| /games/tags/:tag | GET | タグのゲーム一覧 |
| /games?q=XXXX | GET | 検索のゲーム一覧 |
| /games/:gameId | GET | ゲームの詳細・ステージ一覧・コメントの投稿・コメント一覧 |
| /games/:userId | GET | そのユーザーの公開ゲーム一覧 |
| /games/:gemeId/edit | GET | ゲームの編集・ステージの作成 |
| /login | GET | ログイン |
| /logout | GET | ログアウト |
### Web API の URL 一覧
| パス | メソッド | 処理内容 | 利用方法 |
| :-- | :-- | :-- | :-- |
| /games | POST | ゲームの新規作成 | フォーム |
| /games/:gameId?edit=1 | POST | ゲームの編集 | フォーム |
| /games/:gameId?delete=1 | POST | ゲームの削除 | フォーム |
| /games/:gameId/stages | POST | ステージの追加 | フォーム |
| /games/:gameId/stages?delete=1 | POST | ステージの削除 | フォーム |
| /users/:userId/games/:gameId/favorites | POST | ゲームを「ブックマーク」に追加 | AJAX |
| /users/:userId/games/:gameId/like | POST | ゲームを「いいね！」に追加 | AJAX |
| /games/:gameId/comments | POST | コメントの投稿 | フォーム |
| /games/:gameId/comments?delete=1 | POST | コメントの削除 | フォーム |
## モジュール設計
| ファイル名 | 責務 |
| :-- | :-- |
| routes/index.js | トップページに関する処理 |
| routes/gemes.js | ゲームに関する処理 |
| routes/stages.js | ステージに関する処理 |
| routes/users.js | ユーザーに関する処理 |
| routes/favorites.js | 「ブックマーク」に関する処理 |
| routes/likes.js | 「いいね！」に関する処理 |
| routes/tags.js | タグに関する処理 |
| routes/search.js | 検索に関する処理 |
| routes/comments.js | コメントに関する処理 |
| routes/login.js | ログイン処理 |
| routes/logout.js | ログアウト処理 |