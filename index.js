'use strict';

var faker = require('faker');
var _ = require('lodash');

function FixtureFactory () {
  this.dataModels = {};
  this.createdModels = {};
}  

var instance;
   
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
  var field;

  if (model.reference) {
    var modelName = model.reference.split('.')[0];
    var fieldName = model.reference.split('.')[1];

    if (!instance.createdModels[modelName]) {
      throw new Error('Requested model "' + modelName + '" has not yet been created');
    }

    var possibleValues = _.pluck(instance.createdModels[modelName], fieldName);
    var index = _.random(0, possibleValues.length - 1);
    return possibleValues[index];
  }

  switch (typeof model.method) {
    case 'function':
      field = _handleFunction(model, fixture, dataModel);
      break;

    case 'string':
      field = _handleString(model);
      break;

    default :
      field = model.method;
  }

  return field;
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

  getGenerator: function (key) {
    var self = this;
    return {
      generate: function () {
        self.generate.apply(self, _.union([ key ], arguments));
      },
      generateOne: function () {
        self.generateOne.apply(self, _.union([ key ], arguments));
      }
    };
  },

  register: function (key, dataModel) {
    var models = key;
    var self = this;

    if (typeof models === 'string') {
      models = {};
      models[key] = dataModel;
    }

    Object.keys(models).forEach(function (key) {
      self.dataModels[key] = models[key];
    });

    return this;
  },

  reset: function () {
    this.unregister();
  },

  unregister: function (key) {
    if (key) {
      delete this.dataModels[key];
      delete this.createdModels[key];
    } else {
      this.dataModels = {};
      this.createdModels = {};
    }

    return this;
  },

  generateOne: function (context, properties) {
    return this.generate(context, 1, properties)[0];
  },

  generate: function (context, count, properties) {
    count = count || 1;
    var fixtures = [];

    if (_.isObject(count)) {
      properties = count;
      count = 1;
    }

    while (fixtures.length < count) {
      fixtures.push(_generateFixture.call(this, context, properties));
    }

    // Store the created models, for further use by references
    if (typeof context === 'string') {
      if (this.createdModels[context] == null) {
        this.createdModels[context] = [];
      }

      this.createdModels[context] = this.createdModels[context].concat(fixtures);
    }

    return fixtures;
  }

};

instance = new FixtureFactory();

module.exports = instance;
