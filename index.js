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
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', urlencodedParser, function (req, res, next) {
  req.body.url
  if (!/^https?:$/.test(req.body.url)) {
    req.lookupResult = { error: "Invalid url" }
    next()
  }

  dns.lookup(req.body.url, (err, address, family) => {
    if (err) {
      req.lookupResult = { error: "Invalid url" }
      next()
    }
    /* 
    Pke Construct URL
    */
    var original_url = req.body.url.href
    var short_url = findURL(urls, original_url)

    req.lookupResult = {
      original_url: original_url,
      short_url: short_url
    }

    console.log(original_url)
    console.log(req.lookupResult)
    next()
  })
}, (req, res) => {
  res.json(req.lookupResult)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
