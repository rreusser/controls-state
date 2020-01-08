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
  var min = config.min === undefined ? defaultMin : config.min;
  var max = config.max === undefined ? defaultMax : config.max;
  var step = config.step === undefined ? defaultStep : config.step;

  var mapping = typeof config.mapping !== 'function' ? identity : config.mapping;
  var inverseMapping = typeof config.inverseMapping !== 'function' ? identity : config.inverseMapping;

  this.type = 'slider';
  this.min = min;
  this.max = max;
  this.step = step;

  var field = this;
  var fieldGetter = Object.getOwnPropertyDescriptor(field, 'value').get;
  var fieldSetter = Object.getOwnPropertyDescriptor(field, 'value').set;

  Object.defineProperties(this, {
    'valueForSlider': {
      get:  function () {
        return inverseMapping(fieldGetter.call(field));
      },
      set: function (newValue) {
        return fieldSetter.call(field, mapping(newValue));
      },
    },
  })
}

Slider.prototype = Object.create(Field.prototype);
