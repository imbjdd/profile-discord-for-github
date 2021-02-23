/**
 * The code is very short and was done in only one day.
 * If there are any bugs, please let me know.
 */

import express from 'express'
const app = express()
const port = process.env.PORT || 3000

import fs from 'fs'
import mustache from 'mustache'
import axios from 'axios'

const GET_TOKEN_URL = 'https://discord.com/api/v8/oauth2/token'
const INFO_TOKEN_URL = 'https://discord.com/api/v8/users/@me'
const REDIRECT_URI = 'http://localhost:1234/callback/'

declare var process : {
  env: {
    MONGODB_URL: string,
    PORT: number,
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    REFRESH_TOKEN: string
  }
}

import mongoose from 'mongoose'
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: String
  }
)

const RefreshToken = mongoose.model('refreshtoken', RefreshTokenSchema);

interface RefreshTokenInterface extends mongoose.Document {
  token: string
}

/**
 * Stores the refreshtoken given.
 *
 * @param token - The refreshtoken to store
 */
async function storeRefreshToken(token: string) {
  const doc: RefreshTokenInterface | any = await RefreshToken.findOne()

  if (!doc) {
    const kitty = new RefreshToken({ token })
    kitty.save()
  }
  else {
    doc.token = token
    doc.save()
  }
}

/**
 * Returns an accesstoken from a refreshtoken
 *
 * @param REFRESH_TOKEN - A refreshtoken.
 * @returns The accesstoken
 */
async function getAccessToken(REFRESH_TOKEN: string) {
  const params = new URLSearchParams()
  params.append('client_id', process.env.CLIENT_ID)
  params.append('client_secret', process.env.CLIENT_SECRET)
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', REFRESH_TOKEN)
  params.append('redirect_uri', REDIRECT_URI)
  params.append('scope', 'identify')

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  try {
    const response = await axios.post(GET_TOKEN_URL, params, config)
    storeRefreshToken(response.data.refresh_token)
    return response.data.access_token
  } catch (e) {
    return e
  }
}

/**
 * Returns a refreshtoken
 *
 * @param code - The code gets from oauth2's callback
 * @returns The accesstoken
 */
async function getRefreshToken(code: string) {
  const params = new URLSearchParams()
  params.append('client_id', process.env.CLIENT_ID)
  params.append('client_secret', process.env.CLIENT_SECRET)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', REDIRECT_URI)
  params.append('scope', 'identify')

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  try {
    const response = await axios.post(GET_TOKEN_URL, params, config)
    return response.data
  } catch (e) {
    return e
  }
}

/**
 * Returns user info from an accesstoken
 *
 * @param ACCESS_TOKEN - The accesstoken to check
 * @returns User object
 */
async function getUserInfo(ACCESS_TOKEN: string) {
  const config = {
    headers: {
      Authorization: 'Bearer ' + ACCESS_TOKEN
    }
  }

  try {
    const req = await axios.get(INFO_TOKEN_URL, config)
    return req.data
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(e.response.data)
    return e
  }
}

/**
 * Returns avatar of a given user
 *
 * @param data - The datas of the user to get avatar
 * @returns Avatar of user's data in base64
 */
async function getAvatar(data: any) {
  try {
    const response = await axios.get('https://cdn.discordapp.com/avatars/' + data.id + '/' + data.avatar + '.png', { responseType: 'arraybuffer' })
    return Buffer.from(response.data).toString('base64');
  } catch (e) {
    return e
  }
}

/**
 * Checks database and environment varaibles
 *
 * @returns refreshtoken
 */
async function getRefreshTokenLocal() {
  const doc: RefreshTokenInterface | any = await RefreshToken.findOne()

  if (!doc) return process.env.REFRESH_TOKEN
  return doc.token
}

/**
 * Returns profile's svg
 *
 * @param view - The datas of the user
 * @returns Svg of the user given
 */
function getSvg(view: object) {
  const text = fs.readFileSync('views/profile.mustache', 'utf8')
  return mustache.render(text, view)
}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.get('/api/profile', async (req, res) => {
  const REFRESH_TOKEN = await getRefreshTokenLocal()
  const ACCESS_TOKEN = await getAccessToken(REFRESH_TOKEN.trim())
  const USER_INFO = await getUserInfo(ACCESS_TOKEN)
  const AWESOME_AVATAR = await getAvatar(USER_INFO)
  const AWESOME_SVG = await getSvg({ ...USER_INFO, 'AWESOME_AVATAR': AWESOME_AVATAR })

  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Content-Length': AWESOME_SVG.length,
    'Cache-Control': 's-maxage=1'
  })

  res.end(AWESOME_SVG)
})

app.get('/api/exchange_code', async (req, res) => {
  const code: string = req.query!.code!.toString()
  const data = await getRefreshToken(code)
  res.send(data)
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log('server started at http://localhost:' + port)
})
