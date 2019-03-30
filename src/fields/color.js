'use strict';

var Field = require('../field');

module.exports = Color;

function Color (name, initialValue, config, parentField) {
  if (!(this instanceof Color)) return new Color(name, initialValue, config);

  initialValue = initialValue === undefined ? '#ffffff' : initialValue;

  Field.call(this, name, initialValue, parentField, config);

  this.type = 'color';
}

Color.prototype = Object.create(Field.prototype);
