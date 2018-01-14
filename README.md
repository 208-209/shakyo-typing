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
| ステージ | stage | タイピングゲームの中で出題される英数字の文字列 |
| ブックマーク | favorite | ゲームに対してユーザーがブックマーク登録すること |
| いいね！ | like | 気に入ったゲームに対するユーザーの意思表示 |
| コメント | comment | ゲームに対してユーザーがつけるコメント |
## データモデリング
### user
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| userId | 文字列 | ユーザーID |
| username | 文字列 | ユーザー名 |
| image | 文字列 | ユーザーのプロフィール画像のurl |
### game
| 属性名 | 形式 | 内容 |
| :-- | :-- | :-- |
| gameId | UUID | ゲームID |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
### stage
### favorite
### like
### comment
## URL設計
### ページの URL 一覧
| パス | メソッド | ページ内容 |
| :-- | :-- | :-- |
| / | GET | トップページ・公開ゲーム一覧 |
| /games/new | GET | ゲームの新規作成 |
| /users/:user | GET | ログインユーザーが作ったゲーム一覧 |
| /users/:user/favorites | GET | ログインユーザーの「ブックマーク」ゲーム一覧 |
| /games/tags/:tag | GET | タグのゲーム一覧 |
| /games?q=XXXX | GET | 検索のゲーム一覧 |
| /games/:games | GET | ゲームの詳細・ステージ一覧・コメントの投稿・コメント一覧 |
| /games/:user | GET | ユーザーごとの公開ゲーム一覧 |
| /games/:geme/edit | GET | ゲームの編集・ステージの作成 |
| /login | GET | ログイン |
| /logout | GET | ログアウト |
### Web API の URL 一覧
| パス | メソッド | 処理内容 | 利用方法 |
| :-- | :-- | :-- | :-- |
| /games | POST | ゲームの新規作成 | フォーム |
| /games/:games?edit=1 | POST | ゲームの編集 | フォーム |
| /games/:games?delete=1 | POST | ゲームの削除 | フォーム |
| /games/:games/stages | POST | ステージの追加 | フォーム |
| /games/:games/stages?delete=1 | POST | ステージの削除 | フォーム |
| /users/:userId/games/:games/favorites | POST | ゲームを「ブックマーク」に追加 | AJAX |
| /users/:userId/games/:games/like | POST | ゲームを「いいね！」に追加 | AJAX |
| /games/:games/comments | POST | コメントの投稿 | フォーム |
| /games/:games/comments?delete=1 | POST | コメントの削除 | フォーム |
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