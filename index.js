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

  return isMethod ? nestedFakerMethod(_.cloneDeep(model.options || { })) : model.method;
};

var _generateField = function (key, method, fixture, dataModel, generatedFixtures) {

  var model = _getFieldModel(method);
  if (model.nest) {
    return model.nest;
  }

  var field;
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

  // If the current field is unique, make sure
  // that it is not duplicated
  if (model.unique === true) {

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

  var dataModel = _.isObject(context) ? context : this.dataModels[context] || {};
  var fixture = {};

  var collection = _.extend({}, dataModel, properties);

  // The ability to make multiple fields unique together
  // (think combined primary keys)
  var uniqueFields;
  if (collection._unique != null) {
    uniqueFields = collection._unique;
    delete collection._unique;
  }

  var fns = {};

  _.each(collection, function (value, key) {
    value = properties[key] ? properties[key] : value;

    if (!_.isFunction(value) && !_.isFunction(value.method)) {
      fixture[key] = _generateField(key, value, undefined, undefined, generatedFixtures);
    } else {
      fns[key] = value;
    }
  });

  _.each(fns, function (value, key) {
    fixture[key] = _generateField(key, value, fixture, dataModel, generatedFixtures);
  });

  if (uniqueFields) {
    var nonUniqueFixtures = _.reduce(uniqueFields, function (fixturesLeft, field) {
      return _.filter(fixturesLeft, function (generatedFixture) {
        return generatedFixture[field] === fixture[field];
      });
    }, generatedFixtures);

    if (nonUniqueFixtures.length > 0) {
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

    if (_.isObject(count)) {
      properties = count;
      count = 1;
    }

    while (fixtures.length < count) {
      fixtures.push(_generateFixture.call(this, context, properties, fixtures));
    }

    return fixtures;
  }
};

module.exports = new FixtureFactory();
