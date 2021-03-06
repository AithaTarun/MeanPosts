//Install express server
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

const whitelist = ['0.0.0.0/0']; // list of allow domain

const corsOptions =
  {
  origin: function (origin, callback) 
  {
    if (!origin)
    {
      return callback(null, true);
    }

    if (whitelist.indexOf(origin) === -1)
    {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}

// end
app.use(cors(corsOptions));

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/mean-stack'));

app.get('/*', function(req,res)
{

  res.sendFile(path.join(__dirname+'/dist/mean-stack/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
