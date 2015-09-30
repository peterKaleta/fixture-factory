# fixture-factory

Generate massive amounts of fixtures based on predefined model using [faker.js](https://github.com/marak/Faker.js/) methods.

## Installation
```console
$ npm install fixture-factory --save-dev
```

## Usage

### Register your model

```js
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  firstName: 'name.firstName',
  lastName: 'name.lastName',
};

fixtureFactory.register('user', userDataModel);
```

### Generate single fixture

```js
fixtureFactory.generateOne('user');
```

Expected Output

```js
{
 firstName: <generated first name>,
 lastName: <generated last name>
}
```

### Generate multiple fixtures
```js
fixtureFactory.generate('user', 10);
```
Expected Output

```js
[
  {
    firstName: <generated first name>,
    lastName: <generated last name>
  }, ... 9 more
]
```

### Generate nested objects

```js
fixtureFactory.register('user', {
    type: 'admin',
    firstName: 'Daniel',
    role: {
        id: 'random.uuid',
        name: 'internet.userName'
    }
  });

fixtureFactory.generateOne('user');
```

Expected Output

```js
{ 
  type: 'admin',
  firstName: 'Daniel',
  role:
  {
     id: '15751f0a-569d-4789-89cc-8f7c8405f007',
     name: 'German_Glover10'
  }
}
```

### Generate array of nested objects

```js
fixtureFactory.register('user', {
    type: 'admin',
    firstName: 'Daniel',
    roles: [{
        id: 'random.uuid',
        name: 'internet.userName'
    }, 10]
  });

fixtureFactory.generateOne('user');
```

Expected Output

```js
{ 
  type: 'admin',
  firstName: 'Daniel',
  roles:
  [
     {
       id: '1b8df9da-3f1a-4f9b-ab96-1de8cc4844c5',
       name: 'Dawn_Dooley30'
     },
     ... 9 more
  ]
}

```

### Generate with extra fields

```js
fixtureFactory.generate('user',1 ,{
    type: 'admin',
    firstName: 'Daniel'
  });
```

Expected Output

```js
{
 firstName: 'Daniel',
 lastName: <generated last name>,
 type: 'admin'
}
```

### Generate without registered model

```js
fixtureFactory.generateOne({
  email: 'internet.email'
  });
```
Expected Output

```js
{
 email: <generated email>
}
```

### Get your own instance
In case you want to have multiple instances of factory you can call `noConflict`.

```js
var fixtureFactory = require('fixture-factory');
var secondFixtureFactory = fixtureFactory.noConflict();

```

### Values in dataModel

#### fixed field values

If defined method won't be found in  [faker.js](https://github.com/marak/Faker.js/) it will be treated as simple string to be used as field value

```js
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  staticField: 'someValue'
};

fixtureFactory.register('user', userDataModel);
fixtureFactory.generateOne('user');
```
Expected Output
```js
{
 staticField: 'someValue'
}
```

#### functions

You may define a function in the data model which will be processed after all other fixtures have been generated

```js
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
Expected Output
```js
{
 staticField: '<generated name>@acme.com'
}
```

#### passing options to  [faker.js](https://github.com/marak/Faker.js/) methods

if given method requires additional parameters you can pass it by adding `args` property

```js
var fixtureFactory = require('fixture-factory');

var userDataModel = {
  age: {
    method: 'random.number',
    args: [
      {
        min: 18,
        max: 90
      }
    ]
  }
};

fixtureFactory.register('user', userDataModel);
fixtureFactory.generateOne();
```
Expected Output
```js
{
 age: <number between 18 and 90>
}
```


#### passing parser method

you can pass parser method to change modify value of acquired fixture field

```js
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
Expected Output
```js
{
 firstName: 'sir <some generated name>'
}
```

## Reference Plugin

The Reference plugin is an example extension of the fixture factory that allows
embeding other models into your definition. It is enabled by default.

#### Embed another model in your fixture

```js
fixtureFactory.register('user',{
  type: 'admin',
  firstName: 'Daniel'
});

fixtureFactory.register('role',{
  id: 'random.uuid',
  name: 'internet.userName'
});

fixtureFactory.generateOne('user', {
  role: 'model.role'  
});
```

Expected Output

```js
{
  type: 'admin',
  firstName: 'Daniel',
  role:
  {
     id: '15751f0a-569d-4789-89cc-8f7c8405f007',
     name: 'German_Glover10'
  }
}

```

#### Embed another model in your fixture and provide properties

```js
fixtureFactory.register('user',{
  type: 'admin',
  firstName: 'Daniel'
});

fixtureFactory.register('role',{
  id: 'random.uuid',
  name: 'internet.userName'
});

fixtureFactory.generateOne('user', {
  role: {
    method: 'model.role',
    reference: {
      properties: {
        active: true
      }
    }
  }
});
```

Expected Output

```js
{
  type: 'admin',
  firstName: 'Daniel',
  role:
  {
    id: '8b23b7f8-c14b-4231-a768-5ecc407a5821',
    name: 'Dianna36',
    active: true
  }
}

```

#### Embed another model field in your fixture

```js
fixtureFactory.register('user',{
  type: 'admin',
  firstName: 'Daniel'
});

fixtureFactory.register('role',{
  id: 'random.uuid',
  name: 'internet.userName'
});

fixtureFactory.generateOne('user', {
  roleId: 'model.role.id'  
});
```

Expected Output

```js
{
  type: 'admin',
  firstName: 'Daniel',
  roleId: '17b6ec69-606d-4e97-b2c5-4eb9b3507e32'
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
