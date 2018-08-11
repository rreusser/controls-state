'use strict';

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
/*
function parseFields (fields) {
  var fieldNames = Object.keys(fields);
  return fieldNames.map(fieldName => {
    var type = inferType(fields[fieldName])
    console.log('fieldName, type:', fieldName, type);
    return type;
  });
}
*/

function proxyValue (object) {
  var container = {};
  Object.defineProperty(object, 'value', {
    get: function () {
      return container.value;
    },
    set: function (value) {
      container.value = value;
    }
  });
}

function ColorField (initialValue) {
  if (!(this instanceof ColorField)) return new ColorField(initialValue);

  this.type = 'color';

  if (initialValue && !COLOR_REGEX.test(initialValue)) {
    var opts = initialValue || {};
    initialValue = opts.value || '#000000';
  }

  proxyValue(this);

  this.value = initialValue;
}

function TextField (initialValue) {
  if (!(this instanceof TextField)) return new TextField(initialValue);

  this.type = 'text';

  proxyValue(this);

  this.value = initialValue;
}

function SliderField (initialValue) {
  if (!(this instanceof SliderField)) return new SliderField(initialValue);

  this.type = 'slider';

  if (initialValue && typeof initialValue !== 'number') {
    var opts = initialValue || {};
    initialValue = opts.value === undefined ? 0 : opts.value;
  }

  proxyValue(this);

  this.value = initialValue;
}

function CheckboxField (initialValue) {
  if (!(this instanceof CheckboxField)) return new CheckboxField(initialValue);

  this.type = 'checkbox';

  if (initialValue && typeof initialValue !== 'boolean') {
    var opts = initialValue || {};
    initialValue = opts.value === undefined ? true : !!opts.value;
  }

  proxyValue(this);

  this.value = initialValue;
}

function constructField (fieldValue, config) {
  switch(inferType(fieldValue)) {
    case 'colorfield':
    case 'textfield':
    case 'sliderfield':
    case 'checkboxfield':
      return fieldValue;
    case 'color':
      return new ColorField(fieldValue);
    case 'string':
      return new TextField(fieldValue);
    case 'number':
      return new SliderField(fieldValue);
    case 'boolean':
      return new CheckboxField(fieldValue);
    default:
      return null;
  }
}

function Folder (fields, config) {
  Field.call(this, fields, config || {});
  this.type = 'folder';
}

function Field (fields, config) {
  var state = {};

  Object.keys(fields).forEach((fieldName) => {
    var fieldValue = fields[fieldName];

    var fieldObj = constructField(fields[fieldName], config);
    var fieldConfig = config;

    if (!fieldObj) {
      fieldConfig = config[fieldName] = {};
      fieldObj = new Folder(new Field(fieldValue, fieldConfig));
      state[fieldName] = fieldObj;
      config[fieldName] = fieldConfig;
    } else {
      state[fieldName] = fieldObj;
      config[fieldName] = fieldObj;
    }

    Object.defineProperty(this, fieldName, {
      get: function () {
        return state[fieldName].value;
      },
      set: function (value) {
        state[fieldName].value = value;
        return value;
      }
    });
  });
}

function controls (fields, options) {
  var config = {};
  var field = new Field(fields, config);
  Object.defineProperty(field, '$config', {
    get: function () {
      return config;
    },
    iterable: false,
  });

  return field;
};

controls.slider = SliderField;
controls.text = TextField;
controls.checkbox = CheckboxField;
controls.color = ColorField;
controls.folder = Folder;

controls.section = function (obj) {
  return obj;
};

module.exports = controls;

