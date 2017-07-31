var _ = require('lodash');

function extract(matrix) {
  var columns = _.chain(invertMatrix(matrix))
    .map(arrToColumn)
    .value();

  return {
    actions: _.head(columns).values,
    roles: _.tail(columns)
  };
}

function invertMatrix(matrix) {
  return _.zip.apply(_, matrix);
}

function arrToColumn(arr) {
  return {
    name: _.head(arr),
    values: _.tail(arr)
  };
}

module.exports = extract;
