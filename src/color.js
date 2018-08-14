'use strict';

var Field = require('./field');

module.exports = Color;

function Color (name, initialValue, config, parentField, parentContext) {
  if (!(this instanceof Color)) return new Color(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? '#ffffff' : initialValue;

  Field.call(this, name, initialValue, parentField, parentContext);

  this.type = 'color';
}

Color.prototype = Object.create(Field.prototype);
