'use strict';

var Field = require('../field');

module.exports = Select;

function Select (name, initialValue, config, parentField) {
  if (!(this instanceof Select)) return new Select(name, initialValue, config, parentField);

  initialValue = initialValue === undefined ? null : initialValue;

  Field.call(this, name, initialValue, parentField, config);

  this.options = config.options;

  this.type = 'select';
}

Select.prototype = Object.create(Field.prototype);
