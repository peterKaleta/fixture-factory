'use strict';

// setup test env
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiThings = require('chai-things');
var expect = chai.expect;
chai.use(chaiThings);
chai.use(sinonChai);
chai.should();

// load things to test
var fixtureFactory = require('../index.js');
var faker = require('faker');

var dataModel = {
  someField: 'name.firstName'
};

fixtureFactory.register('exampleModel', dataModel);

describe('Fixture Factory', function () {

  it('should generate single fixture based on selected dataModel', function () {
    var fixture = fixtureFactory.generateOne('exampleModel');
    expect(fixture.someField).to.exist;
  });

  it('should generate array of fixtures based on selected dataModel', function () {
    var fixtures = fixtureFactory.generate('exampleModel', 10);
    expect(fixtures.length).to.equal(10);
    fixtures.should.all.have.property('someField');
  });

  it('should default to 1 as a count when not specified for generate multiple', function () {
    var fixtures = fixtureFactory.generate('exampleModel');
    expect(fixtures.length).to.equal(1);
  });

  it('should delegate field generation to faker.js', function () {
    var spy = sinon.spy(faker.name, 'firstName');
    fixtureFactory.generate('exampleModel', 10);
    expect(spy).to.have.callCount(10);
  });

  it('should overwrite field with provided values if present', function () {
    var fixtures = fixtureFactory.generate('exampleModel', 10, { someField: 'other value' });
    fixtures.should.all.have.property('someField', 'other value');
  });

  it('should add field with provided values if it is not present in dataModel', function () {
    var fixtures = fixtureFactory.generate('exampleModel', 10, { otherField: 'other value' });
    fixtures.should.all.have.property('someField');
    fixtures.should.all.have.property('otherField');
  });

  it('should use passed parser functions to process fixture output', function () {
    var fixture = fixtureFactory.generateOne('exampleModel', {
      lastName: function () {
        return 'sir';
      }
    });
    expect(fixture.lastName).to.equal('sir');
  });

  it('in case object is passed as context it should be used as model for generation', function () {
    var fixture = fixtureFactory.generateOne({ lastName: 'name.lastName' });
    expect(fixture.lastName).to.exist;
  });

});
