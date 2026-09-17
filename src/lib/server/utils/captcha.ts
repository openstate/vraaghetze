export async function validateCaptcha(capToken?: string) {
  if (!capToken) {
    console.info(`Validating captcha failed: capToken is empty`)
    return false
  }

  const body = {
    secret: process.env.CAPJS_SECRET_KEY,
    response: capToken
  }
  const response = await fetch(
    `https://capjs.openstate.eu/${process.env.CAPJS_SITE_KEY}/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }
  )
  .then(async res => {
    const data = await res.json()
    if (data.success) {
      return true
    } else {
      console.info(`Validating captcha failed: ${data.error}`)
      return false
    }
  })

  return response
}
