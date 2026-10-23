import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import sharp from 'sharp'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, 'public/ogp')
await mkdir(output, { recursive: true })

const sources = {
  profile: 'profile.webp',
  game: 'assets/PG/PG_COLORCONNECT/colorconnect1.webp',
  illustration: 'assets/ILLUST/ILLUST_THEHOLE/thehole.webp',
  live2d: 'assets/LIVE2D/minamoruav3.webp',
  essay: 'icon/essay.webp',
  info: 'icon/info.webp',
}

async function photo(key, left, top, width, height, fit = 'cover') {
  return {
    input: await sharp(resolve(root, 'public', sources[key]))
      .resize(width, height, { fit, position: 'north', background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .png()
      .toBuffer(),
    left,
    top,
  }
}

function header(title, subtitle) {
  return {
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="190">
      <rect width="1200" height="190" fill="#ffffff"/>
      <rect x="52" y="45" width="6" height="100" fill="#1fb7d4"/>
      <text x="82" y="100" fill="#1e2f4a" font-family="sans-serif" font-weight="700" font-size="58">${title}</text>
      <text x="84" y="146" fill="#526579" font-family="sans-serif" font-size="25">${subtitle}</text>
      <text x="1148" y="146" text-anchor="end" fill="#1e2f4a" font-family="sans-serif" font-size="23">rurutala.net</text>
    </svg>`),
    left: 0,
    top: 0,
  }
}

async function save(name, overlays) {
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
    .composite(overlays)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(resolve(output, `${name}.jpg`))
}

await save('home', [
  await photo('profile', 0, 190, 340, 440),
  await photo('illustration', 348, 190, 422, 440),
  await photo('live2d', 778, 190, 422, 440),
  header('rurutala / Portfolio', 'GAME  /  ILLUSTRATION  /  MUSIC  /  MOVIE'),
])
await save('works', [
  await photo('game', 0, 190, 600, 440, 'contain'),
  await photo('illustration', 608, 190, 292, 440),
  await photo('live2d', 908, 190, 292, 440),
  header('Works', 'GAMES, ART &amp; MORE'),
])
await save('articles', [
  await photo('essay', 70, 190, 500, 440, 'contain'),
  await photo('info', 630, 190, 500, 440, 'contain'),
  header('Articles', 'NOTES  /  IDEAS  /  NEWS'),
])
await save('profile', [
  await photo('profile', 350, 170, 500, 460, 'contain'),
  header('Profile / rurutala', 'GAME DEVELOPER &amp; CREATOR'),
])
console.log('Generated 4 OGP images (1200 x 630).')
