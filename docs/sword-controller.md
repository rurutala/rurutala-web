# /sword/: 軽量なiPhone剣コントローラー

UnityのQRコードからiPhone Safariで開く操作ページです。最初の接続情報だけをVercelで交換し、プレイ中のセンサー値はPCとiPhoneのWebRTC DataChannelで直接送ります。Cloudflare・追加DB・STUN/TURNは使いません。同じ家庭内LANが必要です。

## Vercelで使うもの

- 静的な `public/sword/`（ReactアプリやFirebaseは読み込みません）。
- `api/sword.js` と `lib/sword-signaling.mjs`（データのみのWebRTC接続情報交換）。
- Vercel標準Runtime Cache（120秒で失効、接続完了後は削除）。
- `@vercel/functions` と `qrcode`。

APIの実行リージョンは `vercel.json` で `iad1` に固定します。キャッシュはリージョンごとに分かれているため、複数へ分散させないでください。キャッシュが期限前に消えた場合も、Unityで新しいQRを作成すればやり直せます。接続完了後はキャッシュに依存しません。

環境変数や追加サービスの契約は不要です。Vercel Hobbyの無料枠を使い、上限超過時は利用制限になります。Proへの変更や有料中継へ切り替える処理はありません。既存サイトも同じ無料枠を使います。

## 配信設定

- `/sword` と `/sword/` は `public/sword/index.html`。
- `/api/sword` はSPAの `index.html` へ書き換えず、Functionへ到達させます。
- HTMLとAPIは `no-store`、`Referrer-Policy: no-referrer`。
- 操作ページは同じオリジンのAPIへだけHTTP接続します。

QRの `#room=...&token=...` にはスマホ用のトークンだけが入ります。PC用は別のトークンです。APIへはAuthorizationヘッダーで渡します。SDPやトークン、センサー値をログへ出力しません。

## 公開と利用

1. `npm ci`、`npm run build`、`npm run lint` を確認します。
2. 本番へ反映後、`/sword/` と各JavaScript、および `/api/sword` が配信されることを確認します。
3. Unityプロジェクトの接続先を `https://www.rurutala.net` に設定し、Playで新しいQRを作ります。
4. PCとiPhoneを同じLANに接続し、QRをSafariで開いてセンサーを許可します。
5. 物理的な上端をPCへ向けてキャリブレーションします。

QRは2分以内に開きます。PCの返答確認は2秒間隔、最大60回で停止します。作成・スマホの取得/返答・PCの確認・削除を合計して最大64API呼び出しです。**初期接続後のプレイ時間に比例するAPI呼び出しはありません。**

センサーの本文は52バイト/回、60Hzで約3.1KB/秒です。音声・映像は扱いません。スマホを背面へ回すなどでセンサーが停止した場合、Unityは斬撃とガードを無効にします。切断時は新しいQRで接続し直します。

## 更新と検証

生成元はUnityプロジェクトの `Tools/SwordControllerDirect/` です。そのディレクトリで `node export-site.mjs <このリポジトリの作業パス>` を実行して更新します。

接続APIの認証・期限・消失・QR・バイナリーの6テスト、既存の方向判定26テスト、Unityの実WebRTCを使うPlayModeテストで斬撃8方向・ガード8方向・プレイ中のAPI呼び出し増加なしを確認しています。

iPhone Safariの許可操作・実センサー・家庭内ネットワーク、本番VercelのRuntime Cacheを含めた接続は、公開後の実機確認が必要です。Unity 6000.6では公式WebRTC 3.0.0に非推奨表示が出ますが、Windows x64の実通信テストは成功しています。
