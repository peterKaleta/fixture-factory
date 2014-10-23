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

  it('should generate single fixture based on stored dataModel', function () {
    var fixture = fixtureFactory.generateSingle('exampleModel');
    expect(fixture.someField).to.exist;
  });

  it('should generate multiple fixtures based on provided dataModel', function () {
    var fixtures = fixtureFactory.generate('exampleModel', 10);
    expect(fixtures.length).to.equal(10);
    fixtures.should.all.have.property('someField');
  });

  it('should delegate field generation to faker.js', function () {
    var spy = sinon.spy(faker.name, 'firstName');
    fixtureFactory.generateSingle('exampleModel');
    fixtureFactory.generate('exampleModel', 10);
    expect(spy).to.have.callCount(11);
  });

  it('should overwrite field with provided values if present', function () {
    var fixture = fixtureFactory.generateSingle('exampleModel', { someField: 'other value' });
    var fixtures = fixtureFactory.generate('exampleModel', 10, { someField: 'other value' });
    expect(fixture.someField).to.equal('other value');
    fixtures.should.all.have.property('someField', 'other value');
  });

  it('should add field with provided values if not present', function () {
    var fixture = fixtureFactory.generateSingle('exampleModel', { otherField: 'other value' });
    var fixtures = fixtureFactory.generate('exampleModel', 10, { otherField: 'other value' });
    expect(fixture.otherField).to.exist;
    expect(fixture.someField).to.exist;
    fixtures.should.all.have.property('someField');
    fixtures.should.all.have.property('otherField');
  });

  it('in case object is passed as context it shoold be used as model for generation', function () {
    var fixture = fixtureFactory.generateSingle({ lastName: 'name.lastName' });
    expect(fixture.lastName).to.exist;
  });

});
