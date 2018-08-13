'use strict';

module.exports = Field;

function Field (name, initialValue, config, parentContext) {
  if (/\./.test(name)) {
    throw new Error('Field names may not contain a period');
  }

  var value = initialValue;

  var context = parentContext ? Object.create(parentContext) : {};

  Object.defineProperty(this, '$config', {
    enumerable: false,
    get: function () {
      return context;
    },
    set: function (value) {
      context = value;
    }
  });

  Object.defineProperty(this, 'value', {
    get: function () {
      console.log('get value:', value);
      return value;
    },
    set: function (newValue) {
      var event = {
        field: this,
        path: this.path,
        oldValue: value,
        value: newValue,
      };

      if (context.emit) context.emit('change', Object.assign({}, event));
      if (context.batchEmit) context.batchEmit(event.path, Object.assign({}, event));

      value = newValue;
    }
  });

  this.type = null;
  this.name = name;

  Object.defineProperty(this, 'path', {
    enumerable: true,
    get: function () {
      var parentPath = (parentContext || {}).path;
      if (!this.name) return null;
      return (parentPath ? parentPath + '.' : '') + this.name;
    }
  });
}

