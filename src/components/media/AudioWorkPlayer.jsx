import { useEffect, useRef, useState } from 'react'

const audioGraphByElement = new WeakMap()

export function AudioWorkPlayer({ children }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(0)
  const frequencyDataRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const audio = container?.querySelector('audio')

    if (!container || !canvas || !audio) {
      return undefined
    }

    const canvasContext = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const ensureAudioGraph = () => {
      if (audioContextRef.current) {
        return audioContextRef.current
      }

      const existingGraph = audioGraphByElement.get(audio)

      if (existingGraph) {
        audioContextRef.current = existingGraph.audioContext
        analyserRef.current = existingGraph.analyser
        frequencyDataRef.current = existingGraph.frequencyData

        return existingGraph.audioContext
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext

      if (!AudioContext) {
        return null
      }

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.82

      const source = audioContext.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const frequencyData = new Uint8Array(analyser.frequencyBinCount)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      frequencyDataRef.current = frequencyData
      audioGraphByElement.set(audio, { analyser, audioContext, frequencyData, source })

      return audioContext
    }

    const drawSpectrum = () => {
      const analyser = analyserRef.current
      const frequencyData = frequencyDataRef.current

      canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight)

      if (!analyser || !frequencyData || audio.paused || audio.ended) {
        return
      }

      analyser.getByteFrequencyData(frequencyData)

      const gridSize = 42
      const columns = Math.ceil(window.innerWidth / gridSize) + 1
      const centerY = window.innerHeight / 2

      canvasContext.save()
      canvasContext.globalCompositeOperation = 'screen'
      canvasContext.lineCap = 'round'

      const isDarkTheme = document.documentElement.dataset.theme === 'dark'
      const spectrumRgb = isDarkTheme
        ? '255, 255, 255'
        : getComputedStyle(document.documentElement).getPropertyValue('--theme-rgb').trim() ||
          '30, 47, 74'
      const spectrumAlphaBase = isDarkTheme ? 0.014 : 0.018
      const spectrumAlphaRange = isDarkTheme ? 0.09 : 0.11

      for (let column = 0; column < columns; column += 1) {
        const dataIndex = Math.floor((column / columns) * frequencyData.length)
        const strength = frequencyData[dataIndex] / 255
        const neighbor = frequencyData[Math.min(dataIndex + 3, frequencyData.length - 1)] / 255
        const height = Math.max(8, (strength * 0.74 + neighbor * 0.26) * window.innerHeight * 0.34)
        const x = column * gridSize

        canvasContext.strokeStyle = `rgba(${spectrumRgb}, ${spectrumAlphaBase + strength * spectrumAlphaRange})`
        canvasContext.lineWidth = 1 + strength * 1.4
        canvasContext.beginPath()
        canvasContext.moveTo(x, centerY - height)
        canvasContext.lineTo(x, centerY + height)
        canvasContext.stroke()
      }

      canvasContext.restore()
      animationFrameRef.current = window.requestAnimationFrame(drawSpectrum)
    }

    const startVisualizer = async () => {
      setIsPlaying(true)

      if (reducedMotion) {
        return
      }

      resizeCanvas()
      const audioContext = ensureAudioGraph()

      if (audioContext?.state === 'suspended') {
        await audioContext.resume()
      }

      window.cancelAnimationFrame(animationFrameRef.current)
      drawSpectrum()
    }

    const stopVisualizer = () => {
      setIsPlaying(false)
      window.cancelAnimationFrame(animationFrameRef.current)
      canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }

    audio.addEventListener('play', startVisualizer)
    audio.addEventListener('pause', stopVisualizer)
    audio.addEventListener('ended', stopVisualizer)
    window.addEventListener('resize', resizeCanvas)

    return () => {
      audio.removeEventListener('play', startVisualizer)
      audio.removeEventListener('pause', stopVisualizer)
      audio.removeEventListener('ended', stopVisualizer)
      window.removeEventListener('resize', resizeCanvas)
      window.cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-audio-reactive', isPlaying)

    return () => {
      document.documentElement.classList.remove('is-audio-reactive')
    }
  }, [isPlaying])

  return (
    <figure className={`work-media__audio ${isPlaying ? 'is-playing' : ''}`} ref={containerRef}>
      <canvas className="audio-spectrum-backdrop" ref={canvasRef} aria-hidden="true" />
      {children}
    </figure>
  )
}
