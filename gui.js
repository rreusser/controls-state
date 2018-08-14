var preact = require('preact');
var createClass = require('preact-classless-component');

module.exports = createGui;

require('insert-css')(`
input {
  margin: .4rem;
}

legend {
  background-color: #000;
  color: #fff;
  padding: 3px 6px;
}

fieldset {
  margin-bottom: 1.0rem;
}
`);

function createGui (state) {
  var h = preact.h;
  var render = preact.render;

  var Section = createClass({
    render: function () {
      var field = this.props.field;
      return h('fieldset', {
        className: 'section'
      }, [
        h('legend', null, field.name),
        Object.keys(field.value).map(key =>
          h(Control, {field: field.value.$path[key].$field})
        )
      ]);
    }
  });

  var TextInput = createClass({
    render: function () {
      var field = this.props.field;
      return h('div', {
        className: 'bar'
      }, [
        h('label', null, field.name),
        h('input', {
          type: 'text',
          value: field.value
        })
      ]);
    }
  });

  var Slider = createClass({
    render: function () {
      var field = this.props.field;
      return h('div', {
        className: 'bar'
      }, [
        h('label', null, field.name),
        h('input', {
          type: 'range',
          min: field.min,
          max: field.max,
          step: field.step
        }),
        h('span', null, field.value)
      ]);
    }
  });

  var Control = createClass({
    render: function () {
      switch (this.props.field.type) {
        case 'textinput':
          return h(TextInput, {field: this.props.field});
        case 'slider':
          return h(Slider, {field: this.props.field});
        case 'section':
          return h(Section, {field: this.props.field});
        default:
          throw new Error('Unknown field type, "' + this.props.field.type + '"');
      }
    }
  });

  var App = createClass({
    render: function () {
      return h('div', null,
        Object.keys(this.props.state).map(key =>
          h(Control, {field: this.props.state.$path[key].$field})
        )
      );
    }
  });

  render(h(App, {state: state}), document.body);

  return state;
}
