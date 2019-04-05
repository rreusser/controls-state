var Section = require('./section');

module.exports = function Tabs(name, inputFields, config, parentField) {
  var section = new Section(name, inputFields, config, parentField);

  section.type = 'tabs';

  return section;
}
