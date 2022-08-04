require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const dns = require('dns');


const app = express();

//connect to db
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});

//Init body parser
app.use(bodyParser.urlencoded({ extended: false }));

//Configure port
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', async function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

/** Function to validate if a host exists
 * 
 * @param {} inputURL - a URL to validate
 * returns hosturl (e.g. www.youtube.com) if host exists
 *         "" if host does not exist
 */
 function validateUrl(inputURL)  {
  var hosturl = inputURL.toString();
  
  //remove protocol//
  hosturl = hosturl.split("//")[1];
  console.log("removed protocol in front of URL....current URL: %j", hosturl);

  //remove path
  hosturl = hosturl.split("/")[0];
  console.log("This is the hostname %j", hosturl);
  
  dns.lookup(hosturl, (err, addr, family) => {
      if(!addr) {
          return "";
      } else {
          return hosturl; 
      }
  });
}

/*SET UP MONGOOSE MODEL */
const UrlSchema = new mongoose.Schema({
  originalURL: {
    type: String,
    required: [true, "enter the original URL"],
  },
  shortURL: {
    type: String,
    required: [true, "enter short url"],
  },
});

const Url = mongoose.model('Url', UrlSchema);


/*POST TO /api/shorturl */
app.post("/api/shorturl", async (req, res) => {
  //TODO: get original url information from request body

  //TODO: validate original url

  //TODO: if valid, generate shorturl, add to database, send JSON of orignal_url and short_url

  //TODO: else, send JSON of error
});

/*POST TO /api/shorturl/:code */
app.post("api/shorturl/:code", (req, res) => {
  //TODO: get code from params

  //TODO: search in database 

  //TODO: get original url

  //TODO: redirect to original url
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
