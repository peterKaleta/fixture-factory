# fixture-factory

Generate massive amounts of fixtures based on predefined model using [faker.js](https://github.com/marak/Faker.js/) methods.

## Installation
```npm install fixture-factory --save-dev```

## Usage

### Setup

```
var FixtureFactory = require('fixture-factory');

var userDataModel = {
  firstName: 'name.firstName',
  lastName: 'name.lastName',
};prdefined

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

##LICENSE

The MIT License (MIT)

Copyright (c) 2014 Peter Kaleta

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
