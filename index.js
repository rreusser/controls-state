'use strict';

var EventEmitter = require('event-emitter')
var raf = require('raf');

var COLOR_REGEX = /(#(?:[0-9a-fA-F]{2,4}){2,4}|(#[0-9a-fA-F]{3})|(rgb|hsl)a?((-?\d+%?[,\s]+){2,3}\s*[\d.]+%?))/;

function inferType (value) {
  var type = typeof value;

  if (value && value.type) {
    return value.type + 'field';
  }

  switch(typeof value) {
    case 'string':
      if (COLOR_REGEX.test(value)) {
        return 'color';
      }
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
  }
}

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

function Slider (name, initialValue, config, parentContext) {
  if (!(this instanceof Slider)) return new Slider(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? 0 : initialValue;
  config = config || {};

  Field.call(this, name, initialValue, config, parentContext);

  var min = config.min === undefined ? Math.min(initialValue, 0) : config.min;
  var max = config.max === undefined ? Math.max(initialValue, 1) : config.max;
  var step = config.step === undefined ? 1 : config.step;

  this.type = 'slider'
  this.min = min;
  this.max = max;
  this.step = step;
}

function Rangeslider (name, initialValue, config, parentContext) {
  if (!(this instanceof Rangeslider)) return new Rangeslider(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? 0 : initialValue;
  config = config || {};

  Field.call(this, name, initialValue, config, parentContext);

  var min = config.min === undefined ? Math.min(initialValue, 0) : config.min;
  var max = config.max === undefined ? Math.max(initialValue, 1) : config.max;
  var step = config.step === undefined ? 1 : config.step;

  this.type = 'rangeslider'
  this.min = min;
  this.max = max;
  this.step = step;
}

function Color (name, initialValue, config, parentContext) {
  if (!(this instanceof Color)) return new Color(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? '#ffffff' : initialValue;

  Field.call(this, name, initialValue, config, parentContext);

  this.type = 'color'
}

function TextInput (name, initialValue, config, parentContext) {
  if (!(this instanceof TextInput)) return new TextInput(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? '' : initialValue;

  Field.call(this, name, initialValue, config, parentContext);

  this.type = 'textinput'
}


function Checkbox (name, initialValue, config, parentContext) {
  if (!(this instanceof Checkbox)) return new Checkbox(name, initialValue, parentContext);

  initialValue = initialValue === undefined ? true : !!initialValue;

  Field.call(this, name, initialValue, config, parentContext);

  this.type = 'checkbox'
}

function constructField (fieldName, fieldValue, parentContext) {
  switch(inferType(fieldValue)) {
    case 'colorfield':
    case 'textfield':
    case 'sliderfield':
    case 'checkboxfield':
      if (fieldValue.path) {
        throw new Error('You may only add an field to a set of controls once.');
      }
      fieldValue.$config = Object.assign(Object.create(parentContext), fieldValue.context);
      fieldValue.name = fieldName;
      return fieldValue;
    case 'color':
      return new Color(fieldName, fieldValue, {}, parentContext);
    case 'string':
      return new TextInput(fieldName, fieldValue, {}, parentContext);
    case 'number':
      return new Slider(fieldName, fieldValue, {}, parentContext);
    case 'boolean':
      return new Checkbox(fieldName, fieldValue, {}, parentContext);
    case 'object':
      return new Section(fieldName, fieldValue, {}, parentContext);
    default:
      return null;
  }
}

function Section (name, inputFields, config, parentContext) {
  var fields = {};
  var fieldProxy = {};
  var context = Object.create(parentContext);

  Object.defineProperty(this, '$config', {enumerable: false, value: context});
  Object.defineProperty(this, '$field', {enumerable: false, value: fieldProxy});

  context.type = 'section';

  Object.defineProperty(context, 'path', {
    get: function () {
      var parentPath = parentContext.path;
      return (parentContext.path ? parentContext.path + '.' : '') + name;
    }
  });

  Object.keys(inputFields).forEach((fieldName) => {
    var field = fields[fieldName] = constructField(fieldName, inputFields[fieldName], context);

    if (field instanceof Section) {
      // For folders, it needs to return the section object with fancy getters and setters
      Object.defineProperty(this, fieldName, {
        enumerable: true,
        value: fields[fieldName]
      });

      Object.defineProperty(fieldProxy, fieldName, {
        enumerable: true,
        value: fields[fieldName].$field
      });
    } else {
      // For all other properties, it should return the value of the item itself
      Object.defineProperty(this, fieldName, {
        enumerable: true,
        get: function () {
          return field.value;
        },
        set: function (value) {
          field.value = value;
        }
      });

      Object.defineProperty(fieldProxy, fieldName, {
        enumerable: true,
        get: function () {
          return field;
        },
      });
    }
  });
}

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
    on: events.on.bind(events),
    off: events.off.bind(events),
    emit: events.emit.bind(events),
    batchEmit: batchEmit,
    parentContext: null,
    path: ''
  };

  var section = new Section('', fields, null, rootContext);

  return section;
};

controls.slider = function (value, opts) {
  return new Slider(null, value, opts, {});
}

controls.rangeslider = function (value, opts) {
  return new Rangeslider(null, value, opts, {});
}

controls.text = function (value, opts) {
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

