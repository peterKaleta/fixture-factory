import {extend, isString} from 'lodash';

export default class ReferencePlugin {

  constructor(fixtureFactory) {
    this.fixtureFactory = fixtureFactory;
    this.enable();
  }

  //internals, stuff

  transform(model, split) {

    const {dataModels: models} = this.fixtureFactory;

    model.method = models[split[1]];

    if (split.length === 2) {
      if (model.reference && model.reference.properties) {
        model.method = extend(
          model.method,
          model.reference.properties
        );
      }
    } else {
      model.method = models[split[1]][split[2]];
    }

    return model;
  }

  //api

  fixtureFactoryWillGenerateField(event) {

    let {model} = event;
    var isRef = isString(model.method) && model.method.indexOf('model') === 0;
    var split;

    if (isRef) {
      split = model.method.split('.');
      if (split[0] === 'model') {
        model = this._transform(model, split);
      }
    }

  }

  enable() {
    this.fixtureFactory.on('field:pre', this.fixtureFactoryWillGenerateField);
  }

  disable() {
    this.fixtureFactory.removeListener('field:pre', this.fixtureFactoryWillGenerateField);
  }

}
