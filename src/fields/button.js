'use strict';

var Field = require('../field');

module.exports = Button;

function Button (name, htmlContent, config, parentField) {
  if (!(this instanceof Button)) return new Button(name, htmlContent, config, parentField);

  Field.call(this, name, htmlContent, parentField, config);

  this.type = 'button';
}

Button.prototype = Object.create(Field.prototype);
