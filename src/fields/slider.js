'use strict';

var Field = require('../field');

module.exports = Slider;

function Slider (name, initialValue, config, parentField) {
  if (!(this instanceof Slider)) return new Slider(name, initialValue, config, parentField);

  initialValue = initialValue === undefined ? 0 : initialValue;
  config = config || {};

  Field.call(this, name, initialValue, parentField, config);

  var isValueBetween0and1 = 0 <= initialValue && initialValue <= 1;
  var defaultMin = isValueBetween0and1 ? 0 : Math.min(initialValue * 2, 0);
  var defaultMax = isValueBetween0and1 ? 1 : Math.max(initialValue * 2, 1);
  var min = config.min === undefined ? defaultMin : config.min;
  var max = config.max === undefined ? defaultMax : config.max;
  var step = config.step === undefined ? 1 : config.step;

  this.type = 'slider';
  this.min = min;
  this.max = max;
  this.step = step;
}

Slider.prototype = Object.create(Field.prototype);
