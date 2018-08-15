var preact = require('preact');
var createClass = require('preact-classless-component');
var css = require('insert-css');

module.exports = createGui;

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

  var Select = createClass({
    render: function () {
      var field = this.props.field;
      return h('div', {
        className: 'bar'
      }, [
        h('label', {htmlFor: field.path}, field.name),
        h('select', {
          name: field.path,
          id: field.path,
          onChange: event => this.props.field.value = event.target.value,
        }, field.options.map(option =>
          h('option', {
            value: option,
            selected: option === field.value
          }, option)
        ))
      ]);
    }
  });

  var TextInput = createClass({
    render: function () {
      var field = this.props.field;
      return h('div', {
        className: 'bar'
      }, [
        h('label', {htmlFor: field.path}, field.name),
        h('input', {
          id: field.path,
          type: 'text',
          value: field.value,
          onInput: event => this.props.field.value = event.target.value,
        })
      ]);
    }
  });

  var Checkbox = createClass({
    render: function () {
      var field = this.props.field;
      return h('div', {
        className: 'bar'
      }, [
        h('label', {htmlFor: field.path}, field.name),
        h('input', {
          id: field.path,
          type: 'checkbox',
          checked: field.value,
          onInput: event => this.props.field.value = event.target.checked,
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
        h('label', {htmlFor: field.path}, field.name),
        h('input', {
          id: field.path,
          type: 'range',
          min: field.min,
          max: field.max,
          step: field.step,
          value: field.value,
          onInput: event => this.props.field.value = parseFloat(event.target.value)
        }),
        h('span', null, field.value.toFixed(2).replace(/\.?0*$/,''))
      ]);
    }
  });

  var Control = createClass({
    render: function () {
      switch (this.props.field.type) {
        case 'checkbox':
          return h(Checkbox, {field: this.props.field});
        case 'textinput':
          return h(TextInput, {field: this.props.field});
        case 'slider':
          return h(Slider, {field: this.props.field});
        case 'select':
          return h(Select, {field: this.props.field});
        case 'section':
          return h(Section, {field: this.props.field});
        default:
          throw new Error('Unknown field type, "' + this.props.field.type + '"');
      }
    }
  });

  var App = createClass({
    componentDidMount: function () {
      this.props.state.$field.onChanges(updates => {
        this.setState({foo: Math.random()});
      });
    },
    render: function () {
      return h('div', {
        className: 'control-panel'
      },
      Object.keys(this.props.state).map(key =>
        h(Control, {field: this.props.state.$path[key].$field})
      ));
    }
  });

  css(`
    .control-panel {
      max-width: 350px;
      border: 1px solid black;
      padding: 15px;
      position: fixed;
      width: 350px;
      top: 0;
      right: 0;
    }

    .control-panel label {
      display: inline-block;
      width: 25%;
    }

    .control-panel input,
    .control-panel select {
      margin: .4rem;
      width: 50%;
    }

    .control-panel legend {
      background-color: #000;
      color: #fff;
      padding: 3px 6px;
    }

    .control-panel fieldset:not(:last-child) {
      margin-bottom: 1.0rem;
    }
  `);


  render(h(App, {state: state}), document.body);

  return state;
}
