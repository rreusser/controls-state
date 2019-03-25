'use strict';

var global = require('global');

module.exports = Section;

var COLOR_REGEX = /(#(?:[0-9a-fA-F]{2,4}){2,4}|(#[0-9a-fA-F]{3})|(rgb|hsl)a?((-?\d+%?[,\s]+){2,3}\s*[\d.]+%?))/;

function isHTMLElement(element) {
  return (global.Element && element instanceof global.Element) ||
    (global.HTMLDocument && element instanceof global.HTMLDocument);
}

function inferType (value) {
  if (value && value.type) {
    return value.type + 'field';
  }

  if (isHTMLElement(value)) {
    return 'rawfield';
  }

  if (typeof value === 'function') {
    return 'button';
  }

  switch (typeof value) {
    case 'string':
      if (COLOR_REGEX.test(value)) {
        return 'color';
      }
      return 'textinput';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'raw':
      return 'raw';
    case 'button':
      return 'button';
    case 'object':
      return 'object';
  }
}

var Raw = require('./raw');
var Field = require('./field');
var Slider = require('./slider');
// var Rangeslider = require('./rangeslider');
var Button = require('./button');
var TextInput = require('./textinput');
var Color = require('./color');
var Checkbox = require('./checkbox');

function constructField (fieldName, fieldValue, parentField) {
  switch (inferType(fieldValue)) {
    case 'rawfield':
    case 'buttonfield':
    case 'colorfield':
    case 'textfield':
    case 'sliderfield':
    case 'selectfield':
    case 'rangesliderfield':
    case 'checkboxfield':
    case 'sectionfield':
      if (fieldValue.path) {
        throw new Error('You may only add an field to a set of controls once.');
      }

      //fieldValue.$field.context = Object.assign(Object.create(parentContext), fieldValue.context);
      //fieldValue.$field.context.parentContext = parentContext;

      fieldValue.$field.parent = parentField;
      fieldValue.name = fieldName;

      return fieldValue;
    case 'color':
      return new Color(fieldName, fieldValue, {}, parentField);
    case 'raw':
      return new Raw(fieldName, fieldValue, {}, parentField);
    case 'button':
      return new Button(fieldName, fieldValue, {}, parentField);
    case 'textinput':
      return new TextInput(fieldName, fieldValue, {}, parentField);
    case 'number':
      return new Slider(fieldName, fieldValue, {}, parentField);
    case 'boolean':
      return new Checkbox(fieldName, fieldValue, {}, parentField);
    case 'object':
      return new Section(fieldName, fieldValue, {}, parentField);
    default:
      return null;
  }
}

function Section (name, inputFields, config, parentField) {
  config = config || {};
  var fields = {};
  var displayFields = {};
  var fieldAccessor = {};
  var value = {};

  Field.call(this, name, value, parentField, config);

  this.type = 'section';

  Object.defineProperty(fieldAccessor, '$field', {
    enumerable: false,
    value: this
  });

  Object.defineProperties(value, {
    '$field': {
      enumerable: false,
      value: this
    },
    '$path': {
      enumerable: false,
      value: fieldAccessor
    },
    '$displayFields': {
      enumerable: false,
      value: displayFields
    }
  });

  Object.keys(inputFields).forEach((fieldName) => {
    var field = displayFields[fieldName]= constructField(fieldName, inputFields[fieldName], this);
    var config = field.$config;

    if (field.type === 'raw') {

      var enumerable = config.enumerable === undefined ? false : !!config.enumerable;

      Object.defineProperty(value, fieldName, {
        enumerable: enumerable,
        get: function () { return field.value; },
      });

      Object.defineProperty(fieldAccessor, fieldName, {
        enumerable: enumerable,
        get: function () { return field; }
      });
    } else if (field.type === 'section') {
      fields[fieldName] = field;

      var enumerable = config.enumerable === undefined ? true : !!config.enumerable;

      // For folders, it needs to return the section object with fancy getters and setters
      Object.defineProperty(value, fieldName, {
        enumerable: enumerable,
        value: field.value
      });

      Object.defineProperty(fieldAccessor, fieldName, {
        enumerable: enumerable,
        value: field.value.$path
      });
    } else {
      // For all other properties, it should return the value of the item itself
      fields[fieldName] = field;

      var enumerable = config.enumerable === undefined ? true : !!config.enumerable;

      Object.defineProperty(value, fieldName, {
        enumerable: enumerable,
        get: function () { return field.value; },
        set: function (value) { field.value = value; }
      });

      Object.defineProperty(fieldAccessor, fieldName, {
        enumerable: enumerable,
        get: function () { return field; }
      });
    }
  });

  Object.defineProperties(value, {
    $onBeforeChanges: {
      enumerable: false,
      value: this.onBeforeChanges.bind(this)
    },
    $onBeforeChange: {
      enumerable: false,
      value: this.onBeforeChange.bind(this)
    },

    $offBeforeChanges: {
      enumerable: false,
      value: this.offBeforeChanges.bind(this)
    },
    $offBeforeChange: {
      enumerable: false,
      value: this.offBeforeChange.bind(this)
    },

    $onChanges: {
      enumerable: false,
      value: this.onChanges.bind(this)
    },
    $onChange: {
      enumerable: false,
      value: this.onChange.bind(this)
    },

    $offChanges: {
      enumerable: false,
      value: this.offChanges.bind(this)
    },
    $offChange: {
      enumerable: false,
      value: this.offChange.bind(this)
    },
  });

}

Section.prototype = Object.create(Field.prototype);
