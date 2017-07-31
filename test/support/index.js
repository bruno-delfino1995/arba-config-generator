var _ = require('lodash');
var chai = require('chai');
var chaiFuzzy = require('chai-fuzzy');

chai.use(chaiFuzzy);

var globals = {
  expect: chai.expect
};

_.assign(global, globals);
module.exports = globals;
