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
var FixtureFactory = require('../index.js');
var faker = require('faker');

var dataModel = {
  someField: 'name.firstName'
};

var fixtureFactory;

describe('Fixture Factory', function () {

  beforeEach(function () {
    fixtureFactory = new FixtureFactory(dataModel);
  });

  it('should generate single fixture based on provided dataModel', function () {
    var fixture = fixtureFactory.generateSingle();
    expect(fixture.someField).to.exist;
  });

  it('should generate multiple fixtures based on provided dataModel', function () {
    var fixtures = fixtureFactory.generate(10);
    expect(fixtures.length).to.equal(10);
    fixtures.should.all.have.property('someField');
  });

  it('should delegate field generation to faker.js', function () {
    var spy = sinon.spy(faker.name, 'firstName');
    fixtureFactory.generateSingle();
    fixtureFactory.generate(10);
    expect(spy).to.have.callCount(11);
  });

  it('should overwrite field with provided values if present', function () {
    var fixture = fixtureFactory.generateSingle({ someField: 'other value' });
    var fixtures = fixtureFactory.generate(10, { someField: 'other value' });
    expect(fixture.someField).to.equal('other value');
    fixtures.should.all.have.property('someField', 'other value');
  });

  it('should add field with provided values if not present', function () {
    var fixture = fixtureFactory.generateSingle({ otherField: 'other value' });
    var fixtures = fixtureFactory.generate(10, { otherField: 'other value' });
    expect(fixture.otherField).to.exist;
    expect(fixture.someField).to.exist;
    fixtures.should.all.have.property('someField');
    fixtures.should.all.have.property('otherField');
  });

});
