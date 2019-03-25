'use strict';

var EventEmitter = require('event-emitter');
var raf = require('raf');

module.exports = Field;

function Field (name, initialValue, parentField, config) {
  if (/\./.test(name)) {
    throw new Error('Field names may not contain a period');
  }

  config = config || {};

  var value = initialValue;

  this.parent = parentField || null;
  this.events = new EventEmitter();

  this.type = null;
  this.name = name;
  
  this.batchedUpdates = {};
  this.batchUpdatePaths = [];
  this.batchUpdateRaf = null;

  Object.defineProperties(this, {
    '$field': {
      enumerable: false,
      value: this
    },
    '$config': {
      enumerable: false,
      value: config
    },
    'value': {
      get: function () {
        return value;
      },
      set: function (newValue) {
        var event = {
          field: this,
          name: this.name,
          path: this.path,
          fullPath: this.path,
          oldValue: value,
          value: newValue
        };

        var path = [];
        var field = this;

        do {
          event.path = path.join('.');

          var changes = {};
          changes[event.path || this.name] = Object.assign({}, event);

          if (field.events.emit) {
            field.events.emit('beforeChange', Object.assign({}, event));
            field.events.emit('beforeChanges', changes);
          }

          if (field._batchEmit) {
            field._batchEmit(event.path, Object.assign({}, event));
          }

          path.unshift(field.name);

        } while ((field = field.parent));

        value = newValue;
      }
    },
    'path': {
      enumerable: true,
      get: function () {
        var parentPath = (this.parent || {}).path;
        if (!this.name) return null;
        return (parentPath ? parentPath + '.' : '') + this.name;
      }
    },
  });
}

Field.prototype = {
  onBeforeChange: function (callback) {
    this.events.on('beforeChange', callback);
    return this;
  },
  offBeforeChange: function (callback) {
    this.events.off('beforeChange', callback);
    return this;
  },

  onBeforeChanges: function (callback) {
    this.events.on('beforeChanges', callback);
    return this;
  },
  offBeforeChanges: function (callback) {
    this.events.off('beforeChanges', callback);
    return this;
  },

  onChange: function (callback) {
    this.events.on('change', callback);
    return this;
  },
  offChange: function (callback) {
    this.events.off('change', callback);
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
    this.events.emit('changes', Object.assign({}, this.batchedUpdates));

    while (this.batchUpdatePaths.length) {
      var updateKeys = Object.keys(this.batchedUpdates);
      for (var i = 0; i < updateKeys.length; i++) {
        var event = this.batchedUpdates[updateKeys[i]];
        var path = this.batchUpdatePaths.pop();
        this.events.emit('change', event);
        this.events.emit('change:' + path, event);
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
      this.batchUpdateRaf = raf(this._emitUpdate.bind(this));
    }
  }
};
