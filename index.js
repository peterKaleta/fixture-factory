'use strict';

var faker = require('faker');
var _ = require('lodash');

function FixtureFactory () {
  this.dataModels = {};
}

// private methods
var _generateFixture = function (context, properties) {

  var dataModel = _.isObject(context) ? context : this.dataModels[context] || {};
  var fixture = _.clone(properties || {});
  var callStack;
  var nestedFakerMethod;
  var nextMethod;
  var isMethod;
  var fieldDataModel;
  _.each(Object.keys(dataModel), function (key) {
    if (!fixture[key]) {
      fieldDataModel = dataModel[key];

      if (!_.isObject(fieldDataModel)) {
        fieldDataModel = {
          method: fieldDataModel,
          options: fieldDataModel.options || {}
        };
      }
      callStack = fieldDataModel.method.split('.');
      nestedFakerMethod = faker;
      isMethod = true;
      while (callStack.length) {
        nextMethod = callStack.shift();
        if (nestedFakerMethod[nextMethod]) {
          nestedFakerMethod = nestedFakerMethod[nextMethod];
        } else {
          isMethod = false;
          break;
        }
      }
      fixture[key] = isMethod ?
                      nestedFakerMethod(fieldDataModel.options) :
                      fieldDataModel.method;

    }

  });
  return fixture;
};

FixtureFactory.prototype = {
  noConflict: function () {
    return new FixtureFactory();
  },

  register: function (key, dataModel) {
    this.dataModels[key] = dataModel;
  },

  generate: function (context, count, properties) {
    count = count || 1;
    var fixtures = [];
    while (fixtures.length < count) {
      fixtures.push(_generateFixture.call(this, context, properties));
    }
    return fixtures;
  }

};

module.exports = new FixtureFactory();
