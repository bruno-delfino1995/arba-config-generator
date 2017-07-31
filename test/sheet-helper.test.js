var path = require('path');
var _ = require('lodash');

var sheetHelper = require('../src/sheet-helper');

var support = path.resolve(__dirname, 'support');

var withManySheets = sheetHelper.read(path.resolve(support, 'new-spreadsheet.xlsx'));
var withMergedCells = sheetHelper.read(path.resolve(support, 'sheet-values.ods'));
var simpleSheet = sheetHelper.read(path.resolve(support, 'simple-rba.ods'));

describe('sheet-helper', function () {
  describe('.read', function () {
    it('should return a json representing the sheet', function () {
      expect(withManySheets).to.be.an('object');
      expect(simpleSheet).to.be.an('object');
    });

    it('should separate the sheets by name', function () {
      expect(simpleSheet).to.have.all.keys('RBA');
      expect(withMergedCells).to.have.all.keys('Sheet1', 'Sheet2', 'Sheet3');
      expect(withMergedCells).to.not.have.keys('Description', 'DEFAULT');
    });
  });

  describe('.beautify', function () {
    it('should turn the ugly single sheets from read into nice matrix', function () {
      var testCases = [
        {
          sheet: withMergedCells.Sheet1,
          expected: [[1, 2, 3]]
        },
        {
          sheet: withMergedCells.Sheet2,
          expected: [[4], [5], [6]]
        }
      ];

      _.each(testCases, function (x) {
        expect(sheetHelper.beautify(x.sheet)).to.be.like(x.expected);
      });
    });

    it('should fill the merged cells with the same value', function () {
      var result = sheetHelper.beautify(withMergedCells.Sheet3);
      var expected = [
        [40, 20, 30, 10, 5, 15, 30, 2, 12],
        [100, 100, null, null, 1, 15, null, null, 12],
        [100, 100, 7, 7, 1, 15, 10, 10, null]
      ];

      expect(result).to.be.like(expected);
    });
  });

  describe('.mergedCells', function () {
    it('should return a map with start/end cells', function () {
      var rc = function (r, c) { return { column: c, row: r }; };
      var data = withMergedCells.Sheet3;
      var result = sheetHelper.mergedCells(data);
      var expected = [
        { from: rc(0, 5), to: rc(2, 5) },
        { from: rc(0, 8), to: rc(1, 8) },
        { from: rc(1, 0), to: rc(2, 1) },
        { from: rc(1, 4), to: rc(2, 4) },
        { from: rc(2, 2), to: rc(2, 3) },
        { from: rc(2, 6), to: rc(2, 7) }
      ];

      expect(result).to.be.like(expected);
    });
  });
});
