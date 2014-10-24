'use strict';

var faker = require('faker');
var _ = require('lodash');

function FixtureFactory () {
  this.dataModels = {};
}

var _getFieldModel = function (method) {
  return !_.isFunction(method) && _.isObject(method) ? method : { method: method };
};

var _handleFunction = function (model, fixture, dataModel) {
  return model.method.call(
    null,
    fixture,
    model.options || {},
    dataModel,
    faker
  );
};

var _handleString = function (model) {
  var callStack = model.method.split('.');
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

  return isMethod ? nestedFakerMethod( model.options || { }) : model.method;
};

var _generateField = function (key, method, fixture, dataModel) {

  var model = _getFieldModel(method);

  return _.isFunction(model.method) ? _handleFunction(model, fixture, dataModel) :
                                      _handleString(model);
};

var _generateFixture = function (context, properties) {

  properties = properties || {};

  var dataModel = _.isObject(context) ? context : this.dataModels[context] || {};
  var fixture = {};

  var collection = _.extend({}, dataModel, properties);
  var fns = {};

  _.each(collection, function (value, key) {
    value = properties[key] ? properties[key] : value;

    var options;
    if (!_.isFunction(value) && !_.isFunction(value.method)) {
      options = dataModel[key] ? dataModel[key].options || {} : {};
      fixture[key] = _generateField(key, value);
    } else {
      fns[key] = value;
    }
  });

  _.each(fns, function (value, key) {
    fixture[key] = _generateField(key, value, fixture, dataModel);
  });

  return fixture;

};

FixtureFactory.prototype = {

  noConflict: function () {
    return new FixtureFactory();
  },

  register: function (key, dataModel) {
    var models = key;
    var _this = this;

    if (typeof models === 'string') {
      models = {};
      models[key] = dataModel;
    }

    Object.keys(models).forEach(function (key) {
      _this.dataModels[key] = models[key];
    });

    return this;
  },

  unregister: function (key) {
    if (key) {
      delete this.dataModels[key];
    } else {
      this.dataModels = {};
    }

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
