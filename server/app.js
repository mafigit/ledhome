// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost'); // connect to our database
var Ledstripe     = require('./app/models/ledstripe.js');
var routes = require('./routes/index');
var request = require('request');
var io = require('socket.io').listen('8080');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

io.sockets.on('connection', function(socket) {
  console.log(socket)
  socket.on('ledstripe', function(data) {
    socket.broadcast.emit('ledstripe', data);
  })
});

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

app.get('/setled', function(req, res) {
  var color = req.query.color;
  var value = req.query.value;
  var ip = req.query.ip;
  var id = req.query.id;
  var pin = 0;


  Ledstripe.findById(id, function(err, ledstripe) {
    console.log(ledstripe)
    switch(color) {
      case 'red':
        pin = 5;
        ledstripe.red = value;
        break;
      case 'green':
        pin = 6;
        ledstripe.green = value;
        break;
      case 'blue':
        pin = 3;
        ledstripe.blue = value;
        break;
      default:
        pin = 0;
    }
    ledstripe.save();
    request('http://' + ip + "/" + pin + '/' +  value, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send('success');
      }
    })
  });
});

// on routes that end in /ledstripes
// ----------------------------------------------------
router.route('/ledstripes')

  // create a ledstripe (accessed at POST http://localhost:8080/ledstripes)
  .post(function(req, res) {
    var ledstripe = new Ledstripe();    // create a new instance of the Ledstripe model
    ledstripe.name = req.body.name;  // set the ledstripes name (comes from the request)
    ledstripe.ip = req.body.ip;
    ledstripe.red = 0;
    ledstripe.green = 0;
    ledstripe.blue = 0;

    ledstripe.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'Ledstripe created!' });
    });
  })

  // get all the ledstripes (accessed at GET http://localhost:8080/api/ledstripes)
  .get(function(req, res) {
    Ledstripe.find(function(err, ledstripes) {
      if (err)
        res.send(err);

      res.json(ledstripes);
    });
  });

// on routes that end in /ledstripes/:ledstripe_id
// ----------------------------------------------------
router.route('/ledstripes/:ledstripe_id')

  // get the ledstripe with that id
  .get(function(req, res) {
    Ledstripe.findById(req.params.ledstripe_id, function(err, ledstripe) {
      if (err)
        res.send(err);
      res.json(ledstripe);
    });
  })

  // update the ledstripe with this id
  .put(function(req, res) {
    Ledstripe.findById(req.params.ledstripe_id, function(err, ledstripe) {

      if (err)
        res.send(err);

      ledstripe.name = req.body.name;
      ledstripe.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Ledstripe updated!' });
      });

    });
  })

  // delete the ledstripe with this id
  .delete(function(req, res) {
    Ledstripe.remove({
      _id: req.params.ledstripe_id
    }, function(err, ledstripe) {
      if (err)
        res.send(err);

      res.json({ message: 'Successfully deleted' });
    });
  });


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
module.exports = app;
