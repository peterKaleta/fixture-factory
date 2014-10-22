# fixture-factory

You can use this factory to create massive amounts of predefined fixtures based on [faker.js](https://github.com/marak/Faker.js/) methods.

## Installation
```npm install fixture-factory --save-dev```

## Usage

Given

```
var FixtureFactory = require('fixture-factory');

var userDataModel = {
  firstName: 'name.firstName',
  lastName: 'name.lastName',
};

var factory = new FixtureFactory(userDataModel);
```

### Generate single fixture

```
factory.generateSingle();
```

will return

```
{
 firstName: <generated first name>,
 lastName: <generated last name>
}
```

### Generate multiple fixtures
```
factory.generate(10);
```
will return

```
[{
  firstName: <generated first name>,
  lastName: <generated last name>
}, ... 9 more
]
```

### Generate single/multiple with extra fields

```
factory.generateSingle({
    type: 'admin',
    firstName: 'Daniel'
  });
```

will return

```
{
 firstName: 'Daniel',
 lastName: <generated last name>,
 type: 'admin'
}
```

### Values in dataModel

#### fixed field values

If defined method won't be found in  [faker.js](https://github.com/marak/Faker.js/) it will be treated as simple string to be used as field value

```
var FixtureFactory = require('fixture-factory');

var userDataModel = {
  staticField: 'someValue'
};

var factory = new FixtureFactory(userDataModel);
factory.generateSingle();
```
returns
```
{
 staticField: 'someValue'
}
```

#### passing options to  [faker.js](https://github.com/marak/Faker.js/) methods

if given method requires additional parameters you can pass it by adding `options` parameter

```
var FixtureFactory = require('fixture-factory');

var userDataModel = {
  age: {
    method: 'random.number',
    options: {
      min: 18,
      max: 90
    }
  }
};

var factory = new FixtureFactory(userDataModel);
factory.generateSingle();
```
returns
```
{
 age: <number between 18 and 90>
}
```


## TO DO
- add support for nested models
- add support for defining own generators
