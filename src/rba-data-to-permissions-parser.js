var _ = require('lodash');
var utils = require('./utils');

function tupleToActionPermit(tuple) {
  var name = tuple[1];
  var permission = tuple[0];

  return utils.merge(permission, { action: name });
}

module.exports = function (data, textParser) {
  return _.map(data.roles, function toPermission(role) {
    var permissions = _.chain(role.values)
      .zip(data.actions)
      .filter(function (el) {
        return !_.isNull(el[0]);
      })
      .map(function (el) {
        return [textParser(el[0]), el[1]];
      })
      .map(tupleToActionPermit)
      .value();

    return {
      name: role.name,
      permissions: permissions
    };
  });
};
