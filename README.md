# fixture-factory

Generate massive amounts of fixtures based on predefined model using [faker.js](https://github.com/marak/Faker.js/) methods.

## Installation
```npm install fixture-factory --save-dev```

## Usage

### Register your model

```
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  firstName: 'name.firstName',
  lastName: 'name.lastName',
};

fixtureFactory('user', userDataModel);
```

### Generate single fixture

```
fixtureFactory.generateOne('user');
```

will generate

```
{
 firstName: <generated first name>,
 lastName: <generated last name>
}
```

### Generate multiple fixtures
```
fixtureFactory.generate('user', 10);
```
will generate

```
[{
  firstName: <generated first name>,
  lastName: <generated last name>
}, ... 9 more
]
```

### Generate with extra fields

```
fixtureFactory.generate('user',1 ,{
    type: 'admin',
    firstName: 'Daniel'
  });
```

will generate

```
{
 firstName: 'Daniel',
 lastName: <generated last name>,
 type: 'admin'
}
```

### Generate without registered model

```
fixtureFactory.generateOne({
  email: 'internet.email'
  });
```
will generate

```
{
 email: <generated email>
}
```

### Get your own instance
In case you want to have multiple instances of factory you can call `noConflict`.

```
var fixtureFactory = require('fixture-factory');
var secondFixtureFactory = fixtureFactory.noConflict();

```

### Values in dataModel

#### fixed field values

If defined method won't be found in  [faker.js](https://github.com/marak/Faker.js/) it will be treated as simple string to be used as field value

```
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  staticField: 'someValue'
};

fixtureFactory.register('user', userDataModel);
fixtureFactory.generateOne('user');
```
will generate
```
{
 staticField: 'someValue'
}
```

#### functions

You may define a function in the data model which will be processed after all other fixtures have been generated

```
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  name: 'name.firstName',
  email: function(fixtures) {
    return fixtures.name + '@acme.com';
  }
};

fixtureFactory.register('user', userDataModel);
fixtureFactory.generateOne('user');
```
will generate
```
{
 staticField: '<generated name>@acme.com'
}
```

#### passing options to  [faker.js](https://github.com/marak/Faker.js/) methods

if given method requires additional parameters you can pass it by adding `options` parameter

```
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  age: {
    method: 'random.number',
    options: {
      min: 18,
      max: 90
    }
  }
};

fixtureFactory.register('user', userDataModel);
fixtureFactory.generateOne();
```
will generate
```
{
 age: <number between 18 and 90>
}
```


#### passing parser method

you can pass parser method to change modify value of acquired fixture field

```
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  firstName : 'name.firstName'
};

fixtureFactory.register('user', userDataModel);

fixtureFactory.generateOne('user', {
  firstName: function (fixtures, options, dataModel, faker) {
    return 'sir '+ faker.name.firstName();
  }
});

```
will generate
```
{
 firstName: 'sir <some generated name>'
}
```





## TO DO
- add support for defining own generators

##LICENSE

The MIT License (MIT)

Copyright (c) 2014 Peter Kaleta

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
