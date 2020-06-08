var fs = require('fs');
var path = require('path');
var objAssign = require('util')._extend;
var callsite = require('callsite');
var utils = require('./utils');
var validate = require('./validate');

var addSlash = utils.addSlash;
var normalize = utils.normalize;
var readConfig = utils.readConfig;

function cfg(options) {
  var _defaultPath = '_default';
  var _validationsPath = '_validations';
  // var _configpath = 'config';
  var nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

  options = options || {};

  var filepath = addSlash(path.dirname(callsite()[1].getFileName()));
  var config = {};
  var feats;

  options.defaultPath = normalize((options.defaultPath || _defaultPath), filepath);
  options.validationsPath = normalize(options.validationsPath || _validationsPath, filepath);
  // options.configPath = normalize(options.configPath || _configpath, filepath);
  options.validate = options.validate || false;
  options.logger = options.logger || console.log;

  var envDir = fs.existsSync(filepath + process.env.NODE_ENV) ?
               addSlash(filepath + process.env.NODE_ENV) :
               null;

  try {
    feats = fs.readdirSync(options.defaultPath).map(item => item.split('.')[0]);
  } catch (err) {
    throw new Error('default folder not found');
  }

  feats.forEach(function(item) {
    var dflt,
      env;

    try {
      dflt = readConfig(options.defaultPath + item);
    } catch (err) {
      throw new Error('cannot read default configuration file for ' + item);
    }

    if (envDir) {
      try {
        env = readConfig(envDir + item);
      } catch (err) {
        options.logger('cannot read configuration file for ' + item + '. Default config will be used.');
      }
    }

    config[item] = nodeVersion >= 6 ?
                   Object.assign({}, dflt, env) :
                   objAssign(dflt, env);

    config[item] = Object.keys(config[item]).reduce(function(memo, key) {
      memo[key] = process.env[key] || config[item][key];
      return memo;
    }, {});

    if (options.validate) {
      try {
        config[item] = validate(config[item], options.validationsPath + item + '.json');
      } catch (error) {
        options.logger(error.message + '\nConfig file: ' + item + '.json');
        options.logger('NODE_ENV: ' + process.env.NODE_ENV);
        throw error;
      }
    }
  });

  config.NODE_ENV = process.env.NODE_ENV;

  return config;
}

module.exports = cfg;
