'use strict';

var Field = require('./field');

module.exports = TextInput;

function TextInput (name, initialValue, config, parentContext) {
  if (!(this instanceof TextInput)) return new TextInput(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? '' : initialValue;

  Field.call(this, name, initialValue, parentContext);

  this.type = 'textinput';
}

TextInput.prototype = Object.create(Field.prototype);
