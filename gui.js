var preact = require('preact');
var createClass = require('./src/util/preact-classless-component');
var css = require('insert-css');
var toggleSlide = require('./src/util/toggle-slide');
var defaults = require('defaults');

module.exports = createGui;

function toPx (number) {
  number = '' + number;
  return /^[0-9\.\s]*$/.test(number) ? number + 'px' : number;
}

function createGui (state, opts) {
  opts = defaults(opts || {}, {
    containerCSS: "position:fixed;top:0;right:8px",
    style: true,
    className: `controlPanel-${Math.random().toString(36).substring(2, 15)}`,
  });

  var theme = Object.assign({}, defaults(opts.theme || {}, {
    fontFamily: "'Helvetica', sans-serif",
    fontSize: 13,
    sliderHeight: 22,
    controlBgColor: '#444',
    fieldBgColor: '#333',
    fieldHoverColor: '#383838',
    fieldActiveColor: '#383838',
    fieldBorderColor: '#232323',
    fieldHeight: 30,
    sectionHeadingBgColor: '#222',
    sectionHeadingHoverColor: '#444',
    sectionHeadingColor: '#e8e8e8',
    sectionHeadingBorderColor: '#222',
    controlBorderColor: '#666',
    sliderThumbColor: '#888',
    fontColor: '#e8e8e8',
    sectionHeadingHeight: 24,
    minLabelWidth: 110,
    minControlWidth: 130,
    visibilityFontColor: 'rgba(0, 0, 0, 0.3)',
    focusBorderColor: '#888',
    controlBorderRadius: 2,
  }));

  var className = opts.className;

  theme.fontSize = toPx(theme.fontSize);
  theme.sliderHeight = toPx(theme.sliderHeight);
  theme.fieldHeight = toPx(theme.fieldHeight);
  theme.sectionHeadingHeight = toPx(theme.sectionHeadingHeight);
  theme.minLabelWidth = toPx(theme.minLabelWidth);
  theme.minControlWidth = toPx(theme.minControlWidth);
  theme.controlBorderRadius = toPx(theme.controlBorderRadius);

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
        className: `${className}__field ${className}__field--select`,
      },
        h('label', {
          className: `${className}__label`,
          htmlFor: `${className}-${field.path}`
        },
          h('span', {
            className: `${className}__labelText`,
          }, config.label || field.name),
          ' ',
          h('span', {className: `${className}__container`},
            h('select', {
              name: field.path,
              id: `${className}-${field.path}`,
              onChange: event => this.props.field.value = event.target.value,
            }, field.options.map(option =>
              h('option', {
                value: option,
                selected: option === field.value
              }, option)
            ))
          ),
        )
      );
    }
  });

  var TextInput = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--text`,
      },
        h('label', {
          className: `${className}__label`,
          htmlFor: `${className}-${field.path}`
        },
          h('span', {
            className: `${className}__labelText`,
          }, config.label || field.name),
          ' ',
          h('span', {className: `${className}__container`},
            h('input', {
              id: `${className}-${field.path}`,
              name: field.path,
              type: 'text',
              value: field.value,
              onInput: event => this.props.field.value = event.target.value,
            })
          )
        )
      );
    }
  });

  var Checkbox = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--checkbox`,
      },
        h('label', {
          className: `${className}__label`,
          htmlFor: `${className}-${field.path}`,
        },
          h('span', {
            className: `${className}__labelText`,
          }, config.label || field.name),
          ' ',
          h('span', {className: `${className}__container`},
            h('input', {
              id: `${className}-${field.path}`,
              name: field.path,
              type: 'checkbox',
              checked: field.value,
              onInput: event => this.props.field.value = event.target.checked,
            })
          ),
        )
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
        className: `${className}__field ${className}__field--color`,
      },
        h('label', {
          className: `${className}__label`,
          htmlFor: `${className}-${field.path}`
        },
          h('span', {
            className: `${className}__labelText`,
          }, config.label || field.name),
          ' ',
          h('span', {className: `${className}__container`},
            h('input', {
              id: `${className}-${field.path}`,
              name: field.path,
              type: 'color',
              value: field.value,
              onInput: event => {
                this.props.field.value = event.target.value;
              }
            })
          ),
        )
      );
    }
  });

  var Slider = createClass({
    render: function () {
      var field = this.props.field;
      var config = field.$config;
      return h('div', {
        className: `${className}__field ${className}__field--slider`,
      },
        h('label', {
          className: `${className}__label`,
          htmlFor: `${className}-${field.path}`
        },
          h('span', {
            className: `${className}__labelText`,
          }, config.label || field.name),
          ' ',
          h('span', {className: `${className}__container`},
            h('input', {
              id: `${className}-${field.path}`,
              name: field.path,
              type: 'range',
              min: field.min,
              max: field.max,
              step: field.step,
              value: field.value,
              onInput: event => this.props.field.value = parseFloat(event.target.value)
            }),
            h('span', {className: `${className}__value`}, field.value.toFixed(4).replace(/\.?0*$/,'')) )
        )
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
      if (opts.containerCSS) {
        c.style.cssText = opts.containerCSS;
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

  if (opts.style) {
    var FOCUS_BORDER = `
      outline: none;
      border-color: ${theme.focusBorderColor};
      box-shadow: 0 0 3px ${theme.focusBorderColor};
    `;

    css(`
      .${className} {
        color: ${theme.fontColor};
        ${theme.fontSize ? `font-size: ${theme.fontSize}` : ''};
        ${theme.fontFamily ? `font-family: ${theme.fontFamily}` : ''};
      }

      .${className} > .${className}__section:first-child > .${className}__sectionHeading:first-child {
        border-right: 1px solid ${theme.sectionHeadingBorderColor};
      }

      .${className}__sectionHeading {
        padding: 0;
        font-family: inherit;
        user-select: none;
        -moz-user-select: -moz-none;
        text-indent: 5px;
        cursor: pointer;
        width: 100%;

        color: ${theme.sectionHeadingColor};
        background-color: ${theme.sectionHeadingBgColor};
        height: ${theme.sectionHeadingHeight};
        line-height: ${theme.sectionHeadingHeight};
      }

      .${className}__sectionHeading button:focus {
        background-color: ${theme.sectionHeadingHoverColor};
      }

      .${className}__sectionHeading > button {
        height: 100%;
        vertical-align: middle;
        font-size: 1.0em;
        cursor: pointer;
        text-align: left;
        outline: none;
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        background: transparent;
        border: none;
        border-radius: 0;
        display: block;
        width: 100%;
      }

      .${className}__field {
        position: relative;
        background-color: ${theme.fieldBgColor};
        border-right: 1px solid ${theme.fieldBorderColor};
      }

      .${className}__label {
        display: block;
        height: ${theme.fieldHeight};
        line-height: ${theme.fieldHeight};
        display: flex;
        flex-direction: row;
        background-color: ${theme.fieldBgColor};
      }

      .${className}__field--raw {
        height: auto;
      }

      .${className}__field:hover {
        background-color: ${theme.fieldHoverColor};
      }

      .${className}__sectionHeading:hover {
        background-color: ${theme.sectionHeadingHoverColor};
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
      
        height: ${theme.fieldHeight};
        flex: 1;
        position: relative;
        align-items: center;
        position: relative;

        min-width: ${theme.minControlWidth};
        width: ${theme.fieldHeight};
        padding-right: 8px;
        text-indent: 8px;
      }

      .${className}__value {
        position: absolute;
        pointer-events: none;
        top: 0;
        z-index: 11;
        line-height: ${theme.fieldHeight};
        height: ${theme.fieldHeight};
        display: inline-block;
        right: 15px;
        text-shadow:  1px  0   ${theme.visibilityFontColor},
                      0    1px ${theme.visibilityFontColor},
                     -1px  0   ${theme.visibilityFontColor},
                      0   -1px ${theme.visibilityFontColor},
                      1px  1px ${theme.visibilityFontColor},
                      1px -1px ${theme.visibilityFontColor},
                     -1px  1px ${theme.visibilityFontColor},
                     -1px -1px ${theme.visibilityFontColor};
      }

      .${className}__field--button button {
        height: ${theme.fieldHeight};
        font-size: inherit;
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
        background-color: ${theme.fieldHoverColor};
      }

      .${className}__field--button > button:active {
        background-color: ${theme.fieldActiveColor};
      }

      .${className}__field--button > button:focus {
        ${FOCUS_BORDER}
      }

      .${className}__field--raw {
        padding: 5px 7px 5px 10px;
      }

      .${className}__rawContent {
        max-width: 100%;
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

      .${className}__section {
        margin: 0;
        margin-top: -1px;
        padding: 0;
        border: none;
      }

      .${className}__sectionHeading {
        border: 1px solid ${theme.sectionHeadingBorderColor};
        position: relative;
        z-index: 1;
        box-sizing: border-box;
      }

      .${className}__sectionFields {
        margin-left: 4px;
        box-sizing: border-box;
      }

      .${className}__sectionFields .${className}__field {
        border-bottom: 1px solid ${theme.fieldBorderColor};
        box-sizing: border-box;
      }

      .${className}__sectionFields .${className}__sectionFields {
        border-right: none;
        margin-right: 0;
      }

      .${className} p {
        line-height: 1.8;
      }

      .${className}__labelText {
        user-select: none;
        -moz-user-select: -moz-none;
        text-indent: 8px;
        margin-right: 4px;
        display: inline-block;
        min-width: ${theme.minLabelWidth};
        line-height: ${theme.fieldHeight};
      }

      .${className}__field::before,
      .${className}__field--button > button::before,
      .${className}__rawContent::before {
        content: '';
        width: 3px;
        display: inline-block;
        vertical-align: middle;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
      }

      .${className}__field--text::before {
        background-color: #49f;
      }

      .${className}__field--color::before {
        background-color: #94f;
      }

      .${className}__field--checkbox::before {
        background-color: #f49;
      }

      .${className}__field--slider::before {
        background-color: #f84;
      }

      .${className}__field--select::before {
        background-color: #8f4;
      }

      .${className}__rawContent::before {
        background-color: #aaa;
      }

      .${className}__field--button > button::before {
        background-color: #8ff;
      }

      .${className}__field--text input[type=text] {
        font-size: inherit;
        font-family: inherit;
        width: 100%;
        margin: 0;
        padding: 0 5px;
        border: none;
        height: ${theme.sliderHeight};
        border-radius: ${theme.controlBorderRadius};
        background-color: ${theme.controlBgColor};
        border: 1px solid ${theme.controlBorderColor};
        color: inherit;
      }

      .${className}__field--checkbox input[type=checkbox]:focus,
      .${className}__field--text input[type=text]:focus,
      .${className}__field--color input[type=color]:focus,
      .${className} select:focus {
        ${FOCUS_BORDER}
      }

      .${className}__field--color input[type=color] {
        margin: 0;
        border: 1px solid #aaa;
        width: 50px;
        height: ${theme.sliderHeight};
        border-radius: ${theme.controlBorderRadius};
        padding: 0;
      }

      .${className}__field--color input[type=color]::-webkit-color-swatch-wrapper {
        padding: 0px;
        background-color: #888;
      }

      .${className}__field--checkbox input[type=checkbox] {
        height: 20px;
        width: 20px;
        margin-bottom: 0.2em;
      }

      .${className}__field--slider input[type=range] {
        cursor: resize-ew;
        border: 1px solid ${theme.controlBorderColor};
      }

      .${className}__field--select select {
        font-family: inherit;
        font-size: inherit;
        height: ${theme.sliderHeight};
        width: 100%;
        color: inherit;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: ${theme.controlBgColor};
        border: 1px solid ${theme.controlBorderColor};
        outline: none;
        margin: 0;
        padding: 0 5px;
        border-radius: ${theme.controlBorderRadius};
        background-image: linear-gradient(${theme.controlBorderColor}, ${theme.controlBorderColor}),
          linear-gradient(-130deg, transparent 50%, ${theme.controlBgColor} 52%),
          linear-gradient(-230deg, transparent 50%, ${theme.controlBgColor} 52%),
          linear-gradient(${theme.fontColor} 42%, ${theme.controlBgColor} 42%);
        background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
        background-size: 1px 100%, 20px 16px, 20px 16px, 20px 60%;
        background-position: right 20px center, right bottom, right bottom, right bottom;
      }

      .${className}__field--slider input[type=range] {
        width: 100%;
        height: ${theme.sliderHeight};
        -webkit-appearance: none;
        vertical-align: middle;
        border-radius: ${theme.controlBorderRadius};
        margin: 0;
      }

      .${className}__field--slider input[type=range]:focus {
        ${FOCUS_BORDER}
      }

      .${className}__field--slider input[type=range]::-webkit-slider-thumb {
        height: ${theme.sliderHeight};
        width: ${theme.sliderHeight};
        background: ${theme.sliderThumbColor};
        border-radius: 0;
        cursor: ew-resize;
        -webkit-appearance: none;
      }

      .${className}__field--slider input[type=range]::-moz-range-thumb {
        height: ${theme.sliderHeight};
        width: ${theme.sliderHeight};
        border-radius: 0;
        background: ${theme.sliderThumbColor};
        cursor: ew-resize;
      }

      .${className}__field--slider input[type=range]::-ms-thumb {
        height: ${theme.sliderHeight};
        width: ${theme.sliderHeight};
        border-radius: 0;
        background: ${theme.sliderThumbColor};
        cursor: ew-resize;
      }

      .${className}__field--slider input[type=range]::-webkit-slider-runnable-track {
        height: ${theme.sliderHeight};
        cursor: ew-resize;
        background: ${theme.controlBgColor};
      }

      .${className}__field--slider input[type=range]::-moz-range-track {
        height: ${theme.sliderHeight};
        cursor: ew-resize;
        background: ${theme.controlBgColor};
      }

      .${className}__field--slider input[type=range]::-ms-track {
        height: ${theme.sliderHeight};
        cursor: ew-resize;
        background: transparent;
        border-color: transparent;
        color: transparent;
      }

      .${className}__field--slider input[type=range]::-ms-fill-lower {
        background: ${theme.controlBgColor};
      }

      .${className}__field--slider input[type=range]::-ms-fill-upper {
        background: ${theme.controlBgColor};
      }

      .${className}__field--slider input[type=range]:focus::-ms-fill-lower {
        background: ${ theme.controlBgColor };
        ${FOCUS_BORDER}
      }

      .${className}__field--slider input[type=range]:focus::-ms-fill-upper {
        background: ${ theme.controlBgColor };
        ${FOCUS_BORDER}
      }

    `);
  }

  render(h(App, {
    state: state.$field.value,
  }), opts.root || document.body);

  return state;
}

