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
  var updatePaths = [];
  var updateRaf = null;

  function emitUpdate () {
    while (updatePaths.length) {
      var updateKeys = Object.keys(updates);
      for (var i = 0; i < updateKeys.length; i++) {
        var event = updates[updateKeys[i]];
        events.emit('finishChange:' + updatePaths.pop(), event);
      }
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
    updatePaths.push(path);
    updates[path] = event;

    if (!updateRaf) updateRaf = raf(emitUpdate);
  }

  var rootContext = {
    on: events.on.bind(events),
    off: events.off.bind(events),
    emit: events.emit.bind(events),
    batchEmit: batchEmit,
    parentContext: null,
    path: ''
  };

  var section = new Section('', fields, null, rootContext);

  return section.value;
};

controls.slider = function (value, opts) {
  return new Slider(null, value, opts);
}

controls.rangeslider = function (value, opts) {
  return new Rangeslider(null, value, opts);
}

controls.textinput = function (value, opts) {
  return new TextInput(null, value, opts);
};

controls.checkbox = function (value, opts) {
  return new Checkbox(null, value, opts);
};

controls.color = function (value, opts) {
  return new Color(null, value, opts);
};

controls.section = function (value, opts) {
  return new Section(null, value, opts);
}

module.exports = controls;

