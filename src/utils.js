var _ = require('lodash');
var fs = require('fs');

function take(arr, position, reverse) {
  var length = !(reverse) ? position : arr.length - position;
  var func = !(reverse) ? _.take : _.takeRight;

  return func(arr, length);
}

function merge(/* ...objs*/) {
  var objs = Array.prototype.slice.call(arguments);

  return _.assign.apply(_, [{}].concat(objs));
}

function push(arr, elem) {
  return Array.prototype.concat.call([], arr, elem);
}

function permutate(arr1, arr2, func) {
  return _.chain(arr1)
    .map(function (el1) {
      return _.map(arr2, function (el2) {
        return func(el1, el2);
      });
    })
    .flatten()
    .value();
}

function join(x, y) {
  return x + '' + y;
}

function copyProp(src, dest, key) {
  var result = merge(dest);
  result[key] = src[key];

  return result;
}

function writeData(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

module.exports = {
  take: take,
  push: push,
  merge: merge,
  permutate: permutate,
  join: join,
  copyProp: copyProp,
  writeData: writeData
};
