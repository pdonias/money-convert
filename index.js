if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('Registering SW')
    navigator.serviceWorker.register('/sw.js').then(({ scope }) => {
      console.log('SW registered')
    })
  })
}

window.addEventListener('load', event => {
  const mxn = document.querySelector('#mxn input')
  const eur = document.querySelector('#eur input')
  const rateEl = document.getElementById('rate')

  const lastUpdateCookie = getCookie('lastUpdate')
  const rateCookie = getCookie('rate')

  const lastUpdate =
    lastUpdateCookie === null ? undefined : new Date(lastUpdateCookie)
  let rate = rateCookie === null ? 20 : +rateCookie
  rateEl.textContent =
    rateCookie === null
      ? 'unknown'
      : `rate: ${rate}; last updated: ${
          lastUpdate ? lastUpdate.toLocaleString() : 'unknown'
        }`

  eur.value = '1.00'
  mxn.value = rate.toFixed(2)

  mxn.addEventListener('input', event => {
    const n = parse(mxn.value)
    if (n !== null) {
      eur.value = render(n / rate)
    }
  })

  eur.addEventListener('input', event => {
    const n = parse(eur.value)
    if (n !== null) {
      mxn.value = render(n * rate)
    }
  })

  mxn.addEventListener('blur', event => {
    const n = parse(mxn.value)
    if (n !== null) {
      mxn.value = render(n)
    }
  })

  eur.addEventListener('blur', event => {
    const n = parse(eur.value)
    if (n !== null) {
      eur.value = render(n)
    }
  })

  const now = new Date()
  if (
    rateCookie === null ||
    lastUpdateCookie === null ||
    now - lastUpdate > 24 * 60 * 60 * 1000
  ) {
    fetch(
      'https://api.currencyapi.com/v3/latest?apikey=0MvbKExuxtV6TVQurjT8Z1JY092Q2hNkifPcDatl&currencies=MXN&base_currency=EUR'
    )
      .then(res => {
        if (!res.ok) {
          throw new Error('Cannot fetch rate ' + res.status)
        }
        return res.json()
      })
      .then(json => {
        rate = json.data.MXN.value
        rateEl.textContent = `rate: ${rate}; last updated: ${now.toLocaleString()}`
        setCookie('rate', rate)
        setCookie('lastUpdate', now.toISOString())
        eur.value = render(1)
        mxn.value = render(rate)
      })
      .catch(err => {
        console.error(err)
        rateEl.textContent = 'error: ' + err.message
      })
  }
})

function parse(s) {
  s = s.replace(/[ ,]/g, '')

  if (s === '') {
    return null
  }

  return Number.isNaN(+s) ? null : +s
}

function render(n) {
  const opts = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }

  return n.toLocaleString('en-US', opts)
}

function getCookie(name) {
  const nameEq = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length)
    }
    if (c.indexOf(nameEq) == 0) {
      return c.substring(nameEq.length, c.length)
    }
  }
  return null
}

function setCookie(name, value, days = 365) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = '; expires=' + date.toUTCString()
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0`
}
