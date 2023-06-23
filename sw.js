const NAME = 'v1'

this.addEventListener('install', event => {
  console.log(`Installing SW ${NAME}`)
})

this.addEventListener('activate', event => {
  console.log(`Activating SW ${NAME}`)
  event.waitUntil(initializeCache())
})

this.addEventListener('fetch', event => {
  event.respondWith(handleFetch(event.request))
})

//------------------------------------------------------------------------------

async function initializeCache() {
  await deleteOtherCaches()
}

async function deleteOtherCaches() {
  await Promise.all(
    (await caches.keys()).map(
      cacheName => cacheName !== NAME && caches.delete(cacheName)
    )
  )
}

async function handleFetch(req) {
  let res
  try {
    res = await fetch(req)
    if (req.method === 'GET' && /^https?:\/\//.test(req.url)) {
      ;(await caches.open(NAME)).put(req, res.clone())
    }
  } catch (err) {
    const url = new URL(req.url)
    res = await caches.match(req)
    if (res === undefined) {
      throw err
    }
  }

  return res
}
