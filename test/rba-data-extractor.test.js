var _ = require('lodash');
var path = require('path');

var sheetHelper = require('../src/sheet-helper.js');
var rbaDataExtractor = require('../src/rba-data-extractor');

var sheet = sheetHelper.read(path.resolve(__dirname, 'support', 'simple-rba.ods'));
var data = sheetHelper.beautify(sheet.RBA);

describe('rba-data-extractor', function () {
  it('should return an object with actions and roles', function () {
    expect(rbaDataExtractor(data)).to.have.all.keys(['actions', 'roles']);
  });

  it('returns each role as a column', function () {
    _.each(rbaDataExtractor(data).roles, function (role) {
      expect(role).to.have.all.keys(['name', 'values']);
    });
  });

  it('considers the first column of the sheet as actions', function () {
    var columns = _.zip.apply(_, data);

    expect(rbaDataExtractor(data).actions).to.be.like(_.tail(columns[0]));
  });

  it('remaining columns are extracted as roles', function () {
    var expected = [
      { name: 'Guest', values: ['No', 'yes', 'No', 'No - RO', 'No', 'No', 'Yes', 'No'] },
      { name: 'Owner', values: ['Yes', 'Yes - DO', 'Yes', 'Yes', 'xablau', 'Yes', 'Yes', 'Yes - FA'] },
      { name: 'Authorized', values: ['Yes', 'No', 'Yes', 'No - OF', 'Yes', 'bla', 'No', 'Yes'] }
    ];

    expect(rbaDataExtractor(data).roles).to.be.like(expected);
  });
});
