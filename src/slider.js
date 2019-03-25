'use strict';

var Field = require('./field');

module.exports = Slider;

function Slider (name, initialValue, config, parentField) {
  if (!(this instanceof Slider)) return new Slider(name, initialValue, config, parentField);

  initialValue = initialValue === undefined ? 0 : initialValue;
  config = config || {};

  Field.call(this, name, initialValue, parentField, config);

  var min = config.min === undefined ? Math.min(initialValue, 0) : config.min;
  var max = config.max === undefined ? Math.max(initialValue, 1) : config.max;
  var step = config.step === undefined ? 1 : config.step;

  this.type = 'slider';
  this.min = min;
  this.max = max;
  this.step = step;
}

Slider.prototype = Object.create(Field.prototype);
