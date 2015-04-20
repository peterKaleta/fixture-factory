'use strict';

var faker = require('faker');
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var referencePlugin = require('./plugins/reference');

var instance;

function FixtureFactory () {
  this.dataModels = {};
  EventEmitter.call(this);
  referencePlugin.enable(this);
}

util.inherits(FixtureFactory, EventEmitter);

FixtureFactory.prototype._getFieldModel = function (method) {
  var transform = !_.isFunction(method) && _.isObject(method) && method.method;
  return transform ? method : { method: method };
};

FixtureFactory.prototype._handleFunction = function (model, fixture, dataModel) {
  return model.method.call(
    null,
    fixture,
    model.options || {},
    dataModel,
    faker
  );
};

FixtureFactory.prototype._handleString = function (model) {
  var callStack = model.method.split('.');
  var nestedFakerMethod = faker;
  var isMethod = true;
  var args = model.args || [];
  var options = model.options ? _.cloneDeep(model.options) : void 0;
  var nextMethod;

  if (options) {
    console.warn('Passing arguments to faker using the "options" property has been depreciated.')
    console.warn('Please use "args" property instead.')
    args.push(options);
  }

  while (callStack.length) {
    nextMethod = callStack.shift();
    if (nestedFakerMethod[nextMethod]) {
      nestedFakerMethod = nestedFakerMethod[nextMethod];
    } else {
      isMethod = false;
      break;
    }
  }

  console.log(args);

  return isMethod ? nestedFakerMethod.apply(nestedFakerMethod, args) : model.method;
};

FixtureFactory.prototype._generateField = function (
  key, method, fixture, dataModel, generatedFixtures
) {
  var fieldModel = this._getFieldModel(method);
  var count = 1;
  var field;

  this.emit('field:pre', {
    name: key,
    model: fieldModel
  });

  switch (typeof fieldModel.method) {
    case 'function':
      field = this._handleFunction(fieldModel, fixture, dataModel);
      break;

    case 'string':
      field = this._handleString(fieldModel);
      break;

    case 'number':
    case 'boolean':
      field = fieldModel.method;
      break;

    // method is an object so just return it
    default :
      if (_.isArray(fieldModel.method)) {
        count = fieldModel.method[1] || 1;
      } else {
        fieldModel.method = [fieldModel.method];
      }

      field = this.generate.apply(this, fieldModel.method);

      if (count === 1) {
        field = field[0];
      }
  }

  this.emit('field', {
    name: key,
    value: field,
    model: fieldModel
  });

  return field;
};

FixtureFactory.prototype._generateFixture = function (context, properties, generatedFixtures) {
  // check if raw model definition was passed or should we fetch it from the registered ones
  var dataModel = _.isObject(context) ? context : this.dataModels[context] || {};
  var name = _.isObject(context) ? void 0 : context;
  var fixture = {};
  var fieldGenerators = {};
  var self = this;

  properties = properties || {};

  // if user passed additional properties extend the dataModel with them
  dataModel = _.extend({}, dataModel, properties);

  this.emit('fixture:pre', {
    model: dataModel,
    name: name,
    properties: properties,
    generated: generatedFixtures
  });

  _.each(dataModel, function (value, key) {

    value = properties[key] ? properties[key] : value;

    // if field has a generator function assigned to it, cache it for later
    if (!_.isFunction(value) && !_.isFunction(value.method)) {
      fixture[key] = self._generateField(key, value, fixture, dataModel, generatedFixtures);
    } else {
      fieldGenerators[key] = value;
    }
  });

  _.each(fieldGenerators, function (fieldGenerator, key) {
    fixture[key] = self._generateField(
      key,
      fieldGenerator,
      fixture,
      dataModel,
      generatedFixtures
    );
  });

  this.emit('fixture', {
    fixture: fixture,
    name: name,
    properties: properties,
    generated: generatedFixtures
  });

  return fixture;
};

FixtureFactory.prototype.noConflict = function () {
  return new FixtureFactory();
};

FixtureFactory.prototype.getGenerator = function (key) {
  var self = this;

  return {
    generate: function () {
      self.generate.apply(self, _.union([key], arguments));
    },
    generateOne: function () {
      self.generateOne.apply(self, _.union([key], arguments));
    }
  };
};

FixtureFactory.prototype.register = function (key, dataModel) {
  var models = {};
  var isString = typeof key === 'string';

  if (isString) {
    models[key] = dataModel;
  }  else {
    models = key;
  }

  _.extend(this.dataModels, models);

  this.emit('registered', models);

  return this;
};

FixtureFactory.prototype.reset = function () {
  this.unregister();
};

FixtureFactory.prototype.unregister = function (key) {
  if (key) {
    delete this.dataModels[key];
    this.emit('unregistered', [key]);
  } else {
    this.emit('unregistered', Object.keys(this.dataModels));
    this.dataModels = {};
  }

  return this;
};

FixtureFactory.prototype.generateOne = function (context, properties) {
  var fixture = this.generate(context, 1, properties)[0];

  return fixture;
};

FixtureFactory.prototype.generate = function (context, count, properties) {
  var fixtures = [];

  count = count || 1;

  if (_.isObject(count)) {
    properties = count;
    count = 1;
  }

  while (fixtures.length < count) {
    fixtures.push(this._generateFixture(context, properties, fixtures));
  }

  return fixtures;
};

instance = new FixtureFactory();

module.exports = instance;
