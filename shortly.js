var express = require('express');
var session = require('express-session');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var bcrypt = require('bcrypt-nodejs');


var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({username: null, password: null, secret: 'batman roolz'}));

app.get('/', util.restrict, 
function(req, res) {
  res.render('index');
});

app.get('/create', util.restrict, 
function(req, res) {
  res.render('index');
});

app.get('/links', util.restrict, 
function(req, res) {
  db.knex('users').select('id').where('username', '=', req.session.username).then(function(data) {
    // console.log('user: ', new User(data[0]));
    // console.log('fetch: ', new User(data[0]).fetch().then(function(data) {
    //   console.log(data);
    // }));
    new User(data[0]).fetch({
      withRelated: ['urls']
    }).then(function(user) {
      // console.log('USER: ', user);
      // console.log('USERS LINKS: ', user.related('urls'));
      user.related('urls').fetch().then(function(data) {
        // console.log('data on fetch: ', data);
        res.send(200, data.models);
      });
    }).catch(function(err) {
      console.log('error fetching: ', err);
    });
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  });
  // });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {

    if (found) {
      db.knex('users').select('id').where('username', '=', req.session.username)
      .then(function(data) {
        // console.log('data: ', data[0].id);
        // console.log('newLinkL ', newLink);
        db.knex('users_urls').insert({'user_id': data[0].id, 'url_id': found.attributes.id})
        .then(function() {
          res.status(200).send(found.attributes);
        });
      });
      
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          db.knex('users').select('id').where('username', '=', req.session.username)
          .then(function(data) {
            // console.log('data: ', data[0].id);
            // console.log('newLinkL ', newLink);
            db.knex('users_urls').insert({'user_id': data[0].id, 'url_id': newLink.attributes.id})
            .then(function() {
              res.status(200).send(newLink);
            });
          });
        });
        // .then(function(newLink) {
        //   res.status(200).send(newLink);
        // });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', 
  function(req, res) {
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
      req.session.password = hash;
      req.session.username = req.body.username;
      console.log('body password: ', req.body.password);
      new User({username: req.body.username, password: hash}).save().then(function(data) {
      // req.session.password = this.password;
        res.redirect('/');
      });
    });
  }
);



app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.post('/login', function(req, res) {
  // check req.body.username with the database,
  // if there, pull out the password and check it

  db.knex('users').where('username', '=', req.body.username).then(function(data) {
    // if (req.body.password && data[0] && req.body.password === data[0].password) {
    //   req.session.username = req.body.username;
    //   req.session.password = req.body.password;
    //   res.redirect('/');
    // } 
    if (req.body.password && data[0]) {
      console.log(data[0]);
      bcrypt.compare(req.body.password, data[0].password, function(err, bool) {
        if (bool) {
          req.session.password = data[0].password;
          req.session.username = req.body.username;
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      });
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/logout', function(req, res) {
  req.session.username = null;
  req.session.password = null;
  res.redirect('/login');
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
