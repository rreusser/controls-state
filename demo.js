var controls = require('./');

var slider = controls.slider({
  value: 5,
  min: 0,
  max: 10,
  step: 1,
});

var folder = new controls.folder({
  width: 640,
  height: 480
});

var panel = controls({
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
  resolution: controls.slider({
    value: 5,
    min: 0,
    max: 10,
    step: 1
  }),
  bgcolor: controls.color({
    value: '#000'
  }),
  fgcolor: controls.color(),
  running: controls.checkbox({
    value: false,
  })
});

console.log('controls.color:', panel.color);
console.log('controls.name:', panel.name);
console.log('controls.count:', panel.count);
console.log('controls.activated:', panel.activated);
console.log('controls.steps:', panel.steps);
console.log('controls.shape.width:', panel.shape.width);
console.log('controls.shape.height:', panel.shape.height);
console.log('controls.resolution:', panel.resolution);
console.log('controls.bgcolor:', panel.bgcolor);
console.log('controls.fgcolor:', panel.fgcolor);
console.log('controls.running:', panel.running);
console.log('controls.contents.width:', panel.contents.width);
console.log('controls.contents.height:', panel.contents.height);
