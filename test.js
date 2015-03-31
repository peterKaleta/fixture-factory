var fixtureFactory = require('./');
var plugin = require('./plugins/random-biased');
plugin.enable(fixtureFactory);

var fixtures = fixtureFactory.generate({
  prop: {
    method: 'random.biased',
    options: {
      data: ['null', 'random.number'],
      percentages: [10, 90]
    }
  }
}, 100);

console.log(fixtures, fixtures.length);
