'use strict';

var Field = require('./field');

module.exports = TextInput;

function TextInput (name, initialValue, config, parentField) {
  if (!(this instanceof TextInput)) return new TextInput(name, initialValue, config, parentField);

  initialValue = initialValue === undefined ? '' : initialValue;

  Field.call(this, name, initialValue, parentField, config);

  this.type = 'textinput';
}

TextInput.prototype = Object.create(Field.prototype);
