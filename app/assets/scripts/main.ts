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

// `showKey` is the one genuinely optional element: Preview.vue renders it
// under `v-if="pubKeyIsValid"`, so a card with no public key has no button.
const sk = document.getElementById('showKey')
// `keyView` is the panel that button reveals. It is always in the DOM, but it
// defaults to `display: flex` in the theme CSS, so every path that opens the
// modal has to hide it explicitly — hence the dN(ki) calls below. Kept
// null-checked so it stays correct if it ever gains a v-if of its own.
const ki = document.getElementById('keyView')

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
  // qrcode.min.js sits beside index.html in the export and is easy to leave
  // out of an upload. Without this guard the ReferenceError kills the rest of
  // this handler and the QR modal opens permanently blank.
  if (typeof QRCode === 'undefined') {
    qr.innerHTML = '<p>QR code unavailable — qrcode.min.js is missing.</p>'
    return
  }
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
    // A user dismissing the share sheet rejects with AbortError, which is not
    // an error worth reporting — but an unhandled rejection either way, and a
    // genuine NotAllowedError would otherwise vanish. Fall back to the copy
    // panel when the share actually failed.
    navigator
      .share({
        title: document.title,
        text: 'You can view my Digital Business Card here:',
        url: window.location.href,
      })
      .catch((err: DOMException) => {
        if (err && err.name === 'AbortError') return
        tC(m)
        cv.style.display = 'flex'
        dN(qrv)
        if (ki) dN(ki)
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
  const reset = () => {
    setTimeout(() => {
      action.innerText = 'Copy URL'
    }, 1000)
  }
  // navigator.clipboard is undefined outside a secure context — cards opened
  // over plain http:// or file:// while testing — and writeText() rejects with
  // NotAllowedError even on https when the document isn't focused. Left
  // unhandled the label never changes and the user just clicks again.
  try {
    if (!navigator.clipboard) throw new Error('no clipboard API')
    await navigator.clipboard.writeText(window.location.href)
    action.innerText = 'Copied'
  } catch {
    // Fall back to selecting the URL so it can be copied manually.
    const range = document.createRange()
    range.selectNodeContents(
      curl.querySelectorAll<HTMLElement>('.iconColor')[0]!,
    )
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    action.innerText = 'Press Ctrl+C'
  }
  reset()
})
