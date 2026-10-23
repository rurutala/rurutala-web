# OGPとページ情報

- ページのタイトル・説明・画像は `src/utils/seo.js` で管理します。
- Works・Articles・Profileの共有画像は共通の `/profile.webp` です。Xではアイコン型のカード表示を使います。
- Profileの説明は、ページ本文と同じ `src/data/profile.js` の自己紹介文を使います。
- 作品詳細は `src/data/works.js` の `title`、`description`（未設定なら `subtitle`）、`coverImage` を使います。画像未設定の作品は代替の作品ギャラリー画像を使います。
- 記事詳細は `src/data/articles.js` のタイトル・概要・画像を使います。
- `npm run build` で各URL用のHTMLを生成します。SNSのクローラーはJavaScriptを実行せずにOGPを取得できます。
- Vercelのrewriteで `/works/作品ID` などを対応するHTMLへ配信します。既存の `/sword` とAPIの配信設定は維持します。以前の作品URLはまとめ先のOGP・canonicalを返します。
- 開発サーバーでもURLごとの初期HTMLに同じ情報を入れます。
- トップページと画像未設定時の代替画像は `public/ogp/` の1200×630pxのJPEGです。再生成は `node scripts/generate-ogp-images.mjs`。
- テスト: `node --test tests/seo.test.mjs`

すでに共有されたURLでは、SNS側のキャッシュによって古いカードがしばらく表示されることがあります。
