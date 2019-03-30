'use strict';

var Field = require('../field');

module.exports = Raw;

function Raw (name, htmlContent, config, parentField) {
  if (!(this instanceof Raw)) return new Raw(name, htmlContent, config, parentField);

  Field.call(this, name, htmlContent, parentField, config);

  this.type = 'raw';
}

Raw.prototype = Object.create(Field.prototype);
