# iPhone Sword Controller

`/sword/` は Unity の QR コードから開く iPhone Safari 用の操作ページです。`/sword` でも同じページを表示します。センサーの中継には Cloudflare Workers を使用します。

## 接続先

現在の中継: `https://battle-sword-controller.dent-split.workers.dev`

操作ページの `sword-relay` メタ要素と、`vercel.json` の `/sword/:path*` に指定した `Content-Security-Policy` は、同じ中継を指定してください。QR のパラメーターから任意の接続先を指定することはできません。

この中継は一時公開として作成したものです。2026-10-17 17:03:11 JST までに所有者による無料アカウントへの取得が完了しない場合、削除されます。恒久運用前に取得を完了するか、恒久 URL へ変更してください。所有権取得用リンクはこのリポジトリには含めていません。

## 公開後の接続

1. `/sword/` と `/sword/app.mjs` が公開されたことを確認します。
2. Unity プロジェクト側の中継に `CONTROLLER_PAGE_URL=https://www.rurutala.net/sword/` を指定して公開します。
3. Unity で新しい QR を作成します。`Relay Url` は中継 URL のままです。
4. iPhone のカメラから QR を開き、Safari で「センサーを許可して開始」を押します。
5. iPhone の画面を上にして物理的な上端を PC へ向け、キャリブレーションします。

QR には `#room=...&token=...` が必要です。URL を直接開いただけではゲームに接続しません。QR のトークンを外部へ共有しないでください。

Safari の WebSocket 接続元は本番ドメインと照合します。Vercel のプレビュー URL から本番用ルームへ接続することはできません。センサーの許可は本番ドメインの HTTPS ページで確認します。

## 更新

操作ページの元ソースは Unity プロジェクトの `Tools/SwordControllerServer/public/` です。更新時は `Tools/SwordControllerCloud/export-site.mjs` に、このリポジトリの作業ディレクトリと HTTPS 中継 URL を渡して再生成します。Vercel の Functions や追加依存パッケージは使用しません。

## 検証

- `npm run build` と `npm run lint`: 成功。
- 別オリジンの操作ページから中継への接続、ルームとトークンの検証、別サイトの拒否: 自動テスト成功。
- 実際の C# 受信コードによる斬撃8方向・ガード8方向: 合成センサー値で成功。
- iPhone 実機のセンサーと Safari の許可操作、本番ドメインでの接続: 公開後に確認が必要。
