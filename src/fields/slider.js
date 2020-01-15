'use strict';

var Field = require('../field');

module.exports = Slider;

function identity(x) {
  return x
}

function Slider (name, initialValue, config, parentField) {
  if (!(this instanceof Slider)) return new Slider(name, initialValue, config, parentField);

  initialValue = initialValue === undefined ? 0 : initialValue;
  config = config || {};

  Field.call(this, name, initialValue, parentField, config);

  var isValueBetween0and1 = 0 <= initialValue && initialValue <= 1;
  var defaultMin = isValueBetween0and1 ? 0 : Math.min(initialValue * 2, 0);
  var defaultMax = isValueBetween0and1 ? 1 : Math.max(initialValue * 2, 1);
  var defaultStep = isValueBetween0and1 ? 0.01 : 1;
  this.min = config.min === undefined ? defaultMin : config.min;
  this.max = config.max === undefined ? defaultMax : config.max;
  this.mapping = typeof config.mapping !== 'function' ? identity : config.mapping;
  this.inverseMapping = typeof config.inverseMapping !== 'function' ? identity : config.inverseMapping;

  this.steps = 10
  if (config.steps !== undefined) {
    this.steps = config.steps
  } else if (config.step !== undefined) {
    this.steps = Math.round((this.max - this.min) / config.step)
  }

  this.type = 'slider';
}

Slider.prototype = Object.create(Field.prototype);
