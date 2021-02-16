import express from 'express'
import fs from 'fs'
import mustache from 'mustache'
const app = express()
const port = 8080

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send("Hello world!")
})

app.get('/api/profile', (req, res) => {
  const view = {
    username: "Joe",
    tag: "1932",
    id: "796889023880495105",
    avatar: "230a6cf9e2d75857050f815731054cf2"
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
