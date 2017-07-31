var _ = require('lodash');
var xlsx = require('xlsx');
var utils = require('./utils');

function isCellIndex(index) {
  return /^[A-Z]{1,}[0-9]{1,}$/.test(index);
}

function cellIndexToCoord(index) {
  var separated = _.chain(index.split(''))
    .groupBy(isLetter)
    .values()
    .map(_.partial(_.reduce, _, utils.join, ''))
    .value();

  var columnIndex = _.reduce(separated[0], function multipleLettersToNumber(acc, el, i) {
    return acc + letterToIndex(el) + (i * letterToIndex('Z'));
  }, 0);

  return columnByRowToCoord(columnIndex, separated[1] - 1);
}

function isLetter(str) {
  return /^[a-zA-Z]$/.test(str);
}

function letterToIndex(letter) {
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
}

function columnByRowToCoord(col, row) {
  return row + 'x' + col;
}

function coordToColumnByRow(coord) {
  var separated = coord.split('x');

  return {
    row: parseInt(separated[0], 10),
    column: parseInt(separated[1], 10)
  };
}

function mergedCellsToCoordinates(mergedCells) {
  return _.chain(mergedCells)
    .map(function (spec) {
      return {
        from: {
          row: spec.s.r,
          column: spec.s.c
        },
        to: {
          row: spec.e.r,
          column: spec.e.c
        }
      };
    })
    .value();
}

function replicateValueInMergedCells(cells, merged) {
  var mergedCells = _.chain(merged)
    .map(function (coord) {
      var columns = _.range(coord.from.column, coord.to.column + 1);
      var rows = _.range(coord.from.row, coord.to.row + 1);

      return utils.permutate(columns, rows, function (column, row) {
        return {
          column: column,
          row: row
        };
      });
    })
    .map(function (mCells) {
      return _.map(mCells, function (coord) {
        return columnByRowToCoord(coord.column, coord.row);
      });
    })
    .value();

  _.each(mergedCells, function (mCells) {
    var base = mCells[0];

    _.each(mCells, function (coord) {
      cells[coord] = cells[base];
    });
  });

  return cells;
}

module.exports = {
  read: function (filename) {
    return xlsx.readFile(filename).Sheets;
  },
  beautify: function (sheet) {
    var cells = _.chain(sheet)
      .keys(sheet)
      .filter(isCellIndex)
      .reduce(_.partial(utils.copyProp, sheet), {})
      .mapKeys(_.rearg(cellIndexToCoord, [1, 0]))
      .mapValues(_.property('v'))
      .value();

    var mergedCells = mergedCellsToCoordinates(sheet['!merges']);
    var filledCells = replicateValueInMergedCells(cells, mergedCells);

    var limits = sheet['!ref'].split(':');
    var init = coordToColumnByRow(cellIndexToCoord(limits[0]));
    var final = coordToColumnByRow(cellIndexToCoord(limits[1]));
    var columns = _.range(init.column, final.column + 1);
    var rows = _.range(init.row, final.row + 1);

    return _.chain(utils.permutate(columns, rows, columnByRowToCoord))
      .groupBy(function (key) { return key.split('x')[0]; })
      .values()
      .map(function (rowCoords) {
        return _.map(rowCoords, function (coord) {
          var value = filledCells[coord];

          return _.isUndefined(value) ? null : value;
        });
      })
      .value();
  },

  mergedCells: function (sheet) {
    return mergedCellsToCoordinates(sheet['!merges']);
  }
};
