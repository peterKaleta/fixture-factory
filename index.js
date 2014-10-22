'use strict';

var faker = require('faker');
var _ = require('lodash');

function FixtureFactory (dataModel) {
  this.dataModel = dataModel;
}

FixtureFactory.prototype = {

  generateSingle: function (properties) {
    var fixture = _.clone(properties) || {};
    var self = this;
    var callStack;
    var nestedFakerMethod;
    var nextMethod;
    var isMethod;
    var fieldDataModel;

    _.each(Object.keys(self.dataModel), function (key) {
      if (!fixture[key]) {

        fieldDataModel = self.dataModel[key];

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
  },

  generate: function (count, properties) {
    var fixtures = [];
    while (fixtures.length < count) {
      fixtures.push(this.generateSingle(properties));
    }
    return fixtures;
  }

};

module.exports = FixtureFactory;
