'use strict';

var _ = require('lodash');
var factory;

function _transform(model, split) {
  var models = factory.dataModels;

  model.method = models[split[1]];

  if (split.length === 2) {
    if (model.reference && model.reference.properties) {
      model.method = _.extend(
        model.method,
        model.reference.properties
      );
    }
  } else {
    model.method = models[split[1]][split[2]];
  }

  return model;
}

function transform(event) {
  var model = event.model;
  var isRef = _.isString(model.method) &&  model.method.indexOf('model') === 0;
  var split;

  if (isRef) {
    split = model.method.split('.');
    if (split[0] === 'model') {
      model = _transform(model, split);
    }
  }
}

module.exports.enable = function (fixtureFactory) {
  factory = fixtureFactory;

  fixtureFactory.on('field:pre', transform);
};

module.exports.disable = function (fixtureFactory) {
  factory.removeListener('field:pre', transform);
  factory = null;
};
