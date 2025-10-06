require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('node:dns');

// import models
const { getNextSequence } = require('./src/services/idService');
const Url = require('./src/models/url');

// connect to database
require('./src/database');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// function findURL(urls, original_url) {
//   for (let i = 0; i < urls.length; i++) {
//     if (urls[i] == original_url) {
//       return i
//     }
//   }
//   urls.push(original_url)
//   return urls.length - 1
// }

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' })
});

async function verifyUrl(input) {
  // check if its in url format
  let urlObj
  urlObj = new URL(input)
  // dns lookup
  const { lookup } = dns.promises
  await lookup(urlObj.hostname)

  return urlObj
}

app.post('/api/shorturl', urlencodedParser, async (req, res, next) => {
  let urlObj
  try {
    urlObj = await verifyUrl(req.body.url)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('invalid protocol')
    }
  } catch {
    return res.json({ error: 'invalid url' });
  }

  // check if url already exists
  let foundUrl = await Url.findOne({ original_url: urlObj.href }).lean()
  if (foundUrl) {
    return res.json({ original_url: foundUrl.original_url, short_url: foundUrl.short_url })
  } else {
    // get next sequence
    let nextId = await getNextSequence('short_url')
    console.log({
      nextId,
      type: typeof nextId,
      url: urlObj.href
    });

    let newUrl = new Url({ original_url: urlObj.href, short_url: nextId })
    await newUrl.save()
    return res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url })
  }
})

app.get('/api/shorturl/:short_url', async (req, res, next) => {
  let id = Number(req.params.short_url)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Wrong format' })
  }

  const doc = await Url.findOne({ short_url: id }).lean()
  if (!doc) {
    return res.status(400).json({ error: 'invalid url' })
  }
  return res.redirect(doc.original_url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
