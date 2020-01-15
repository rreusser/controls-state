'use strict';

var Raw = require('../fields/raw');
var Field = require('../field');
var Slider = require('../fields/slider');
var Button = require('../fields/button');
var TextInput = require('../fields/textinput');
var Color = require('../fields/color');
var Checkbox = require('../fields/checkbox');

var inferType = require('../infer-type');

module.exports = Section;

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
    case 'tabsfield':
      if (fieldValue.path) {
        throw new Error('You may only add an field to a set of controls once.');
      }

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
    $field: {
      enumerable: false,
      value: this
    },
    $path: {
      enumerable: false,
      value: fieldAccessor
    },
    $displayFields: {
      enumerable: false,
      value: displayFields
    }
  });

  Object.keys(inputFields).forEach((fieldName) => {
    var enumerable;
    var field = displayFields[fieldName] = constructField(fieldName, inputFields[fieldName], this);
    var config = field.$config;

    if (field.type === 'raw' || field.type === 'button') {
      enumerable = config.enumerable === undefined ? false : !!config.enumerable;

      Object.defineProperty(value, fieldName, {
        enumerable: enumerable,
        get: function () { return field.value; }
      });

      Object.defineProperty(fieldAccessor, fieldName, {
        enumerable: enumerable,
        get: function () { return field; }
      });
    } else if (field.type === 'section' || field.type === 'tabs') {
      fields[fieldName] = field;

      enumerable = config.enumerable === undefined ? true : !!config.enumerable;

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

      enumerable = config.enumerable === undefined ? true : !!config.enumerable;

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
    }
  });
}

Section.prototype = Object.create(Field.prototype);
