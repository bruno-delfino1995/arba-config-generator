var _ = require('lodash');

var sheetHelper = require('./sheet-helper');
var rbaExtractor = require('./rba-data-extractor');
var textToPermissionsParser = require('./text-to-permission-parser');
var rbaToPermissionsParser = require('./rba-data-to-permissions-parser');
var utils = require('./utils');

function generate(spreadsheet, config) {
  var modifiers = config.modifiers;
  var users = config.users;
  var textParser = textToPermissionsParser(modifiers);

  var sheets = sheetHelper.read(spreadsheet);

  var noUserTypes = _.isUndefined(users);
  var userTypes = !(noUserTypes) ? users : [{ name: '', sheet: _.keys(sheets)[0] }];

  var permissions = sheetToUserPermissions(sheets, userTypes, textParser);

  return noUserTypes ? permissions[''] : permissions;
}

function sheetToUserPermissions(sheets, userTypes, textParser) {
  return _.chain(userTypes)
    .map(function (user) {
      return {
        name: user.name,
        sheet: sheetHelper.beautify(sheets[user.sheet])
      };
    })
    .map(function (userSheet) {
      return {
        name: userSheet.name,
        rba: rbaExtractor(userSheet.sheet)
      };
    })
    .map(function (userRba) {
      return {
        name: userRba.name,
        roles: rbaToPermissionsParser(userRba.rba, textParser)
      };
    })
    .map(function (userRoles) {
      return {
        name: userRoles.name,
        permissions: rolesToActionPermissions(userRoles.roles)
      };
    })
    .reduce(function (accum, userPermissions) {
      accum[userPermissions.name] = userPermissions.permissions;

      return accum;
    }, {})
    .value();
}

function rolesToActionPermissions(roles) {
  return _.chain(roles)
    .map(extractPermissionsWithRole)
    .flatten()
    .groupBy(_.property('action'))
    .mapValues(function (actionPermissions) {
      return _.uniq(actionPermissions, _.property('role'));
    })
    .value();
}

function extractPermissionsWithRole(role) {
  return _.map(role.permissions, function joinRoleToPermission(perm) {
    return utils.merge(perm, {
      role: role.name
    });
  });
}

module.exports = {
  groupPermissions: rolesToActionPermissions,
  generate: generate
};
