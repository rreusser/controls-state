'use strict';

var EventEmitter = require('event-emitter')
var raf = require('raf');

var Section = require('./src/section');
var Field = require('./src/field');
var Slider = require('./src/slider');
var Rangeslider = require('./src/rangeslider');
var TextInput = require('./src/textinput');
var Color = require('./src/color');

function controls (fields, options) {
  var events = new EventEmitter();

  var updates = {};
  var updateRaf = null;

  function emitUpdate () {
    var updateKeys = Object.keys(updates);
    for (var i = 0; i < updateKeys.length; i++) {
      var event = updates[updateKeys[i]];
      events.emit('finishChange:' + event.path, event);
    }
    events.emit('finishChanges', updates);
    updates = {};
    updateRaf = null;
  }

  function batchEmit (path, event) {
    var existingUpdate = updates[event.path];
    if (existingUpdate) {
      event.oldValue = existingUpdate.oldValue;
    }
    updates[path] = event;

    if (!updateRaf) updateRaf = raf(emitUpdate);
  }

  var rootContext = {
    onFinishChange: function (path, callback) {
      events.on('finishChange:' + path, callback);
      return function () {
        events.off('finishChanges:' + path, callback);
      };
    },
    offFinishChange: function (path, callback) {
      return events.on('finishChange:' + path, callback);
    },
    onFinishChanges: function (callback) {
      events.on('finishChanges', callback);
      return function () {
        events.off('finishChanges', callback);
      };
    },
    offFinishChanges: function (path, callback) {
      return events.on('finishChanges', callback);
    },
    emit: events.emit.bind(events),
    batchEmit: batchEmit,
    parentContext: null,
    path: ''
  };

  var section = new Section('', fields, null, rootContext);

  return section.value;
};

controls.slider = function (value, opts) {
  return new Slider(null, value, opts, {});
}

controls.rangeslider = function (value, opts) {
  return new Rangeslider(null, value, opts, {});
}

controls.textinput = function (value, opts) {
  return new TextInput(null, value, opts, {});
};

controls.checkbox = function (value, opts) {
  return new Checkbox(null, value, opts, {});
};

controls.color = function (value, opts) {
  return new Color(null, value, opts, {});
};

controls.section = function (value, opts) {
  return new Section(null, value, opts, {});
}

module.exports = controls;

