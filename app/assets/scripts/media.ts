/**
 * Media-player runtime for *generated* cards — not for the generator itself.
 *
 * Injected into the export by `downloadPackage()` only when the card has
 * featured content. Like main.ts it runs standalone with no bundler, so keep
 * it a plain global script (no `import`/`export`).
 *
 * The on-screen equivalent for the live preview is MediaPlayer.vue; the two
 * implement the same controls against the same markup.
 */

const pC = document.querySelectorAll<HTMLElement>('.pCtrl')
const pP = document.querySelectorAll<HTMLElement>('.playPause')
const srcs = document.querySelectorAll<HTMLMediaElement>('.source')

// Hand playback control entirely to the custom controls below.
srcs.forEach((source) => {
  source.style.pointerEvents = 'none'
  source.removeAttribute('controls')
})

pC.forEach((ctrl, i) => {
  ctrl.style.display = 'flex'

  const time = ctrl.querySelector<HTMLOutputElement>('.currentTime')!
  const seek = ctrl.querySelector<HTMLInputElement>('.seekBar')!
  const toggle = ctrl.querySelector<HTMLElement>('.playPause')!
  const play = toggle.querySelector<HTMLElement>('.play')!
  const pause = toggle.querySelector<HTMLElement>('.pause')!
  const source = srcs[i]!

  source.addEventListener('timeupdate', () => {
    const elapsed = source.currentTime
    const progress = (100 / source.duration) * elapsed
    seek.value = String(progress)

    if (progress === 100) {
      seek.value = '0'
      play.style.display = 'block'
      pause.style.display = 'none'
    }

    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
    const ss = String(Math.floor(elapsed % 60)).padStart(2, '0')
    time.value = `${mm}:${ss}`
  })

  seek.addEventListener('change', () => {
    source.currentTime = source.duration * (parseInt(seek.value) / 100)
  })

  toggle.addEventListener('click', () => {
    if (source.paused) {
      // Only one track plays at a time; stop the others and reset their icons.
      srcs.forEach((other, j) => {
        if (i !== j && !other.paused) other.pause()
      })
      pP.forEach((other) => {
        other.querySelector<HTMLElement>('.play')!.style.display = 'block'
        other.querySelector<HTMLElement>('.pause')!.style.display = 'none'
      })
      source.play()
      play.style.display = 'none'
      pause.style.display = 'block'
    } else {
      source.pause()
      pause.style.display = 'none'
      play.style.display = 'block'
    }
  })
})
