/**
 * Carousel runtime for *generated* cards — not for the generator itself.
 *
 * Injected by `downloadPackage()` only when a card has a carousel. Like
 * main.ts and media.ts it runs standalone with no bundler, so keep it a plain
 * global script (no `import`/`export`).
 *
 * Everything here is an enhancement. Preview.vue renders the carousel as a
 * CSS scroll-snap strip, which already swipes on touch and pans on a trackpad
 * with no JavaScript at all — so if this script is missing or throws, every
 * slide is still reachable. That is the whole reason the markup is a scroller
 * rather than a stack of absolutely-positioned slides.
 *
 * The on-screen equivalent for the live preview is the carousel handling in
 * Preview.vue; the two drive the same markup.
 */

document.querySelectorAll<HTMLElement>('.carousel').forEach((carousel) => {
  const track = carousel.querySelector<HTMLElement>('.track')
  if (!track) return
  const slides = Array.from(track.querySelectorAll<HTMLElement>('.slide'))
  if (slides.length < 2) return

  const dots = Array.from(carousel.querySelectorAll<HTMLElement>('.cDot'))

  // Built here rather than in Preview.vue so a card whose script never runs
  // does not show arrows that cannot do anything.
  const arrow = (dir: 'prev' | 'next'): HTMLButtonElement => {
    const button = document.createElement('button')
    button.className = `cNav ${dir}`
    button.type = 'button'
    button.setAttribute('aria-label', dir === 'prev' ? 'Previous' : 'Next')
    // A chevron drawn in text, for the same reason the stars are text: no
    // asset to ship and it inherits the theme's colour.
    button.textContent = dir === 'prev' ? '‹' : '›'
    button.addEventListener('click', () => {
      const step = slides[0]!.getBoundingClientRect().width
      track.scrollBy({
        left: dir === 'prev' ? -step : step,
        behavior: 'smooth',
      })
    })
    return button
  }

  carousel.append(arrow('prev'), arrow('next'))

  /** The slide currently filling most of the track. */
  const currentIndex = (): number => {
    const width = slides[0]!.getBoundingClientRect().width
    if (!width) return 0
    return Math.min(slides.length - 1, Math.round(track.scrollLeft / width))
  }

  const update = (): void => {
    const index = currentIndex()
    dots.forEach((dot, i) => dot.classList.toggle('on', i === index))
    // Pause a clip the visitor has scrolled past. Without this the audio of
    // slide 2 keeps playing over slide 5 with no visible control to stop it.
    slides.forEach((slide, i) => {
      if (i === index) return
      slide.querySelectorAll('video').forEach((video) => {
        if (!video.paused) video.pause()
      })
    })
  }

  // scrollend is the right event but is not in Safari yet, so fall back to a
  // debounced scroll. Both are wired: whichever fires, update() is idempotent.
  if ('onscrollend' in window) {
    track.addEventListener('scrollend', update)
  } else {
    let timer = 0
    track.addEventListener('scroll', () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(update, 80)
    })
  }

  update()
})
