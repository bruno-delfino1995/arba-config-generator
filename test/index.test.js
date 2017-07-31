var path = require('path');

var index = require('../src');
var modifiersMappings = require('./support/modifiers-mappings');

describe('rba-config-generator', function () {
  describe('.groupPermissions', function () {
    it('receives permissions and return permissions grouped by action', function () {
      var input = [
        {
          name: 'Guest',
          permissions: [
            { action: 'landingPage', allowed: false },
            { action: 'myPlanLP', allowed: true, 'financial-account': true },
            { action: 'quickActionsLP', allowed: false, 'read-only': true },
            { action: 'usageLP', allowed: false },
            { action: 'viewPromotionsLP', allowed: true },
            { action: 'allowancesLP', allowed: false }
          ]
        },
        {
          name: 'SelfServiceOwner',
          permissions: [
            { action: 'landingPage', allowed: true },
            { action: 'myPlanLP', allowed: true },
            { action: 'quickActionsLP', allowed: true },
            { action: 'usageLP', allowed: false },
            { action: 'payMyBillLP', allowed: true, 'financial-account': true },
            { action: 'allowancesLP', allowed: true }
          ]
        },
        {
          name: 'SelfServiceAuthorized',
          permissions: [
            { action: 'myBalanceLP', allowed: true, 'something-interesting': true },
            { action: 'quickActionsLP', allowed: false, 'financial-account': true },
            { action: 'viewPromotionsLP', allowed: false },
            { action: 'allowancesLP', allowed: true }
          ]
        }
      ];
      var result = index.groupPermissions(input);
      var expected = {
        landingPage: [
          { action: 'landingPage', allowed: false, role: 'Guest' },
          { action: 'landingPage', allowed: true, role: 'SelfServiceOwner' }
        ],
        myPlanLP: [
          { action: 'myPlanLP', allowed: true, 'financial-account': true, role: 'Guest' },
          { action: 'myPlanLP', allowed: true, role: 'SelfServiceOwner' }
        ],
        quickActionsLP: [
          { action: 'quickActionsLP', allowed: false, 'read-only': true, role: 'Guest' },
          { action: 'quickActionsLP', allowed: true, role: 'SelfServiceOwner' },
          { action: 'quickActionsLP', allowed: false, 'financial-account': true, role: 'SelfServiceAuthorized' }
        ],
        usageLP: [
          { action: 'usageLP', allowed: false, role: 'Guest' },
          { action: 'usageLP', allowed: false, role: 'SelfServiceOwner' }],
        viewPromotionsLP: [
          { action: 'viewPromotionsLP', allowed: true, role: 'Guest' },
          { action: 'viewPromotionsLP', allowed: false, role: 'SelfServiceAuthorized' }
        ],
        allowancesLP: [
          { action: 'allowancesLP', allowed: false, role: 'Guest' },
          { action: 'allowancesLP', allowed: true, role: 'SelfServiceOwner' },
          { action: 'allowancesLP', allowed: true, role: 'SelfServiceAuthorized' }],
        payMyBillLP: [
          { action: 'payMyBillLP', allowed: true, 'financial-account': true, role: 'SelfServiceOwner' }],
        myBalanceLP: [
          { action: 'myBalanceLP', allowed: true, 'something-interesting': true, role: 'SelfServiceAuthorized' }
        ]
      };

      expect(result).to.be.like(expected);
    });
  });

  describe('.generate', function () {
    it('extracts the permissions for each user mapped to respective sheet', function () {
      var userMappings = [
        {
          name: 'authorized',
          sheet: 'AUTHORIZED'
        },
        {
          name: 'guest',
          sheet: 'GUEST'
        },
        {
          name: 'anonymous',
          sheet: 'ANONYMOUS'
        },
        {
          name: '',
          sheet: 'DEFAULT'
        }
      ];
      var sheet = path.resolve(__dirname, 'support', 'new-spreadsheet.xlsx');
      var result = index.generate(sheet, {
        users: userMappings,
        modifiers: modifiersMappings
      });

      expect(result).to.have.all.keys(['anonymous', 'authorized', 'guest', '']);
    });

    it('returns the first sheet values if no user mappings were provided', function () {
      var sheet = path.resolve(__dirname, 'support', 'simple-rba.ods');
      var result = index.generate(sheet, {
        modifiers: modifiersMappings
      });

      expect(result).to.have.all.keys(['landing-page', 'my-settings', 'photos', 'manage-friends',
        'add-friend', 'chat', 'videos', 'financial-settings']);
    });
  });
});
