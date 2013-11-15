
/**
 * Module dependencies
 */

var routes        = require('./routes'),
    api           = require('./routes/api'),
    path          = require('path'),
    fs            = require('fs'),
    url           = require('url'),
    querystring   = require('querystring'),
    signedRequest = require('signed-request'),
    express       = require('express'),
    request       = require('request'),

    config        = require('./config'),

    http          = require('http'),
    https         = require('https');

var DAY_IN_SECONDS = 86400;

if (!config.facebook.appId || !config.facebook.appSecret) {
  throw new Error('facebook appId and appSecret required in config.js');
}

var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var signedRequestMaxAge = DAY_IN_SECONDS;

// Makes a URL to the Facebook Login dialog.
// https://developers.facebook.com/docs/authentication/canvas/
function loginURL(redirectURI) {
  return url.format({
    protocol: 'https',
    host:     'www.facebook.com',
    pathname: 'dialog/oauth',
    query: {
      client_id:     config.facebook.appId,
      redirect_uri:  redirectURI,
      scope:         config.facebook.scope,
      response_type: 'none'
    }
  })
}

// Inline our JavaScript and boot() it.
var externalJS = fs.readFileSync(__dirname + '/public/fbclient.js', 'utf8');

function js(conf) {
  conf.canvasURL = canvasURL;
  conf.appId     = config.facebook.appId;

  return (
    '<div id="fb-root"></div>' +
    '<script>' +
       externalJS +
       'boot(' + JSON.stringify(conf) + ')' +
    '</script>'
  )
}

// Get the access_token from the signed request.
// https://developers.facebook.com/docs/authentication/server-side/
function getAccessToken(sr, cb) {
  if (!sr) {
    return process.nextTick(cb.bind(null, new Error('no signed request')))
  }

  if (sr.oauth_token) {
    return process.nextTick(cb.bind(null, null, sr.oauth_token))
  }

  if (!sr.code) {
    return process.nextTick(cb.bind(null, new Error('no token or code')))
  }

  request.get(
    {
      url: 'https://graph.facebook.com/oauth/access_token',
      qs: {
        client_id:     config.facebook.appId,
        client_secret: config.facebook.appSecret,
        code:          sr.code,
        redirect_uri:  '' // the cookie uses a empty redirect_uri
      },

      encoding: 'utf8'
    },

    function getAccessTokenCb(er, res, body) {
      if (er) {
        return cb(er)
      }

      var r = querystring.parse(body);

      if (r && r.access_token) {
        return cb(null, r.access_token)
      }

      cb(new Error('unexpected access_token exchange: ' + body))

    }
  )
}

// Get the /me response for the user.
// https://developers.facebook.com/docs/reference/api/user/
function graphMe(sr, cb) {
  getAccessToken(sr, function graphMeAccessTokenCb(er, accessToken) {
    if (er) {
      return cb(er)
    }

    request.get(
      {
        url: 'https://graph.facebook.com/me',
        qs: { access_token: accessToken },
        json: true
      },

      function graphMeRequestCb(er, res, body) {
        if (er) {
          return cb(er)
        }

        console.log(body);

        cb(null, body)
      }
    )
  })
}

// Send the login page response.
function sendLogin(req, res, next) {
  res.send(
    200,
    '<!doctype html>' +
    'Welcome unknown user. Click one of these to continue:<br><br>' +
    '<a target="_top" href=' + JSON.stringify(loginURL(canvasURL)) + '>' +
    'Full Page Canvas Login' +
    '</a><br><br>' +
    '<div class="fb-login-button" scope="' + config.facebook.scope + '">' +
    'JS SDK Dialog Login' +
    '</div>' +
    js({ reloadOnLogin: true })
  )
}


var app = module.exports = express();

/**
* Configuration
*/

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
   app.use(express.errorHandler());
};

// production only
if (app.get('env') === 'production') {
  // TODO
}; 



// Routes
app.get('/', routes.webappindex);
app.get('/partial/:name', routes.partial);

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.webappindex);

/**
* Start Server
*/

var httpServer  = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(app.get('port'), function() {
    console.log('http Listening on ' + app.get('port'))
});

httpsServer.listen(3443, function() {
    console.log('https Listening on ' + 3443)
});