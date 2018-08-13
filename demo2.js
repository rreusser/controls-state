var controls = require('./');

var state = window.state = controls({
  // It can try to infer types:
  background: '#ff0000',
  
  // You can instantiate controls manually to provide more configuration
  alpha: controls.slider(0.5, {min: 0, max: 1, step: 0.01}),

  // Objects result in nested sections:
  shape: {
    width: 640,
    height: 480,
  }
});

console.log('alpha:', state.alpha); // -> 0.5
console.log('width:', state.shape.width); // -> 640
console.log('shape.height:', state.shape.height); // -> 480

// Via the $field property, you can access the underlying objects
console.log(state.$field.shape.width)
// -> Slider {
//      type: 'slider',
//      name: 'width',
//      min: 0,
//      max: 640,
//      step: 1 }

// Subscribing to batched events:
state.$config.onFinishChanges(function (changes) {
  console.log('finish changes:', changes);
  // Once the updates below are applied, on the next tick this
  // function will be called with changes:
  //
  // changes = {
  //  'shape.width': {
  //    field: Slider { ... }
  //    name: 'width',
  //    path: 'shape.width',
  //    oldValue: 480,
  //    value: 500
  //  },
  //  'shape.height': {
  //    field: Slider { ... }
  //    name: 'height',
  //    path: 'shape.height',
  //    oldValue: 480,
  //    value: 500
  //  }
  // }
});

state.$config.onFinishChange('shape.width', function (update) {
  console.log('finish change: shape.width', update);
});

state.$config.onChange('shape.width', function (update) {
  console.log('change shape.width', update);
});

state.$config.onChanges(function (update) {
  console.log('changes:', update);
});

state.shape.width = 400;
state.shape.height = 400;
state.shape.height = 500;

