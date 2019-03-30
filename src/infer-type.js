var global = require('global');

function isHTMLElement(element) {
  return (global.Element && element instanceof global.Element) ||
    (global.HTMLDocument && element instanceof global.HTMLDocument);
}

var COLOR_REGEX = /(#(?:[0-9a-fA-F]{2,4}){2,4}|(#[0-9a-fA-F]{3})|(rgb|hsl)a?((-?\d+%?[,\s]+){2,3}\s*[\d.]+%?))/;

module.exports = function inferType (value) {
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
