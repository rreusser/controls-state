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
      return value;
    },
    set: function (newValue) {
      var event = {
        field: this,
        path: this.path,
        oldValue: value,
        value: newValue,
      };

      if (context.emit) {
        context.emit('change:' + event.path, Object.assign({}, event));

        var changes = {};
        changes[event.path] = Object.assign({}, event);
        context.emit('changes', changes);
      }
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

Field.prototype = {
  onFinishChange: function (path, callback) {
    return this.context.on('finishChange:' + path, callback);
  },
  offFinishChange: function (path, callback) {
    return this.context.off('finishChange:' + path, callback);
  },
  onChange: function (path, callback) {
    return this.context.on('change:' + path, callback);
  },
  offChange: function (path, callback) {
    return this.context.off('change:' + path, callback);
  },

  onFinishChanges: function (callback) {
    return this.context.on('finishChanges', callback);
  },
  offFinishChanges: function (callback) {
    return this.context.off('finishChanges', callback);
  },
  onChanges: function (callback) {
    return this.context.on('changes', callback);
  },
  offChanges: function (callback) {
    return this.context.off('changes', callback);
  },
};
