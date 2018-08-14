'use strict';

module.exports = Section;

var COLOR_REGEX = /(#(?:[0-9a-fA-F]{2,4}){2,4}|(#[0-9a-fA-F]{3})|(rgb|hsl)a?((-?\d+%?[,\s]+){2,3}\s*[\d.]+%?))/;

function inferType (value) {
  if (value && value.type) {
    return value.type + 'field';
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
    case 'object':
      return 'object';
  }
}

var Field = require('./field');
var Slider = require('./slider');
// var Rangeslider = require('./rangeslider');
var TextInput = require('./textinput');
var Color = require('./color');
var Checkbox = require('./checkbox');

function constructField (fieldName, fieldValue, parentField, parentContext) {
  switch (inferType(fieldValue)) {
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
      fieldValue.$field.context = Object.assign(Object.create(parentContext), fieldValue.context);
      fieldValue.$field.context.parentContext = parentContext;
      fieldValue.name = fieldName;
      return fieldValue;
    case 'color':
      return new Color(fieldName, fieldValue, {}, parentField, parentContext);
    case 'textinput':
      return new TextInput(fieldName, fieldValue, {}, parentField, parentContext);
    case 'number':
      return new Slider(fieldName, fieldValue, {}, parentField, parentContext);
    case 'boolean':
      return new Checkbox(fieldName, fieldValue, {}, parentField, parentContext);
    case 'object':
      return new Section(fieldName, fieldValue, {}, parentField, parentContext);
    default:
      return null;
  }
}

function Section (name, inputFields, config, parentField, parentContext) {
  var fields = {};
  var fieldAccessor = {};
  var value = {};

  Field.call(this, name, value, parentField, parentContext);
  this.type = 'section';

  Object.defineProperty(fieldAccessor, '$field', {enumerable: false, value: this});
  Object.defineProperty(value, '$field', {enumerable: false, value: this});

  Object.defineProperty(value, '$path', {enumerable: false, value: fieldAccessor});

  Object.keys(inputFields).forEach((fieldName) => {
    var field = fields[fieldName] = constructField(fieldName, inputFields[fieldName], this, this.context);

    if (field.type === 'section') {
      // For folders, it needs to return the section object with fancy getters and setters
      Object.defineProperty(value, fieldName, {
        enumerable: true,
        value: field.value
      });

      Object.defineProperty(fieldAccessor, fieldName, {
        enumerable: true,
        value: field.value.$path
      });
    } else {
      // For all other properties, it should return the value of the item itself
      Object.defineProperty(value, fieldName, {
        enumerable: true,
        get: function () {
          return field.value;
        },
        set: function (value) {
          field.value = value;
        }
      });

      Object.defineProperty(fieldAccessor, fieldName, {
        enumerable: true,
        get: function () {
          return field;
        }
      });
    }
  });
}

Section.prototype = Object.create(Field.prototype);
