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
    const newValue = +mxn.value
    if (!Number.isNaN(newValue)) {
      eur.value = (newValue / rate).toFixed(2)
    }
  })

  eur.addEventListener('input', event => {
    const newValue = +eur.value
    if (!Number.isNaN(newValue)) {
      mxn.value = (newValue * rate).toFixed(2)
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
        eur.value = '1.00'
        mxn.value = rate.toFixed(2)
      })
      .catch(err => {
        console.error(err)
        rateEl.textContent = 'error: ' + err.message
      })
  }
})

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
