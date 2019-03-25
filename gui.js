var preact = require('preact');
var createClass = require('./src/util/preact-classless-component');
var css = require('insert-css');
var toggleSlide = require('./src/util/toggle-slide');

module.exports = createGui;

function createGui (state, opts) {
  opts = opts || {};

  var style = opts.style === undefined ? true : !!opts.style;

  var className = opts.className === undefined ? 'controlPanel' : opts.className;
  var h = preact.h;
  var render = preact.render;

  var Section = createClass({
    init: function () {
      var expanded = this.props.field.$config.expanded;
      expanded = expanded === undefined ? true : !!expanded;
      this.state = {
        expanded: expanded,
      };
    },
    toggleCollapsed: function (event) {
      event.stopPropagation();

      toggleSlide(this.contentsEl);

      this.setState({expanded: !this.state.expanded});
    },
    getRef: function (ref) {
      this.contentsEl = ref;
      if (this.state.expanded === false) {
        toggleSlide(this.contentsEl);
      }
    },
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      var title = config.label || field.name;
      if (!field.parentField && title === '') title = 'Controls'
      return h('fieldset', {
        className: `${className}__section ${this.state.expanded ? `${className}__section--expanded` : ''}`,
      }, 
        h('legend', {
          className: `${className}__sectionHeading`,
        }, 
          h('button', {onClick: this.toggleCollapsed}, title)
        ),
        h('div', {
          ref: this.getRef,
          className: `${className}__sectionFields`,
        },
          Object.keys(field.value.$displayFields).map(key => {
            return h(Control, {field: field.value.$path[key].$field})
          })
        ),
      );
    }
  });

  var Select = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--select`
      },
        h('label', {htmlFor: field.path}, h('span', null, config.label || field.name)),
        ' ',
        h('span', {className: `${className}__container`},
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
        ),
      );
    }
  });

  var TextInput = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--text`
      },
        h('label', {htmlFor: field.path}, h('span', null, config.label || field.name)),
        ' ',
        h('span', {className: `${className}__container`},
          h('input', {
            id: field.path,
            name: field.path,
            type: 'text',
            value: field.value,
            onInput: event => this.props.field.value = event.target.value,
          })
        )
      );
    }
  });

  var Checkbox = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--checkbox`
      },
        h('label', {htmlFor: field.path}, h('span', null, config.label || field.name)),
        ' ',
        h('span', {className: `${className}__container`},
          h('input', {
            id: field.path,
            name: field.path,
            type: 'checkbox',
            checked: field.value,
            onInput: event => this.props.field.value = event.target.checked,
          })
        ),
      );
    }
  });

  var Button = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--button`
      },
        h('button', {
          onClick: field.value,
        }, config.label || field.name),
      );
    }
  });

  var Color = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--color`
      },
        h('label', {htmlFor: field.path}, h('span', null, config.label || field.name)),
        ' ',
        h('span', {className: `${className}__container`},
          h('input', {
            id: field.path,
            name: field.path,
            type: 'color',
            value: field.value,
            onInput: event => {
              this.props.field.value = event.target.value;
            }
          })
        ),
      );
    }
  });

  var Slider = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--slider`
      },
        h('label', {htmlFor: field.path}, h('span', null, config.label || field.name)),
        ' ',
        h('span', {className: `${className}__container`},
          h('input', {
            id: field.path,
            name: field.path,
            type: 'range',
            min: field.min,
            max: field.max,
            step: field.step,
            value: field.value,
            onInput: event => this.props.field.value = parseFloat(event.target.value)
          }),
          h('span', {className: `${className}__value`}, field.value.toFixed(4).replace(/\.?0*$/,'')) )
      );
    }
  });

  var Control = createClass({
    render: function () {
      switch (this.props.field.type) {
        case 'raw':
          return h(Raw, {field: this.props.field});
        case 'button':
          return h(Button, {field: this.props.field});
        case 'checkbox':
          return h(Checkbox, {field: this.props.field});
        case 'color':
          return h(Color, {field: this.props.field});
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

  var Raw = createClass({
    getRef: function (el) {
      this.el = el;
    },

    getContent: function (props) {
      this.content = props.field.value;
      if (typeof this.content === 'function') {
        this.content = this.content(state, props.field.parent.value);
      }
      return this.content;
    },

    componentDidMount: function () {
      this.el.innerHTML = this.getContent(this.props);
    },

    componentWillReceiveProps: function (nextProps) {
      this.el.innerHTML = this.getContent(nextProps);
    },

    render: function () {
      return h('div', {
          className: `${className}__field--raw ${className}__field`
        },
        h('div', {
          ref: this.getRef,
          className: `${className}__rawContent`
        })
      );
    }
  });

  var App = createClass({
    state: {
      dummy: 0,
    },
    componentDidMount: function () {
      this.props.state.$field.onChanges(updates => {
        this.setState({dummy: this.state.dummy + 1});
      });
    },
    getRef: function (c) {
      var eventList = ['mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchmove', 'touchend', 'wheel'];
      for (var i = 0; i < eventList.length; i++) {
        c.addEventListener(eventList[i], function (e) {
          e.stopPropagation();
        });
      }
    },
    render: function () {
      return h('div', {
          className: `${className}`,
          ref: this.getRef,
        }, h(Control, {field: this.props.state.$field})
      );
    }
  });

  if (style) {
    var SLIDER_HEIGHT = '22px';
    var CONTROL_BG_COLOR = '#444';
    var PANEL_BG_COLOR = '#333';
    var FIELD_HOVER_COLOR = '#383838';
    var SECTION_HEADING_BG_COLOR = '#222';
    var SECTION_HEADING_HOVER_COLOR = '#444';
    var DIVIDER_COLOR = '#232323';
    var CONTROL_BORDER_COLOR = '#555';
    var THUMB_COLOR = '#888';
    var TEXT_COLOR = '#e8e8e8';
    var SECTION_HEADING_HEIGHT = '24px';
    var MIN_LABEL_WIDTH = '110px';
    var MIN_CONTROL_WIDTH = '130px';

    var FOCUS_BORDER = `
      outline: none;
      border-color: #888;
      box-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
    `;

    css(`
      .${className} {
        color: ${TEXT_COLOR};
      }

      .${className}__sectionHeading {
        font-family: inherit;
      }

      .${className}__sectionHeading > button {
        vertical-align: middle;
        font-size: 1.0em;
        cursor: pointer;
        text-align: left;
        outline: none;
        color: inherit;
        font-family: inherit;
        background: transparent;
        border: none;
        border-radius: 0;
        display: block;
        width: 100%;
      }

      .${className} a {
        color: #cde;
      }

      .${className}__field {
        position: relative;
        height: 30px;
        line-height: 31px;
        display: flex;
        flex-direction: row;
        background-color: ${PANEL_BG_COLOR};
      }

      .${className}__field:not(:first-child) {
        border-top: 1px solid ${DIVIDER_COLOR};
      }

      .${className}__field--raw {
        height: auto;
      }

      .${className}__field:hover {
        background-color: ${FIELD_HOVER_COLOR};
      }

      .${className}__sectionHeading:hover {
        background-color: ${SECTION_HEADING_HOVER_COLOR};
      }

      .${className}__sectionHeading > button::before {
        transform: translate(0, -1px) rotate(90deg);
      }

      .${className}__sectionHeading > button::before {
        content: '▲';
        display: inline-block;
        transform-origin: 50% 50%;
        margin-right: 0.5em;
        font-size: 0.5em;
        vertical-align: middle;
      }

      .${className}__section--expanded > .${className}__sectionHeading > button::before {
        transform: none;
        content: '▼';
      }

      .${className}__container {
        display: flex;
        flex-direction: row;
        align-content: stretch;
        justify-content: stretch;
      
        height: 30px;
        flex: 1;
        position: relative;
        align-items: center;
        position: relative;

        min-width: ${MIN_CONTROL_WIDTH};
        width: 30px;
        padding-right: 8px;
        text-indent: 8px;
      }

      .${className}__value {
        position: absolute;
        pointer-events: none;
        top: 0;
        z-index: 11;
        line-height: 31px;
        height: 30px;
        display: inline-block;
        right: 15px;
        text-shadow:  1px  0   rgba(0,0,0,0.3),
                      0    1px rgba(0,0,0,0.3),
                     -1px  0   rgba(0,0,0,0.3),
                      0   -1px rgba(0,0,0,0.3),
                      1px  1px rgba(0,0,0,0.3),
                      1px -1px rgba(0,0,0,0.3),
                     -1px  1px rgba(0,0,0,0.3),
                     -1px -1px rgba(0,0,0,0.3);
      }

      .${className}__field--button button {
        font-family: inherit;
        outline: none;
        cursor: pointer;
        text-align: center;
        display: block;
        background: transparent;
        color: inherit;
        font-size: 1.0em;
        width: 100%;
        border: none;
        border-radius: 0;
      }

      .${className}__field--button > button:hover {
        background-color: #444;
      }

      .${className}__field--button > button:active {
        background-color: #222;
      }

      .${className}__field--button > button:focus {
        ${FOCUS_BORDER}
      }

      .${className}__field--raw {
        padding: 5px 10px;
      }

      .${className}__rawContent {
        max-width: calc(${MIN_CONTROL_WIDTH} + ${MIN_LABEL_WIDTH} + 10px);
        margin: 0;
        padding: 0;
      }

      .${className}__rawContent pre {
        line-height: 1.3;
        font-size: 0.8em;
        margin: 0;
      }

      .${className}__rawContent > p:first-child {
        margin-top: 5px;
      }
      .${className}__rawContent > p:last-child{
        margin-bottom: 5px;
      }

      .${className}__sectionHeading {
        margin-left: -4px;
        user-select: none;
        text-indent: 5px;
        cursor: pointer;
        width: 100%;
        display: flex;

        background-color: ${SECTION_HEADING_BG_COLOR};
        height: ${SECTION_HEADING_HEIGHT};
        line-height: ${SECTION_HEADING_HEIGHT};
      }

      .${className}__section {
        margin: 0;
        padding: 0;
        border: none;
        margin-left: 4px;
      }

      .${className} p {
        line-height: 1.8;
      }

      .${className} label {
        user-select: none;
        text-indent: 8px;
        margin-right: 4px;
        display: inline-block;
        min-width: ${MIN_LABEL_WIDTH};
        line-height: 31px;
      }

      .${className} label::before,
      .${className}__field--button > button::before,
      .${className}__rawContent::before {
        content: '';
        width: 3px;
        background-color: red;
        display: inline-block;
        vertical-align: middle;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
      }

      .${className}__field--text label::before {
        background-color: #49f;
      }

      .${className}__field--color label::before {
        background-color: #94f;
      }

      .${className}__field--checkbox label::before {
        background-color: #f49;
      }

      .${className}__field--slider label::before {
        background-color: #f84;
      }

      .${className}__field--select label::before {
        background-color: #8f4;
      }

      .${className}__rawContent::before {
        background-color: #aaa;
      }

      .${className}__field--button > button::before {
        background-color: #8ff;
      }

      .${className}__field input[type="text"] {
        margin: 0;
        padding: 0 5px;
        border: none;
        height: ${SLIDER_HEIGHT};
        border-radius: 2px;
        background-color: ${CONTROL_BG_COLOR};
        border: 1px solid ${CONTROL_BORDER_COLOR};
        color: inherit;
      }

      .${className}__field input[type="checkbox"]:focus,
      .${className}__field input[type="text"]:focus,
      .${className}__field input[type="color"]:focus,
      .${className} select:focus {
        ${FOCUS_BORDER}
      }

      .${className}__field input[type="color"] {
        margin: 0;
        border: 1px solid #aaa;
        width: ${SLIDER_HEIGHT};
        height: ${SLIDER_HEIGHT};
        border-radius: 2px;
        padding: 0;
      }

      .${className}__field input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0px;
        background-color: #888;
      }

      .${className}__field input[type="checkbox"] {
        height: 20px;
        width: 20px;
        margin-bottom: 0.2em;
      }

      .${className}__field input[type="range"] {
        cursor: resize-ew;
        border: 1px solid ${CONTROL_BORDER_COLOR};
      }

      .${className} input,
      .${className} select {
        width: 100%;
        margin: .4rem;
      }

      .${className} select {
        background-color: ${CONTROL_BG_COLOR};
        color: inherit;
        border: 1px solid ${CONTROL_BORDER_COLOR};
        height: ${SLIDER_HEIGHT};
        margin: 0;
      }

      .${className} input[type=range] {
        -webkit-appearance: none;
        vertical-align: middle;
        border-radius: 2px;
      }

      .${className} input[type=range]::-webkit-slider-runnable-track {
        height: ${SLIDER_HEIGHT};
        cursor: ew-resize;
        background: ${ CONTROL_BG_COLOR };
      }

      .${className} input[type=range]::-webkit-slider-thumb {
        height: ${SLIDER_HEIGHT};
        width: ${SLIDER_HEIGHT};
        background: ${THUMB_COLOR};
        cursor: ew-resize;
        -webkit-appearance: none;
        margin-top: 0px;
      }

      .${className} input[type=range]:focus::-webkit-slider-runnable-track {
        background: ${ CONTROL_BG_COLOR };
        ${FOCUS_BORDER}
      }

      .${className} input[type=range]::-moz-range-track {
        height: ${SLIDER_HEIGHT};
        cursor: ew-resize;
        background: ${ CONTROL_BG_COLOR };
      }

      .${className} input[type=range]::-moz-range-thumb {
        height: ${SLIDER_HEIGHT};
        width: 10px;
        background: ${THUMB_COLOR};
        cursor: ew-resize;
      }

      .${className} input[type=range]::-ms-track {
        height: ${SLIDER_HEIGHT};
        cursor: ew-resize;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }

      .${className} input[type=range]::-ms-fill-lower {
        background: ${ CONTROL_BG_COLOR };
      }

      .${className} input[type=range]::-ms-fill-upper {
        background: ${ CONTROL_BG_COLOR };
      }

      .${className} input[type=range]::-ms-thumb {
        width: 10px;
        border-radius: 0;
        background: ${THUMB_COLOR};
        cursor: ew-resize;
        height: ${SLIDER_HEIGHT};
      }

      .${className} input[type=range]:focus::-ms-fill-lower {
        background: ${ CONTROL_BG_COLOR };
        ${FOCUS_BORDER}
      }

      .${className} input[type=range]:focus::-ms-fill-upper {
        background: ${ CONTROL_BG_COLOR };
        ${FOCUS_BORDER}
      }

      .${className} input[type=range] {
        -webkit-appearance: none;
        margin: 0;
      }

      .${className} input[type=range]:focus {
        ${FOCUS_BORDER}
      }

      .${className} input[type=range]::-webkit-slider-runnable-track {
        height: ${SLIDER_HEIGHT};
        cursor: ew-resize;
        background: ${ CONTROL_BG_COLOR };
      }
    `);
  }

  render(h(App, {
    state: state.$field.value,
  }), opts.root || document.body);

  return state.$field.value;
}

