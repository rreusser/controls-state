'use strict';

var EventEmitter = require('event-emitter');
var raf = require('raf');

module.exports = Field;

function Field (name, initialValue, parentField, parentContext) {
  if (/\./.test(name)) {
    throw new Error('Field names may not contain a period');
  }

  var value = initialValue;

  this.parent = parentField || null;
  this.context = parentContext ? Object.create(parentContext) : null;
  this.events = new EventEmitter();

  this.type = null;
  this.name = name;

  if (this.context) {
    this.context.parentContext = parentContext;
    this.context.field = this;
  }

  this.batchedUpdates = {};
  this.batchUpdatePaths = [];
  this.batchUpdateRaf = null;

  Object.defineProperty(this, '$field', {
    enumerable: false,
    value: this
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
        value: newValue
      };

      var field = this;
      do {
        var changes = {};
        changes[event.path] = Object.assign({}, event);

        var path = field.path;
        var events = field.events;

        if (!events) continue;

        if (events.emit) {
          events.emit('change:' + path, Object.assign({}, event));
          events.emit('changes', changes);
        }

        if (events.batchEmit) {
          events.batchEmit(path, Object.assign({}, event));
        }
      } while ((field = field.parent));

      value = newValue;
    }
  });

  Object.defineProperty(this, 'path', {
    enumerable: true,
    get: function () {
      var parentPath = (parentField || {}).path;
      if (!this.name) return null;
      return (parentPath ? parentPath + '.' : '') + this.name;
    }
  });
}

Field.prototype = {
  onFinishChange: function (callback) {
    this.events.on('finishChange:' + this.path, callback);
    return this;
  },
  offFinishChange: function (callback) {
    this.events.off('finishChange:' + this.path, callback);
    return this;
  },
  onChange: function (callback) {
    this.events.on('change:' + this.path, callback);
    return this;
  },
  offChange: function (callback) {
    this.events.off('change:' + this.path, callback);
    return this;
  },
  onFinishChanges: function (callback) {
    this.events.on('finishChanges', callback);
    return this;
  },
  offFinishChanges: function (callback) {
    this.events.off('finishChanges', callback);
    return this;
  },
  onChanges: function (callback) {
    this.events.on('changes', callback);
    return this;
  },
  offChanges: function (callback) {
    this.events.off('changes', callback);
    return this;
  },
  _emitUpdate: function () {
    while (this.batchUpdatePaths.length) {
      var updateKeys = Object.keys(this.batchedUpdates);
      for (var i = 0; i < updateKeys.length; i++) {
        var event = this.batchedUpdates[updateKeys[i]];
        this.events.emit('finishChange:' + this.batchUpdatePaths.pop(), event);
      }
    }
    this.batchedUpdates = {};
    this.batchUpdateRaf = null;
  },
  _batchEmit: function (path, event) {
    var existingUpdate = this.batchedUpdates[event.path];
    if (existingUpdate) {
      event.oldValue = existingUpdate.oldValue;
    }
    this.batchUpdatePaths.push(path);
    this.batchedUpdates[path] = event;

    if (!this.batchUpdateRaf) {
      this.batchUpdateRaf = raf(this._emitUpdate);
    }
  }
};
