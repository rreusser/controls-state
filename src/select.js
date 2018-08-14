'use strict';

var Field = require('./field');

module.exports = Select;

function Select (name, initialValue, config, parentField, parentContext) {
  if (!(this instanceof Select)) return new Select(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? null : initialValue;

  Field.call(this, name, initialValue, parentField, parentContext);

  this.options = config.options;

  this.type = 'select';
}

Select.prototype = Object.create(Field.prototype);
