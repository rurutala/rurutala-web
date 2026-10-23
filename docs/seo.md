# OGPとページ情報

- ページのタイトル・説明・画像は `src/utils/seo.js` で管理します。
- 作品詳細は `src/data/works.js` の `title`、`description`（未設定なら `subtitle`）、`coverImage` を使います。画像未設定の作品は作品一覧用の共有画像を使います。
- 記事詳細は `src/data/articles.js` のタイトル・概要・画像を使います。
- `npm run build` で各URL用のHTMLを生成します。SNSのクローラーはJavaScriptを実行せずにOGPを取得できます。
- Vercelの `cleanUrls` で `/works/作品ID` を対応するHTMLへ配信します。以前の作品URLはまとめ先のOGP・canonicalを返します。
- 開発サーバーでもURLごとの初期HTMLに同じ情報を入れます。
- 一覧などの共有画像は `public/ogp/` の1200×630pxのJPEGです。再生成は `node scripts/generate-ogp-images.mjs`。
- テスト: `node --test tests/seo.test.mjs`

すでに共有されたURLでは、SNS側のキャッシュによって古いカードがしばらく表示されることがあります。
