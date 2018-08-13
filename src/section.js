'use strict';

module.exports = Section;

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
var Rangeslider = require('./rangeslider');
var TextInput = require('./textinput');
var Color = require('./color');

function constructField (fieldName, fieldValue, parentContext) {
  switch(inferType(fieldValue)) {
    case 'colorfield':
    case 'textfield':
    case 'sliderfield':
    case 'checkboxfield':
      if (fieldValue.path) {
        throw new Error('You may only add an field to a set of controls once.');
      }
      fieldValue.$field.context = Object.assign(Object.create(parentContext), fieldValue.context);
      fieldValue.name = fieldName;
      return fieldValue;
    case 'color':
      return new Color(fieldName, fieldValue, {}, parentContext);
    case 'textinput':
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
  this.context = Object.create(parentContext);

  var value = {};
  Field.call(this, name, value, this.context, parentContext);
  this.type = 'section';

  Object.defineProperty(value, '$field', {enumerable: false, value: this});
  Object.defineProperty(value, '$path', {enumerable: false, value: fields});

  Object.defineProperty(this.context, 'path', {
    get: function () {
      var parentPath = parentContext.path;
      return (parentContext.path ? parentContext.path + '.' : '') + name;
    }
  });

  Object.keys(inputFields).forEach((fieldName) => {
    var field = fields[fieldName] = constructField(fieldName, inputFields[fieldName], this.context);

    if (field instanceof Section) {
      // For folders, it needs to return the section object with fancy getters and setters
      Object.defineProperty(value, fieldName, {
        enumerable: true,
        value: fields[fieldName].value
      });

      Object.defineProperty(this, fieldName, {
        enumerable: true,
        value: fields[fieldName]
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

      Object.defineProperty(this, fieldName, {
        enumerable: true,
        get: function () {
          return field;
        },
      });
    }
  });
}

Section.prototype = Object.create(Field.prototype);
