var Controls = require('../index');

var slider = Controls.Slider({
  value: 5,
  min: 0,
  max: 10,
  step: 1
});

var folder = new Controls.Section({
  width: 640,
  height: 480
});

var state = Controls({
  color: '#ff0000',
  name: 'test',
  count: 7,
  activated: true,
  shape: {
    width: 640,
    height: 480
  },
  steps: slider,
  contents: folder,
  resolution: Controls.Slider({
    value: 5,
    min: 0,
    max: 10,
    step: 1
  }),
  bgcolor: Controls.Color('#000'),
  fgcolor: Controls.Color(),
  running: Controls.Checkbox(false)
});

console.log('state.color:', state.color);
console.log('state.name:', state.name);
console.log('state.count:', state.count);
console.log('state.activated:', state.activated);
console.log('state.steps:', state.steps);
console.log('state.shape.width:', state.shape.width);
console.log('state.shape.height:', state.shape.height);
console.log('state.resolution:', state.resolution);
console.log('state.bgcolor:', state.bgcolor);
console.log('state.fgcolor:', state.fgcolor);
console.log('state.running:', state.running);
console.log('state.contents.width:', state.contents.width);
console.log('state.contents.height:', state.contents.height);
