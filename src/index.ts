import express from 'express'
const app = express()
const port = 8080

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs'
import mustache from 'mustache'
import axios from 'axios'

const GET_TOKEN_URL = 'https://discord.com/api/v8/oauth2/token'
const INFO_TOKEN_URL = 'https://discord.com/api/v8/users/@me'
const REDIRECT_URI = 'http://localhost:1234/callback/'

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
    fs.writeFileSync("REFRESH_TOKEN", response.data.refresh_token)
    return response.data.access_token
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.log(e.response.data)
    return e
  }
}

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

async function getUserInfo(ACCESS_TOKEN: string) {
  const config = {
    headers : {
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

function getRefreshTokenLocal() {
  return fs.readFileSync('REFRESH_TOKEN','utf8')
}

function getSvg(view: object) {
  const text = fs.readFileSync('views/profile.mustache','utf8')
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
  const AWESOME_SVG = await getSvg(USER_INFO)

  res.writeHead(200, {
   'Content-Type': 'image/svg+xml',
   'Content-Length': AWESOME_SVG.length
  })

  res.end(AWESOME_SVG)
})

app.get('/api/exchange_code', async (req, res) => {
  const code: string = req.query.code.toString()
  const data = await getRefreshToken(code)
  res.send(data)
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log('server started at http://localhost:'+port)
})
