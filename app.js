// App.js

// Invoice NodeJS Express application

const path = require('path');
const config = require('@omni-config');

// load the configuration
config.init(path.join(__dirname, '/settings'));

// load new relic if enabled - DO NOT REQUIRE ANYTHING ELSE ABOVE THIS LINE!
if (config.settings.app.enableNewRelic) {
  require('newrelic');
}

const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const index = require('./routes/index');
const logger = require('morgan');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');

// route handlers
const health = require('./routes/health');
const api = require('./routes/api');

// load the configuration
config.init(path.join(__dirname, '/settings'));

// swagger definition
const swaggerDefinition = {
  info: {
    title: 'Invoice API',
    version: '1.0.0',
    description: 'This is the API for the Invoice Microservice'
  },
  host: config.settings.app.swaggerHost,
  basePath: '/'
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js', './modules/**/*.routes.js']
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// start the app
const app = express();

// Setup cors
if (config.settings.cors.production === true) {
  console.log(`Enabling cors on the app for production. Whitelist = ${config.settings.cors.whitelist}`);

  const corsOptions = {
    origin(origin, callback) {
      if (config.settings.cors.whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  };
  app.use(cors(corsOptions));
} else {
  console.log('Enabling cors on the app for development. All sites allowed.');
  app.use(cors());
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'service_gear.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup the routes
app.use('/', index);
app.use('/health', health);
app.use('/api/v1', api);

// serve swagger
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Setup the Route
app.use('/help', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error(`404 Not Found. The originalUrl ${req.originalUrl} was not found. Host = ${req.hostname}.`);
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  // eslint-disable-next-line no-param-reassign
  res.locals.message = err.message;
  // eslint-disable-next-line no-param-reassign
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
module.exports.config = config;

