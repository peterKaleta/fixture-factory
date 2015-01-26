'use strict';

var faker = require('faker');
var _ = require('lodash');

var instance;

function FixtureFactory () {
  this.dataModels = {};
  this.createdModels = {};
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

  return isMethod ? nestedFakerMethod(_.cloneDeep(model.options || { })) : model.method;
};

var _generateField = function (key, method, fixture, dataModel, generatedFixtures) {

  var fieldModel = _getFieldModel(method);
  var field;

  // if the field has a nested object - return it
  if (fieldModel.nest) {
    return fieldModel.nest;
  }

  if (fieldModel.reference) {

    var split = fieldModel.reference.split('.');
    var referencedModelName = split[0];
    var referencedFieldName = split[1];

    // check if model of given name was already generated
    if (!instance.createdModels[referencedModelName]) {
      throw new Error('Requested model "' + referencedModelName + '" has not yet been created');
    }

    // randomly pick and return one of values of referenced field from all referenced models
    var possibleValues = _.pluck(instance.createdModels[referencedModelName], referencedFieldName);
    var index = _.random(0, possibleValues.length - 1);

    return possibleValues[index];

  }

  switch (typeof fieldModel.method) {

    case 'function':
      field = _handleFunction(fieldModel, fixture, dataModel);
      break;

    case 'string':
      field = _handleString(fieldModel);
      break;

    // method is an object so just return it
    default :
      field = fieldModel.method;
  }

  // If the current field is unique, make sure
  // that it is not duplicated
  if (fieldModel.unique === true) {

    // Check if current value exists in fixtures generated thus far
    if (_.some(_.pluck(generatedFixtures, key), function (existingValue) {
      return existingValue === field;
    })) {
      return _generateField.apply(null, arguments);
    }
  }

  return field;
};

var _generateFixture = function (context, properties, generatedFixtures) {

  properties = properties || {};

  // check if raw model definition was passed or should we fetch it from the registered ones
  var dataModel = _.isObject(context) ? context : this.dataModels[context] || {};
  var fixture = {};

  // if user passed additional properties extend the dataModel with them
  dataModel = _.extend({}, dataModel, properties);

  // check if we need to worry about combined unique fields later
  // combined unique as pairs of keys etc
  var uniqueFields;
  if (dataModel._combinedUnique != null) {
    uniqueFields = dataModel._combinedUnique;
    delete dataModel._combinedUnique;
  }

  var fieldGenerators = {};

  _.each(dataModel, function (value, key) {

    value = properties[key] ? properties[key] : value;

    // if field has a generator function assigned to it, cache it for later
    if (!_.isFunction(value) && !_.isFunction(value.method)) {
      fixture[key] = _generateField(key, value, fixture, dataModel, generatedFixtures);
    } else {
      fieldGenerators[key] = value;
    }

  });

  _.each(fieldGenerators, function (fieldGenerator, key) {
    fixture[key] = _generateField(key, fieldGenerator, fixture, dataModel, generatedFixtures);
  });

  if (uniqueFields) {

    // check if there are not matching sets of combined uniquer values
    var notUnique = !!_.some(generatedFixtures, function (generatedFixture) {
      return _.every(uniqueFields, function (uniqueField) {
        return generatedFixture[uniqueField] === fixture[uniqueField];
      });
    });

    // if it does generate the whole fixture again
    if (notUnique) {
      return _generateFixture.apply(this, arguments);
    }

  }

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
        self.generate.apply(self, _.union([key], arguments));
      },
      generateOne: function () {
        self.generateOne.apply(self, _.union([key], arguments));
      }
    };

  },

  register: function (key, dataModel) {

    var models;

    if (typeof key === 'string') {
      models = {};
      models[key] = dataModel;
    }  else {
      models = key;
    }

    _.extend(this.dataModels, models);

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
      fixtures.push(_generateFixture.call(this, context, properties, fixtures));
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
