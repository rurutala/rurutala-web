import { AudioWorkPlayer } from './AudioWorkPlayer'
import { WorkMediaSlider } from './WorkMediaSlider'

export function WorkMedia({ enableImageModal = false, media, title }) {
  const images = media?.images ?? []
  const embeds = media?.embeds ?? []
  const audio = media?.audio ?? []
  const videos = media?.videos ?? []
  const sliderItems = [
    ...videos.map((video) => ({
      type: 'video',
      src: video.src,
      title: video.title,
      caption: video.title,
      poster: video.poster,
      mimeType: video.type,
    })),
    ...embeds.map((embed) => ({
      type: 'embed',
      src: embed.src,
      title: embed.title,
      caption: embed.title,
    })),
    ...images.map((image, index) => ({
      type: 'image',
      src: image,
      title: `${title} ${index + 1}`,
    })),
  ]

  if (images.length === 0 && embeds.length === 0 && audio.length === 0 && videos.length === 0) {
    return null
  }

  return (
    <div className="work-media" aria-label={`${title} のメディア`}>
      {sliderItems.length > 0 && (
        <WorkMediaSlider
          enableImageModal={enableImageModal}
          items={sliderItems}
          key={title}
          title={title}
        />
      )}

      {audio.map((track) => (
        <AudioWorkPlayer key={track.src}>
          <figcaption>{track.title}</figcaption>
          <audio controls src={track.src}>
            お使いのブラウザは音声再生に対応していません。
          </audio>
        </AudioWorkPlayer>
      ))}
    </div>
  )
}
