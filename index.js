'use strict';

var Section = require('./src/section');
var Checkbox = require('./src/checkbox');
var Slider = require('./src/slider');
var Rangeslider = require('./src/rangeslider');
var TextInput = require('./src/textinput');
var Color = require('./src/color');
var Select = require('./src/select');

function Controls (fields, options) {
  return new Section('', fields, options).value;
}

Controls.Slider = function (value, opts) {
  return new Slider(null, value, opts);
};

Controls.Rangeslider = function (value, opts) {
  return new Rangeslider(null, value, opts);
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

module.exports = Controls;
