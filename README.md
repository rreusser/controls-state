# control-panel-2

## Introduction

Created to start addressing the challenges and common patterns observed in similar projects like [control-panel](https://www.npmjs.com/package/control-panel) and [dat.gui](https://github.com/dataarts/dat.gui). Heavily inspired by the proxy-based interface [proposed by Matt DesLauriers](https://twitter.com/mattdesl/status/1018541276340187136)—exept with out actual proxies for the sake of compatibility.

## Example

```javascript
var controls = require('./');

var state = controls({
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

console.log(state.alpha); // -> 0.5
console.log(state.shape.width); // -> 640
console.log(state.shape.height); // -> 480

// Via the $field property, you can access objects directly
console.log(state.$field.shape.width)
// -> SliderField {
//      type: 'slider',
//      name: 'width',
//      min: 0,
//      max: 640,
//      step: 1 }

// Subscribing to batched events:
state.$config.on('finishChanges', function (changes) {
  console.log('finishChanges:', changes);
  // Once the updates below are applied, on the next tick this
  // function will be called with changes:
  //
  // changes = {
  //  'shape.width': {
  //    field: SliderField { ... }
  //    name: 'width',
  //    path: 'shape.width',
  //    oldValue: 480,
  //    value: 500
  //  },
  //  'shape.height': {
  //    field: SliderField { ... }
  //    name: 'height',
  //    path: 'shape.height',
  //    oldValue: 480,
  //    value: 500
  //  }
  // }
});

state.$config.on('finishChange:shape.width', function (update) {
  console.log('finishChange:shape.width', update);
});

state.shape.width = 400;
state.shape.height = 400;
state.shape.height = 500;
```

## License

&copy 2018 Ricky Reusser. MIT License.
