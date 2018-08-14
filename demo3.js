var Gui = require('./gui');
var Controls = require('./index');

window.state = Gui(Controls({
  somename: Controls.Slider(10, {min: 0, max: 100, step: 0.1}),
  foo: 5,
  bar: 7,
  section1: {
    somename: Controls.Slider(10, {min: 0, max: 100, step: 0.1}),
    foo: 5,
    bar: 7,
    name: 'test',
    section2: {
      width: 640,
      height: 480
    },
    section3: Controls.Section({
      cost: Controls.Slider(1, {min: 0, max: 1, step: 0.01}),
      benefit: Controls.Slider(0, {min: 0, max: 1, step: 0.01}).onChanges(console.log)
    }).onChanges(console.log)
  }
}));
