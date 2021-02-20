<div align="center">
  <h1>Profile Discord for GitHub <img src="https://img.shields.io/github/stars/6346563751/profile-discord-for-github?style=social" alt="Star the repo"/></h1>
  <p>This is a simplest way to link in realtime your Discord profile to any readme. The data (avatar and photo) are taken in real time.</p>
</div>

<div align="center">
    <img src="https://profile-discord-for-github.herokuapp.com/api/profile?up" alt="Here's an example"/><br>
</div>

## Setup (~10-15 minutes)

1. First, you need to create an appplication [here](https://discord.com/developers/applications).
2. Then, in the Oauth2 tab, add `http://localhost:1234/callback/` at redirect_url.
3. After that, note CLIENT_ID and CLIENT_SECRET somewhere (we will need it later).
4. Fork the repo and deploy the web application on heroku and change the environments variables `CLIENT_ID` and `CLIENT_SECRET` with your values.
5. Create a MongoDb Atlas account ([here](https://www.mongodb.com/cloud/atlas/register)), create a cluster and get the link to connect. Add an environment variable called `MONGODB_URL` and put the link in.
6. Go on this link : `https://discord.com/api/oauth2/authorize?response_type=code&client_id={{CLIENT_ID}}&scope=identify&redirect_uri=http://localhost:1234/callback/&prompt=none` by replacing {{CLIENT_ID}} with your CLIENT_ID.
7. You will be redirected on a link like that `http://localhost:1234/callback/?code=yjV0ACm2MweJzxMwY5VA2qCcNrnFVT`, copy the last part `http://localhost:1234/callback/?code={{code}}`, the element `code` and go on `https://yourapp.herokuapp.com/api/exchange_code?code={{code}}`.
8. Now, store the `refresh_token` variable, create and env variable called `REFRESH_TOKEN` and put in.
9. The setup is finished, congratulations ! 🎉🎉 Your image link is `https://yourapp.herokuapp.com/api/profile`.

![Felicitation gif](https://media.giphy.com/media/14cDsqOkks6O8U/giphy.gif)

## License
[Unlicense](https://choosealicense.com/licenses/unlicense/)
