var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');
// var userLink = require('./userLink');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  urls: function() {
    return this.belongsToMany(Link, 'users_urls', 'user_id', 'url_id');
  }
  // hashPW: function(password, cb) {
  //   bcrype.hash(password, null, null, function(err, hash) {
  //     cb(hash);
  //   });
  // },
  // comparePW: function(password, hash, cb) {
  //   bcrype.compare(password, hash, function(err, bool) {
  //     cb(bool);
  //   });
  // } 

});

module.exports = User;