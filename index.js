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

function Field (name, initialValue, parentContext) {
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
        context.emit('change', Object.assign({}, event));
        context.batchEmit(event.path, Object.assign({}, event));
      }
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
      return (parentContext.path ? parentContext.path + '.' : '') + this.name;
    }
  });
}

function SliderField (name, initialValue, parentContext) {
  if (!(this instanceof SliderField)) return new SliderField(name, initialValue, parentContext);

  var opts = {};

  if (typeof initialValue === 'object') {
    opts = initialValue;
    initialValue = opts.value === undefined ? 0 : opts.value;
  } else {
    initialValue = initialValue === undefined ? 0 : initialValue;
    opts = opts || {};
  }

  Field.call(this, name, initialValue, parentContext);

  var min = opts.min === undefined ? Math.min(initialValue, 0) : opts.min;
  var max = opts.max === undefined ? Math.max(initialValue, 1) : opts.max;
  var step = opts.step === undefined ? 1 : opts.step;

  this.type = 'slider'
  this.min = min;
  this.max = max;
  this.step = step;
}

function ColorField (name, initialValue, parentContext) {
  if (!(this instanceof ColorField)) return new ColorField(name, initialValue, parentContext);

  var opts = {};

  if (typeof initialValue === 'object') {
    opts = initialValue;
    initialValue = opts.value === undefined ? '#ffffff' : opts.value;
  } else {
    initialValue = initialValue === undefined ? '#ffffff' : initialValue;
    opts = opts || {};
  }

  Field.call(this, name, initialValue, parentContext);

  this.type = 'text'
}

function TextField (name, initialValue, parentContext) {
  if (!(this instanceof TextField)) return new TextField(name, initialValue, parentContext);

  var opts = {};

  if (typeof initialValue === 'object') {
    opts = initialValue;
    initialValue = opts.value === undefined ? '' : opts.value;
  } else {
    initialValue = initialValue === undefined ? '' : initialValue;
    opts = opts || {};
  }

  Field.call(this, name, initialValue, parentContext);

  this.type = 'text'
}


function CheckboxField (name, initialValue, parentContext) {
  if (!(this instanceof CheckboxField)) return new CheckboxField(name, initialValue, parentContext);

  var opts = {};

  if (typeof initialValue === 'object') {
    opts = initialValue;
    initialValue = opts.value === undefined ? true : !!opts.value;
  } else {
    initialValue = initialValue === undefined ? true : !!initialValue;
    opts = opts || {};
  }

  Field.call(this, name, initialValue, parentContext);

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
      return new ColorField(fieldName, fieldValue, parentContext);
    case 'string':
      return new TextField(fieldName, fieldValue, parentContext);
    case 'number':
      return new SliderField(fieldName, fieldValue, parentContext);
    case 'boolean':
      return new CheckboxField(fieldName, fieldValue, parentContext);
    case 'object':
      return new Folder(fieldName, fieldValue, parentContext);
    default:
      return null;
  }
}

function Folder (name, inputFields, parentContext) {
  var fields = {};
  var fieldProxy = {};
  var context = Object.create(parentContext);

  Object.defineProperty(this, '$config', {enumerable: false, value: context});
  Object.defineProperty(this, '$field', {enumerable: false, value: fieldProxy});

  context.type = 'folder';

  Object.defineProperty(context, 'path', {
    get: function () {
      var parentPath = parentContext.path;
      return (parentContext.path ? parentContext.path + '.' : '') + name;
    }
  });

  Object.keys(inputFields).forEach((fieldName) => {
    var field = fields[fieldName] = constructField(fieldName, inputFields[fieldName], context);

    if (field instanceof Folder) {
      // For folders, it needs to return the folder object with fancy getters and setters
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
    events.emit('batchedUpdate', updates);
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

  var folder = new Folder('', fields, rootContext);

  return folder;
};

controls.slider = function (value) {
  return new SliderField(null, value, {});
}

controls.text = function (value) {
  return new TextField(null, value, {});
};

controls.checkbox = function (value) {
  return new CheckboxField(null, value, {});
};

controls.color = function (value) {
  return new ColorField(null, value, {});
};

controls.folder = function (value) {
  return new Folder(null, value, {});
}

module.exports = controls;

