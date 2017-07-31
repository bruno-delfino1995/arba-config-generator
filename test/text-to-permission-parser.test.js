var _ = require('lodash');

var textToPermissionParser = require('../src/text-to-permission-parser');
var modifiersMappings = require('./support/modifiers-mappings');

describe('text-to-permissions-parser', function () {
  it('check for yes/no when no default was provided', function () {
    var parser = textToPermissionParser();
    var testCases = [
      ['Yes', true],
      ['No', false],
      ['yES', true],
      ['nO', false],
      ['', false]
    ];

    _.each(testCases, function (x) {
      expect(parser(x[0])).to.include({ allowed: x[1] });
    });
  });

  it('create new properties for each modifier', function () {
    var parser = textToPermissionParser(modifiersMappings);
    var testCases = [
      [
        'yes - RO, OF',
        { allowed: true, 'read-only': true, 'only-friend': true }
      ],
      [
        'No - RO',
        { allowed: false, 'read-only': true }
      ]
    ];

    _.each(testCases, function (x) {
      expect(parser(x[0])).to.include(x[1]);
    });
  });

  it('ignores unmapped modifiers', function () {
    var parser = textToPermissionParser(modifiersMappings);

    expect({ allowed: true }).to.have.all.keys(_.keys(parser('yes - DO')));
  });
});
