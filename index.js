require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');


const app = express();

//connect to db
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('connected', function() {
  console.log('MongoDB has connected successfully');
});

//Init body parser
app.use(bodyParser.urlencoded({ extended: false }));

//Configure port
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', async function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//API endpoint 
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

/*** SET UP MONGOOSE MODEL */
const UrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    default: Date.now,
  },
  nextShortUrl:  {
    type: Number,
    required: true,
  }
});

var Url = mongoose.model('Url', UrlSchema);

//adding to database  
/* Url.create([
  {
    originalUrl: "https://blog.logrocket.com/building-a-url-shortener-with-node-js/", 
    shortUrl: 0,
    date: new Date(),
    nextShortUrl: 1,
  }
]);    */


//POST TO /api/shorturl 
app.post("/api/shorturl", (req, res) => {
  let { url } = req.body;
  console.log("Url: %j", url);

  let original_url = url;
  let short_url;
  
  //process URL to get hostname
  let hostname = String(url);
  hostname = hostname.replace("https://", "");  //remove https protocol from url
  hostname = hostname.split("/")[0];  //removes subdomains
  console.log("Hostname: %j", hostname);

  //validate hostname
  dns.lookup(hostname, async (err, address) => {
    if(err)  {  //invalid hostname
      res.json({ error: "invalid URL" });
    }  else {   //valid hostname
      try {  
        url_document = await Url.findOne({ originalUrl: url });

        if(url_document != null)  { //shortURL already generated previously
          short_url = url_document.shortUrl;
          console.log("Short URL: %j", short_url);

          res.json({
            original_url: original_url,
            short_url: short_url,
          });

        } else {  //no shortUrl generated yet
          Url.find({}).sort({ date: -1 }).limit(1).exec((err, recentUrl) => {
            short_url = recentUrl[0].nextShortUrl;  //generate shortURL from previous shortURL
            
            Url.create({
              originalUrl: url,
              shortUrl: short_url,
              date: new Date(),
              nextShortUrl: short_url + 1,
            });

            console.log("Created new shortURL: %j", short_url);

            res.json({
              original_url: original_url,
              short_url: short_url,
            });
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
}); 


/*** POST TO /api/shorturl/:code */
app.post("api/shorturl/:code", (req, res) => {
  
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
