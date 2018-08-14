'use strict';

module.exports = Field;

function Field (name, initialValue, config, parentContext) {
  if (/\./.test(name)) {
    throw new Error('Field names may not contain a period');
  }

  var value = initialValue;

  this.context = parentContext ? Object.create(parentContext) : null;

  if (this.context){ 
    this.context.parentContext = parentContext;
    this.context.field = this;
  }

  Object.defineProperty(this, '$field', {
    enumerable: false,
    value: this,
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

      var currentContext = this.context;
      do {
        console.log('currentContext.parentContext:', currentContext.parentContext);
        var changes = {};
        changes[event.path] = Object.assign({}, event);

        var path = currentContext.field.path;

        currentContext.emit('change:' + path, Object.assign({}, event));
        currentContext.emit('changes', changes);

        currentContext.batchEmit(path, Object.assign({}, event));
      } while ((currentContext = currentContext.parentContext));


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
  onFinishChange: function (callback) {
    this.context.on('finishChange:' + this.path, callback);
    return this;
  },
  offFinishChange: function (callback) {
    this.context.off('finishChange:' + this.path, callback);
    return this;
  },
  onChange: function (callback) {
    this.context.on('change:' + this.path, callback);
    return this;
  },
  offChange: function (callback) {
    this.context.off('change:' + this.path, callback);
    return this;
  },
  onFinishChanges: function (callback) {
    this.context.on('finishChanges', callback);
    return this;
  },
  offFinishChanges: function (callback) {
    this.context.off('finishChanges', callback);
    return this;
  },
  onChanges: function (callback) {
    this.context.on('changes', callback);
    return this;
  },
  offChanges: function (callback) {
    this.context.off('changes', callback);
    return this;
  },
};
