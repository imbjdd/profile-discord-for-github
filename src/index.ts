import express from 'express'
const app = express()
const port = 8080

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs'
import mustache from 'mustache'
import axios from 'axios'

const REFRESH_TOKEN_URL = 'https://discord.com/api/v8/oauth2/token'
const INFO_TOKEN_URL = 'https://discord.com/api/v8/users/@me'
const REDIRECT_URI = 'http://localhost:8080/callback/'

async function getRefreshToken() {
  const params = new URLSearchParams()
  params.append('client_id', process.env.CLIENT_ID)
  params.append('client_secret', process.env.CLIENT_SECRET)
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', process.env.REFRESH_TOKEN)
  params.append('redirect_uri', REDIRECT_URI)
  params.append('scope', 'identify')

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  try {
    const response = await axios.post(REFRESH_TOKEN_URL, params, config)
    return response.data.access_token
  } catch (e) {
    return e
  }
}

async function getUserInfo(ACCESS_TOKEN: string) {
  const url = INFO_TOKEN_URL + '/users/@me'

  const config = {
    headers : {
      Authorization: "Bearer " + ACCESS_TOKEN
    }
  }

  try {
    const req = await axios.get(url, config)
    return req.data
  } catch (e) {
    return e
  }
}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send("Hello world!")
})

app.get('/api/profile', (req, res) => {
  const view = {
    username: 'Joe',
    tag: '1932',
    id: '796889023880495105',
    avatar: '230a6cf9e2d75857050f815731054cf2'
  };

  const text = fs.readFileSync('views/profile.mustache','utf8')
  const output = mustache.render(text, view)

  res.writeHead(200, {
   'Content-Type': 'image/svg+xml',
   'Content-Length': output.length
  })

  res.end(output)
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log('server started at http://localhost:'+port)
})
