var db = require('../config');
var Click = require('./click');
// var userLink = require('./userLink');
var User = require('./user');
var crypto = require('crypto');

var Link = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  clicks: function() {
    return this.hasMany(Click);
  },
  users: function() {
    return this.belongsToMany(User, 'users_urls');
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;
