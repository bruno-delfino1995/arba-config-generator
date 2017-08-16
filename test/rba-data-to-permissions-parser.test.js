var path = require('path');

var sheetHelper = require('../src/sheet-helper.js');
var rbaDataExtractor = require('../src/rba-data-extractor');

var modifiersMappings = require('./support/modifiers-mappings');
var textToPermissionParser = require('../src/text-to-permission-parser')(modifiersMappings);

var rbaDataToPermissions = require('../src/rba-data-to-permissions-parser');

var sheet = sheetHelper.read(path.resolve(__dirname, 'support', 'simple-rba.ods'));
var data = sheetHelper.beautify(sheet.RBA);

var nullSheet = sheetHelper.read(path.resolve(__dirname, 'support', 'null-rba.ods'));
var nullData = sheetHelper.beautify(nullSheet.RBA);

describe('rba-data-to-permissions-parser', function () {
  it('transforms action text values into permissions', function () {
    var extractedRba = rbaDataExtractor(data);
    var permissions = rbaDataToPermissions(extractedRba, textToPermissionParser);
    var expected = [
      {
        name: 'Guest',
        permissions: [
          { action: 'landing-page', allowed: false },
          { action: 'my-settings', allowed: true },
          { action: 'photos', allowed: false },
          { action: 'manage-friends', allowed: false, 'read-only': true },
          { action: 'add-friend', allowed: false },
          { action: 'chat', allowed: false },
          { action: 'videos', allowed: true },
          { action: 'financial-settings', allowed: false }
        ]
      },
      {
        name: 'Owner',
        permissions: [
          { action: 'landing-page', allowed: true },
          { action: 'my-settings', allowed: true },
          { action: 'photos', allowed: true },
          { action: 'manage-friends', allowed: true },
          { action: 'add-friend', allowed: false },
          { action: 'chat', allowed: true },
          { action: 'videos', allowed: true },
          { action: 'financial-settings', allowed: true, 'financial-account': true }
        ]
      },
      {
        name: 'Authorized',
        permissions: [
          { action: 'landing-page', allowed: true },
          { action: 'my-settings', allowed: false },
          { action: 'photos', allowed: true },
          { action: 'manage-friends', allowed: false, 'only-friend': true },
          { action: 'add-friend', allowed: true },
          { action: 'chat', allowed: false },
          { action: 'videos', allowed: false },
          { action: 'financial-settings', allowed: true }
        ]
      }
    ];

    expect(permissions).to.be.like(expected);
  });

  it('it removes empty cell values, aka null', function () {
    var extractedRba = rbaDataExtractor(nullData);
    var permissions = rbaDataToPermissions(extractedRba, textToPermissionParser);
    var expected = [
      {
        name: 'Guest',
        permissions: [
          { action: 'landing-page', allowed: false },
          { action: 'my-settings', allowed: true },
          { action: 'photos', allowed: false },
          { action: 'manage-friends', allowed: false, 'read-only': true },
          { action: 'add-friend', allowed: false },
          { action: 'chat', allowed: false },
          { action: 'videos', allowed: true },
          { action: 'financial-settings', allowed: false }
        ]
      },
      {
        name: 'Owner',
        permissions: [
          { action: 'landing-page', allowed: true },
          { action: 'photos', allowed: true },
          { action: 'manage-friends', allowed: true },
          { action: 'chat', allowed: true },
          { action: 'videos', allowed: true },
          { action: 'financial-settings', allowed: true, 'financial-account': true }
        ]
      },
      {
        name: 'Authorized',
        permissions: [
          { action: 'landing-page', allowed: true },
          { action: 'my-settings', allowed: false },
          { action: 'photos', allowed: true },
          { action: 'add-friend', allowed: true },
          { action: 'chat', allowed: false },
          { action: 'videos', allowed: false },
          { action: 'financial-settings', allowed: true }
        ]
      }
    ];

    expect(permissions).to.be.like(expected);
  });
});
