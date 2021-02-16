# Profile Discord for GitHub

![Spotify](https://profile-discord-for-github.herokuapp.com/api/profile)

## Setup
`https://discord.com/api/oauth2/authorize?response_type=code&client_id={{CLIENT_ID}}&scope=identify&redirect_uri=http://localhost:1234/callback/&prompt=none`

`http://localhost:1234/callback/?code=yjV0ACm2MweJzxMwY5VA2qCcNrnFVT`

`http://localhost:1234/callback/?code={{code}}`

`/api/exchange_code?code={{code}}`

Create a file named `REFRESH_TOKEN` in the root of application and put the refresh_token variable in.
