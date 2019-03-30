'use strict';

var Field = require('../field');

module.exports = Checkbox;

function Checkbox (name, initialValue, config, parentField) {
  if (!(this instanceof Checkbox)) return new Checkbox(name, initialValue, config, parentField);

  initialValue = initialValue === undefined ? true : !!initialValue;

  Field.call(this, name, initialValue, parentField, config);

  this.type = 'checkbox';
}

Checkbox.prototype = Object.create(Field.prototype);
