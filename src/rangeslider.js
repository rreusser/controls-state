'use strict';

var Field = require('./field');

module.exports = Rangeslider;

function Rangeslider (name, initialValue, config, parentContext) {
  if (!(this instanceof Rangeslider)) return new Rangeslider(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? 0 : initialValue;
  config = config || {};

  Field.call(this, name, initialValue, config, parentContext);

  var min = config.min === undefined ? Math.min(initialValue, 0) : config.min;
  var max = config.max === undefined ? Math.max(initialValue, 1) : config.max;
  var step = config.step === undefined ? 1 : config.step;

  this.type = 'rangeslider'
  this.min = min;
  this.max = max;
  this.step = step;
}

Rangeslider.prototype = Object.create(Field.prototype);
