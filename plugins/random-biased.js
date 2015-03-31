'use strict';

var _ = require('lodash');
var faker = require('faker');
var factory;

function _transform(event) {
  var model = event.model;
  var percentages = [];
  var total;

  if (!Array.isArray(model.options.percentages)) {
    throw new Error('plugin:biased Percentages must be an array');
  }

  total = model.options.percentages.reduce(function (a, b, idx) {
    percentages[idx] = a + b;

    return a + b;
  }, 0);

  if (total !== 100) {
    throw new Error('plugin:biased The sum of percentages must equal 100');
  }

  model.method = function() {
    var percentage = faker.random.number(100);
    var index;

    percentages.some(function findIndex (percent, idx) {
      if (percentage <= percent) {
        index = idx;
      }

      return index >= 0;
    });

    return model.options.data[index]
  };
}

function transform(event) {
  var model = event.model;

  if (_.isString(model.method) && model.method === 'random.biased') {
    _transform(event);
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
