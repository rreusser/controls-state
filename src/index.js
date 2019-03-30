'use strict';

var Section = require('./fields/section');
var Checkbox = require('./fields/checkbox');
var Raw = require('./fields/raw');
var Slider = require('./fields/slider');
var TextInput = require('./fields/textinput');
var Color = require('./fields/color');
var Select = require('./fields/select');

function Controls (fields, options) {
  return new Section('', fields, options).value;
}

Controls.Slider = function (value, opts) {
  return new Slider(null, value, opts);
};

Controls.Textinput = function (value, opts) {
  return new TextInput(null, value, opts);
};

Controls.Select = function (value, opts) {
  return new Select(null, value, opts);
};

Controls.Checkbox = function (value, opts) {
  return new Checkbox(null, value, opts);
};

Controls.Color = function (value, opts) {
  return new Color(null, value, opts);
};

Controls.Section = function (value, opts) {
  return new Section(null, value, opts);
};

Controls.Raw = function (value, opts) {
  return new Raw(null, value, opts);
};

module.exports = Controls;
