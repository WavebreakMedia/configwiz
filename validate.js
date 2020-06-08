/**
 * Created by ahmetcetin on 13/12/2016.
 */
var joi = require('joi');
var fs = require('fs');
var utils = require('./utils');

var readJSON = utils.readConfig;

function validate(obj, path) {
  var def = readJSON(path);

  var definedSchema = Object.keys(def).reduce(function(memo, key) {
    memo[key] = joi[def[key].type]();
    if (def[key].allowed) {
      memo[key] = memo[key].valid(def[key].allowed);
    }
    if (def[key].required) memo[key] = memo[key].required();
    return memo;
  }, {});

  var schema = joi.object(definedSchema);
  var result = joi.validate(obj, schema);

  if (result.error) throw new Error('Config validation error: ' + result.error.message);
  return result.value;
}

module.exports = validate;
