var createGui = require('./gui');
var createState = require('./index');

var state = window.state = createGui(createState({
  somename: createState.slider(10, {min: 0, max: 100, step: 0.1}),
  foo: 5,
  bar: 7,
  section1: {
    somename: createState.slider(10, {min: 0, max: 100, step: 0.1}),
    foo: 5,
    bar: 7,
  }
}));


