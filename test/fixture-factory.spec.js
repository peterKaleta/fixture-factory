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

describe('Fixture Factory', function () {
  describe('Module', function () {
    it('should have a register method', function () {
      expect(fixtureFactory.register).to.be.a('function');
    });

    it('should have a generate method', function () {
      expect(fixtureFactory.generate).to.be.a('function');
    });

    it('should have a generateOne method', function () {
      expect(fixtureFactory.generateOne).to.be.a('function');
    });

    it('should have a unregister method', function () {
      expect(fixtureFactory.unregister).to.be.a('function');
    });

    it('should have a getGenerator method', function () {
      expect(fixtureFactory.getGenerator).to.be.a('function');
    });

    it('should register a return itself on register', function () {
      expect(fixtureFactory.register('..', {})).to.equal(fixtureFactory);
    });

  });

  describe('unit tests', function () {
    describe('register', function () {
      it('should return fixtureFactory service', function () {
        expect(fixtureFactory.register('..', {})).to.equal(fixtureFactory);
        fixtureFactory.unregister();
      });

      it('should register a single data model', function () {
        fixtureFactory.register('test', {});

        expect(fixtureFactory.dataModels.test).to.be.a('object');

        fixtureFactory.unregister();
      });

      it('should register multiple data models via object', function () {
        fixtureFactory.register({
          one: {},
          two: {}
        });

        expect(fixtureFactory.dataModels.one).to.be.a('object');
        expect(fixtureFactory.dataModels.two).to.be.a('object');

        fixtureFactory.unregister();
      });
    });

    describe('unregister', function () {
      it('should return fixtureFactory service', function () {
        expect(fixtureFactory.unregister()).to.equal(fixtureFactory);
      });

      it('should unregister a single data model', function () {
        fixtureFactory.register('test', {});
        fixtureFactory.register('test2', {});

        expect(fixtureFactory.dataModels.test).to.be.a('object');

        fixtureFactory.unregister('test');

        expect(fixtureFactory.dataModels).to.not.be.empty;

        expect(fixtureFactory.dataModels.test2).to.be.a('object');
      });

      it('should unregister all data models if called with no arguments', function () {
        fixtureFactory.register({
          one: {},
          two: {}
        });

        expect(fixtureFactory.dataModels.one).to.be.a('object');
        expect(fixtureFactory.dataModels.two).to.be.a('object');
        expect(fixtureFactory.dataModels).to.not.be.empty;

        fixtureFactory.unregister();

        expect(fixtureFactory.dataModels).to.be.empty;
      });
    });

    describe('getGenerator', function () {
      it('should return object with delegated generate and generateOne functions', function () {
        fixtureFactory.register('testModel', {});
        var testModelGenerator = fixtureFactory.getGenerator('testModel');
        expect(testModelGenerator.generate).to.be.a('function');
        expect(testModelGenerator.generateOne).to.be.a('function');
      });
      it('should return object that delegates to factory method using set key', function () {
        fixtureFactory.register('testModel', {});
        var testModelGenerator = fixtureFactory.getGenerator('testModel');

        sinon.spy(fixtureFactory, 'generate');
        sinon.spy(fixtureFactory, 'generateOne');
        testModelGenerator.generate();
        testModelGenerator.generateOne();
        expect(fixtureFactory.generate).to.have.been.calledWith('testModel');
        expect(fixtureFactory.generateOne).to.have.been.calledWith('testModel');

      });

    });

    describe('reset', function () {
      it('should delegate to unregister', function () {
        sinon.spy(fixtureFactory, 'unregister');
        fixtureFactory.reset();
        expect(fixtureFactory.unregister).to.have.been.called;
      });
    });
  });

  describe('integration tests', function () {
    before(function () {
      var dataModel = {
        someField: 'name.firstName'
      };

      var dataModelWithFn = {
        someField: function () {
          return 'mam';
        }
      };

      fixtureFactory.register('exampleModel', dataModel);
      fixtureFactory.register('exampleModelWithFn', dataModelWithFn);
    });

    after(function () {
      fixtureFactory.unregister();
    });

    it('should generate single fixture based on selected dataModel', function () {
      var fixture = fixtureFactory.generateOne('exampleModel');
      expect(fixture.someField).to.exist;
    });

    it('should generate single fixture based on provided dataModel object', function () {
      var fixture = fixtureFactory.generateOne({
        someField: function () {
          return 'mam';
        }
      });

      expect(fixture.someField).to.exist;
    });

    it('should generate array of fixtures based on selected dataModel', function () {
      var fixtures = fixtureFactory.generate('exampleModel', 10);
      expect(fixtures.length).to.equal(10);
      fixtures.should.all.have.property('someField');
    });

    it('should generate array of fixtures based on selected dataModel', function () {
      var fixtures = fixtureFactory.generate(
        {
          someField: function () {
            return 'mam';
          }
        },
        10
      );

      expect(fixtures.length).to.equal(10);
      fixtures.should.all.have.property('someField');
    });

    it('should default to 1 as a count when not specified for generate multiple', function () {
      var fixtures = fixtureFactory.generate('exampleModel');
      expect(fixtures.length).to.equal(1);
    });

    it('should allow to call generate without need to pass null in count', function () {
      var fixtures = fixtureFactory.generate('exampleModel', {
        someField: 'overwritenValue'
      });

      expect(fixtures[0].someField).to.equal('overwritenValue');
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

    it('should use functions in data model to process fixture output', function () {
      var fixture = fixtureFactory.generateOne('exampleModelWithFn');
      expect(fixture.someField).to.equal('mam');
    });

    it('should use functions in properties to overwrite function in data model', function () {
      var fixture = fixtureFactory.generateOne('exampleModelWithFn', {
        someField: function () {
          return 'sir';
        }
      });

      expect(fixture.someField).to.equal('sir');
    });

    it('should process static properties before functions', function () {
      var fixture = fixtureFactory.generateOne({
        fullName: function (fixture) {
          expect(fixture).to.be.a('object');
          expect(fixture.firstName).to.be.a('string');
          expect(fixture.lastName).to.be.a('string');
          return fixture.firstName + ' ' + fixture.lastName;
        },
        firstName: 'name.firstName',
        lastName: 'name.lastName'
      });

      expect(fixture.fullName).to.equal(fixture.firstName + ' ' + fixture.lastName);
    });

    it('in case object is passed as context it should be used as model for generation', function () {
      var fixture = fixtureFactory.generateOne({ lastName: 'name.lastName' });
      expect(fixture.lastName).to.exist;
    });

    it('should generate single model with nested child model', function () {
      var childModel = fixtureFactory.generateOne({
        firstName: 'name.firstName',
        lastName: 'name.lastName'
      });

      var fixture = fixtureFactory.generateOne({
        child: childModel
      });

      expect(fixture.child.firstName).to.exist;
      expect(fixture.child.lastName).to.exist;
    });
  });
});
