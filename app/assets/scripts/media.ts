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

  // Latched, because a stalled element still emits timeupdate at currentTime
  // 0, which would otherwise overwrite the message a moment after it appears.
  let failed = false
  const fail = () => {
    failed = true
    time.value = 'error'
    play.style.display = 'block'
    pause.style.display = 'none'
  }

  // The commonest hosting mistake is uploading index.html without the media/
  // folder. Detecting it takes all three of these:
  //
  // 1. Preview.vue renders the file as a child <source> element rather than a
  //    src attribute, and a failing child fires 'error' on *itself* — the
  //    media element's own error stays null and no event reaches a listener
  //    here. This is the case that actually fires in practice.
  source
    .querySelectorAll('source')
    .forEach((s) => s.addEventListener('error', fail))
  // 2. Belt and braces for a media element loaded via src.
  source.addEventListener('error', fail)
  // 3. Media loads in parallel with parsing, so resource selection can already
  //    have given up before this script runs, with both events missed.
  //    NETWORK_NO_SOURCE is the settled "nothing usable" state — and in it
  //    play() never settles, so the promise below cannot report it either.
  if (source.error || source.networkState === source.NETWORK_NO_SOURCE) fail()

  source.addEventListener('timeupdate', () => {
    if (failed) return
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
      // Only flip to the playing state once play() actually resolves. It
      // rejects when the media file is missing from the upload, the codec is
      // unsupported, or autoplay policy blocks it — showing the pause icon
      // regardless leaves a card that looks like it is playing while the seek
      // bar sits at 00:00 forever.
      source
        .play()
        .then(() => {
          play.style.display = 'none'
          pause.style.display = 'block'
        })
        .catch(fail)
    } else {
      source.pause()
      pause.style.display = 'none'
      play.style.display = 'block'
    }
  })
})
