require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('node:dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
// create application/json parser
const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// var count = 0
var urls = []

function findURL(urls, original_url) {
  for (let i = 0; i < urls.length; i++) {
    if (urls[i] == original_url) {
      return i
    }
  }
  urls.push(original_url)
  return urls.length - 1
}

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' })
});

app.post('/api/shorturl', urlencodedParser, (req, res, next) => {
  // check if its in url format
  let urlObj
  try {
    urlObj = new URL(req.body.url)
  } catch {
    console.log("not url format")
    return res.json({ error: 'invalid url' })
  }
  let hostname = urlObj.hostname

  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.log("failed dns lookup")
      return res.json({ error: 'invalid url' })
    }
  })
  return res.json({ hostname: hostname })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
