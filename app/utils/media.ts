/**
 * Building `MediaContent` entries from attached files.
 *
 * Extracted from Featured.vue so the carousel does not need a second copy of
 * the frame-capture dance — the repo already carries one duplicated media
 * implementation (MediaPlayer.vue vs media.ts) and it needs watching; a third
 * would not. It also lands this in a .ts file, where TypeScript can check it.
 *
 * Every function here rejects with an Error on failure rather than resolving
 * to something empty. The attach paths used to swallow these, which is how two
 * dependency breakages produced an attachment that silently never appeared.
 */

import type { MediaContent, MediaKind } from '~/types/card'

/** The file's name without its extension, used as the default title. */
export function fileTitle(file: File): string {
  return file.name.replace(/(?:\.([^.]+))?$/, '')
}

/**
 * Reads an image into a `MediaContent`, with `dataURI` for the live preview.
 *
 * The extension comes off the data URI's own mime rather than the filename, so
 * a .jpg that is really a PNG is exported under the extension it actually is.
 */
export function readImageEntry(
  file: File,
  mime: string,
): Promise<MediaContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (f) => {
      const dataURI = f.target!.result as string
      const ext = dataURI
        .split(',')[0]!
        .split(':')[1]!
        .split('/')[1]!
        .match(/^\w+/g)![0]!
      resolve({
        name: file.name,
        title: fileTitle(file),
        dataURI,
        file,
        type: 'image' satisfies MediaKind,
        contentType: 'media',
        ext,
        mime,
      })
    }
    reader.onerror = () =>
      reject(
        new Error(`Could not read ${file.name}. The file may be unreadable.`),
      )
    reader.readAsDataURL(file)
  })
}

/**
 * Reads a video and grabs a poster frame from just after its start.
 *
 * `#t=0.2` rather than 0: seeking to exactly zero returns a frame that is
 * routinely still black, and a card full of black thumbnails looks broken.
 *
 * Firefox and Android never fire 'seeked' for a media fragment on an object
 * URL, so those two capture on 'loadstart' instead — earlier, and occasionally
 * a blank frame, but a thumbnail that arrives beats one that never does.
 */
export function captureVideoEntry(file: File): Promise<MediaContent> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const video = document.createElement('video')
    const reader = new FileReader()
    const maxWidth = 80
    const maxHeight = 80
    let dataURI: string
    // The capture handler can fire more than once (loadstart especially).
    let settled = false

    const capture = () => {
      if (settled) return
      settled = true
      let width = video.videoWidth
      let height = video.videoHeight
      if (width > maxWidth) {
        height *= maxWidth / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width *= maxHeight / height
        height = maxHeight
      }
      canvas.width = width
      canvas.height = height
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      resolve({
        name: file.name,
        coverDataURI: canvas.toDataURL('image/jpeg', 0.8),
        coverExt: 'jpeg',
        dataURI,
        file,
        title: fileTitle(file),
        type: 'video' satisfies MediaKind,
        contentType: 'media',
        // Kept as mp4 for webm too, matching the behaviour this replaced.
        ext: 'mp4',
      })
    }

    const uA = navigator.userAgent.match(/firefox|android/gi)
    if (uA && uA.length === 2) video.addEventListener('loadstart', capture)
    else video.addEventListener('seeked', capture)

    // A container the browser accepts by MIME but cannot decode (H.265 in
    // Chrome, say) fires 'error' and never 'seeked', so without this the
    // attachment simply never appears and nothing is reported.
    video.addEventListener('error', () => {
      if (settled) return
      settled = true
      reject(
        new Error(
          'Could not read that video.\n\nThe file may use a codec your browser cannot decode.',
        ),
      )
    })

    reader.onload = (f) => {
      const videoFile = new Blob([f.target!.result as ArrayBuffer], {
        type: 'video/mp4',
      })
      dataURI = URL.createObjectURL(videoFile)
      video.src = `${dataURI}#t=0.2`
    }
    reader.onerror = () =>
      reject(
        new Error(`Could not read ${file.name}. The file may be unreadable.`),
      )
    reader.readAsArrayBuffer(file)
  })
}
