'use strict';

var faker = require('faker');
var _ = require('lodash');

function FixtureFactory () {
  this.dataModels = {};
}

var _getFieldModel = function (method) {
  return _.isObject(method) ? method : { method: method };
};

var _generateField = function (key, method) {

    var fieldDataModel = _getFieldModel(method);
    var callStack = fieldDataModel.method.split('.');
    var nestedFakerMethod = faker;
    var isMethod = true;
    var nextMethod;

    while (callStack.length) {
      nextMethod = callStack.shift();
      if (nestedFakerMethod[nextMethod]) {
        nestedFakerMethod = nestedFakerMethod[nextMethod];
      } else {
        isMethod = false;
        break;
      }
    }

    return isMethod ? nestedFakerMethod(fieldDataModel.options || {}) :
                      fieldDataModel.method;

  };

var _generateFixture = function (context, properties) {

  properties = properties || {};

  var dataModel = _.isObject(context) ? context : this.dataModels[context] || {};
  var fixture = {};

  _.each(dataModel, function (value, key) {
    fixture[key] = _generateField(key, value);
  });

  _.each(properties, function (fieldValue, key) {

    var options;
    if ( _.isFunction(fieldValue) ) {
      options = dataModel[key] ? dataModel[key].options || {} : {};
      fixture[key] = fieldValue.call(null, fixture[key] || {}, options, dataModel, faker);
    } else {
      fixture[key] = fieldValue;
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
    return this;
  },

  generateOne: function (context, properties) {
    return this.generate(context, 1, properties)[0];
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
