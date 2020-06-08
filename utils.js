/**
 * Created by ahmetcetin on 14/12/2016.
 */
var path = require('path');
var fs = require('fs');
var objAssign = require('util')._extend;

var nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

function lastChar(str) {
  return str.charAt(str.length - 1);
}

function addSlash(str) {
  return lastChar(str) === '/' ? str : str + '/';
}

function normalize(str, baseDir) {
  return path.normalize(baseDir + addSlash(str));
}

function readConfig(file) {
  var json = fs.existsSync(file + '.json') ?
    JSON.parse(fs.readFileSync(file + '.json').toString()) :
    {};
  var js = fs.existsSync(file + '.js') ?
    require(file + '.js') :
    {};
  return nodeVersion >= 6 ?
    Object.assign({}, json, js) :
    objAssign(json, js);
}

module.exports = {
  lastChar: lastChar,
  addSlash: addSlash,
  normalize: normalize,
  readConfig: readConfig,
};
