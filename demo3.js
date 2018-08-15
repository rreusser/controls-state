var Gui = require('./gui');
var Controls = require('./index');
var h = require('h');
var beautify = require('json-beautify');

require('insert-css')(`
.docs {
  width: calc(100% - 405px);
  max-width: 600px;
  margin: 15px;
  font-family: 'Helvetica', sans-serif;
}

.docs pre {
  background-color: #eee;
  margin-left: 15px;
  padding: 15px;
}

.debug {
  position: fixed;
  top: 415px;
  right: 0;
  width: 350px;
  background-color: #eee;
  white-space: pre-wrap;
  padding: 15px;
}
`);

document.body.append(h('div.docs', [
  h('p', 'The panel is coupled to the gui on the right. To see this, you can open up the console and query and modify its state directly.'),
  h('p', 'The panel to the right is created with the code:'),
  h('pre', h('code', `window.controls = Gui(Controls({
  name: 'test',
  simulation: {
    running: true,
    iterations: 5,
    method: Controls.Select('RK4', {
      options: ['Euler', 'RK2', 'RK4']
    }),
    shape: {
      width: 640,
      height: 480
    }
  },
  analysis: {
    cost: Controls.Slider(1, {
      min: 0,
      max: 1,
      step: 0.01
    }),
    benefit: Controls.Slider(0, {
      min: 0,
      max: 1,
      step: 0.01
    })
  }
}));`)),
  h('p', 'Open up the inspector console and try accessing the property values with, for example,'),
  h('pre', h('code', `> controls.name
"test"

> controls.simulation.shape.width
640`)),

  h('p', 'You can also set values and the panel will update:'),
  h('pre', h('code', `> controls.simulation.running = false
false`)),

  h('p', 'You can subscribe to events on sections instead of just individual fields by expanding the implicit section definition into an object. That is, the shape section,'),
  h('pre', h('code', `shape: {
  width: 640,
  height: 480
}`)),
  h('p', 'becomes'),
  h('pre', h('code', `shape: Controls.Section({
  width: 640,
  height: 480
}).onFinishChanges(function (updates) {
  console.log(updates);
  // Resize your simulation here
})`)),
  h('p', 'You can even accomplish fancy effects like coupling two fields together.'),
  h('pre', h('code', `analysis: Controls.Section({
  cost: Controls.Slider(1, {
    min: 0,
    max: 1,
    step: 0.01
  }),
  benefit: Controls.Slider(0, {
    min: 0,
    max: 1,
    step: 0.01
  })
}).onFinishChanges(updates => {
  if (updates['analysis.cost']) {
    controls.analysis.benefit = 1 - controls.analysis.cost;
  } else {
    controls.analysis.cost = 1 - controls.analysis.benefit;
  }
})`)),

  h('p', 'The API and corresponding documentation isn\'t stable or complete. Suggestsions are welcome'),
]));

function resize () {
  console.log('resize!');
}

function balance () {
  controls.analysis.cost = 1 - controls.analysis.benefit;
  console.log('balance!');
}

window.controls = Gui(Controls({
  name: 'test',
  simulation: {
    running: true,
    iterations: 5,
    method: Controls.Select('RK4', {
      options: ['Euler', 'RK2', 'RK4']
    }),
    shape: Controls.Section({
      width: 640,
      height: 480
    }).onFinishChanges(() => console.log('resize!')),
  },
  analysis: Controls.Section({
    cost: Controls.Slider(1, {
      min: 0,
      max: 1,
      step: 0.01
    }),
    benefit: Controls.Slider(0, {
      min: 0,
      max: 1,
      step: 0.01
    })
  }).onFinishChanges(updates => {
    if (updates['analysis.cost']) {
      controls.analysis.benefit = 1 - controls.analysis.cost;
    } else {
      controls.analysis.cost = 1 - controls.analysis.benefit;
    }
  })
}))

function getJSON () {
  return beautify(controls, null, 2, 0);
}
controls.$field.onFinishChanges(() => debugNode.textContent = getJSON());

var debugNode = h('code');
document.body.append(h('pre.debug', debugNode));

debugNode.textContent = getJSON();
