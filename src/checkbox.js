'use strict';

var Field = require('./field');

module.exports = Checkbox;

function Checkbox (name, initialValue, config, parentContext) {
  if (!(this instanceof Checkbox)) return new Checkbox(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? true : !!initialValue;

  Field.call(this, name, initialValue, config, parentContext);

  this.type = 'checkbox'
}
