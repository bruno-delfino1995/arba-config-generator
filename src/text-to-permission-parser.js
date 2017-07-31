var _ = require('lodash');
var utils = require('./utils');

function Parser(modifiersMap, def) {
  if (_.isUndefined(def)) def = defaultPermission;

  return function parse(permissionText) {
    var splitedPermissions = permissionText.split(/\s*\W\s/);
    var basicPerm = _.head(splitedPermissions);
    var modifiers = _.tail(splitedPermissions);
    var permission = def(basicPerm);

    var modifiersFlow = _.flow.apply(_, generateModifiersFlow(modifiers, modifiersMap));

    return modifiersFlow(permission);
  };
}

function generateModifiersFlow(modifiers, modifiersMap) {
  if (_.isUndefined(modifiers)) return [_.identity];

  return _.map(modifiers, function toSpec(id) {
    return modifiersMap[id];
  }).filter(function (modSpec) {
    return !(_.isUndefined(modSpec));
  }).map(function toFunc(modSpec) {
    return _.partial(applyModifier, _, modSpec);
  });
}

function applyModifier(permission, modifier) {
  var def = {};

  def[modifier.propertyName] = true;
  return utils.merge(permission, def);
}

function defaultPermission(permissionText) {
  if (/\byes\b/gi.test(permissionText)) {
    return {
      allowed: true
    };
  }

  return {
    allowed: false
  };
}

module.exports = Parser;
