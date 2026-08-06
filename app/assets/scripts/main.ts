/**
 * Runtime script for *generated* cards — not for the generator itself.
 *
 * `downloadPackage()` in app/pages/index.vue imports this file with the
 * `?minified` query (see nuxt.config.ts) and injects the compiled result into
 * the exported document as an inline <script>. It therefore runs standalone on
 * the user's own hosting, with no bundler, no imports and no polyfills.
 *
 * Keep it a plain global script: an `import` or `export` here would make
 * esbuild emit an ES module, which a classic <script> tag cannot run.
 */

/** Provided by qrcode.min.js, which is copied into the export beside this. */
declare class QRCode {
  constructor(options: {
    content: string
    container: string
    join: boolean
    ecl: string
    padding: number
  })
  svg(): string
}

// Always rendered by Preview.vue, so these are non-null by construction.
const m = document.getElementById('modal')!
const c = document.getElementById('close')!
const cv = document.getElementById('copyView')!
const curl = document.getElementById('copyURL')!
const qrv = document.getElementById('qrView')!
const qr = document.getElementById('qr')!
const s = document.getElementById('share')!
const sqr = document.getElementById('showQR')!

// Rendered only when the card carries a public key, so genuinely optional.
const ki = document.getElementById('keyView')
const sk = document.getElementById('showKey')

/** Toggle the modal in or out of view. */
function tC(e: HTMLElement) {
  if (e.style.top === '2rem') {
    e.style.visibility = 'visible'
    e.style.top = '0px'
    e.style.opacity = '1'
  } else {
    e.style.top = '2rem'
    e.style.opacity = '0'
    setTimeout(() => {
      e.style.visibility = 'hidden'
    }, 200)
  }
}

function dN(value: HTMLElement) {
  value.style.display = 'none'
}

window.addEventListener('load', () => {
  document.getElementById('topActions')!.style.display = 'flex'
  qr.innerHTML = new QRCode({
    content: window.location.href,
    container: 'svg-viewbox',
    join: true,
    ecl: 'L',
    padding: 0,
  }).svg()
})

// Feature detection, so it has to be an `in` check: lib.dom declares canShare
// as always present, and a plain truthiness test on it is always true there.
if ('canShare' in navigator) {
  s.addEventListener('click', () => {
    navigator.share({
      title: document.title,
      text: 'You can view my Digital Business Card here:',
      url: window.location.href,
    })
  })
} else {
  s.addEventListener('click', () => {
    tC(m)
    cv.style.display = 'flex'
    dN(qrv)
    if (ki) dN(ki)
  })
}

sqr.addEventListener('click', () => {
  tC(m)
  qrv.style.display = 'block'
  dN(cv)
  if (ki) dN(ki)
})

if (sk) {
  sk.addEventListener('click', () => {
    tC(m)
    if (ki) ki.style.display = 'flex'
    dN(cv)
    dN(qrv)
  })
}

c.addEventListener('click', () => tC(m))

curl.addEventListener('click', async () => {
  const action = curl.querySelectorAll<HTMLElement>('.iconColor')[1]!
  await navigator.clipboard.writeText(window.location.href)
  action.innerText = 'Copied'
  setTimeout(() => {
    action.innerText = 'Copy URL'
  }, 1000)
})
