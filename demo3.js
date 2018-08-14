var Gui = require('./gui');
var Controls = require('./index');

window.state = Gui(Controls({
  somename: Controls.Slider(10, {min: 0, max: 100, step: 0.1}),
  method: Controls.Select('RK4', {options: ['Euler', 'RK2', 'RK3', 'RK4']}),
  simulation: {
    activated: true,
    foo: 5,
    bar: 7,
    name: 'test',
    shape: {
      width: 640,
      height: 480
    },
  },
  analysis: Controls.Section({
    cost: Controls.Slider(1, {min: 0, max: 1, step: 0.01}),
    benefit: Controls.Slider(0, {min: 0, max: 1, step: 0.01}).onChanges(console.log)
  }).onChanges(console.log)
}));
