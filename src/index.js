
// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const {startDatabase} = require('./database/mongo');
const {insertAd, getAds} = require('./database/ads');
const {deleteAd, updateAd} = require('./database/ads');
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');

// defining the Express app
const app = express();



// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// defining an endpoint to return all ads
app.get('/', async (req, res) => {
    res.send(await getAds());
  });


var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-ycwq9w-k.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'http://api-test/',
  issuer: 'https://dev-ycwq9w-k.us.auth0.com/',
  algorithms: ['RS256']
});

app.use(jwtCheck);

app.post('/', async (req, res) => {
    const newAd = req.body;
    await insertAd(newAd);
    res.send({ message: 'New ad inserted.' });
  });
  
// endpoint to delete an ad
app.delete('/:id', async (req, res) => {
    await deleteAd(req.params.id);
    res.send({ message: 'Ad removed.' });
  });
  
  // endpoint to update an ad
app.put('/:id', async (req, res) => {
    const updatedAd = req.body;
    await updateAd(req.params.id, updatedAd);
    res.send({ message: 'Ad updated.' });
  });
  

startDatabase().then(async () => {
    await insertAd({title: 'Hello, now from the in-memory database!', 
                    description: 'something new can be added',
                    text: 'update the text of this here'
                    
});
  

// starting the server
app.listen(3001, async () => {
    console.log('listening on port 3001');
  });
});
