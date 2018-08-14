var test = require('tape');
var controls = require('./');
var raf = require('raf');

test('controls', function (t) {
  t.test('injecting context', function (t) {
    t.test('injects context into already-instantiated controls', function (t) {
      var s = controls.slider({value: 1})
      t.equal(s.path, null);
      var c = controls({foo: s});
      t.equal(c.$path.foo.path, 'foo');
      t.end();
    });

    t.test('throw if you pass the same control multiple times', function (t) {
      t.throws(function () {
        var slider = controls.slider();
        controls({foo: slider, bar: slider});
      }, /You may only add an field to a set of controls once\./);
      t.end();
    });
  });

  t.test('paths', function (t) {
    t.test('fields with a dot throw', function (t) {
      t.throws(function () {
        var c = controls({'foo.bar': 5});
      }, /may not contain a period/);
      t.end();
    });

    t.test('top level paths', function (t) {
      var c = controls({foo: 5, bar: 'test'});
      t.equal(c.$path.foo.path, 'foo');
      t.equal(c.$path.bar.path, 'bar');
      t.end();
    });

    t.test('nested paths', function (t) {
      var c = controls({foo: 5, shape: {size: {width: 480}}});
      t.equal(c.$path.foo.path, 'foo');
      t.equal(c.$path.shape.size.width.path, 'shape.size.width');
      t.end();
    });
  });

  t.test('getting values', function (t) {
    t.test('initializes top-level properties', function (t) {
      var c = controls({foo: 5, bar: 'test'});
      t.equal(c.foo, 5);
      t.equal(c.bar, 'test');
      t.end();
    });

    t.test('initializes nested properties', function (t) {
      var c = controls({shape: {width: 640, height: 480}});
      t.equal(c.shape.width, 640);
      t.equal(c.shape.height, 480);
      t.end();
    });
  });

  t.test('accessing controls', function (t) {
    t.test('accessing top level controls', function (t) {
      var c = controls({foo: 5, bar: 'test'});
      t.equal(c.$path.foo.value, 5);
      t.equal(c.$path.bar.value, 'test');
      t.end();
    });

    t.test('accessing nested controls', function (t) {
      var c = controls({foo: 5, bar: {baz: 'test'}});
      t.equal(c.$path.foo.value, 5);
      t.equal(c.$path.bar.baz.value, 'test');
      t.end();
    });
  });

  t.test('enumeration', function (t) {
    t.test('exposes properties as enumerable', function (t) {
      var c = controls({foo: 5, bar: 'test'});
      t.deepEqual(Object.keys(c), ['foo', 'bar']);
      t.end();
    });

    t.test('exposes nested properties as enumerable', function (t) {
      var c = controls({shape: {width: 640, height: 480}});
      t.deepEqual(Object.keys(c.shape), ['width', 'height']);
      t.end();
    });
  });

  t.test('setting values', function (t) {
    t.test('setting a top-level property', function (t) {
      var c = controls({foo: 5});
      t.equal(c.foo, 5);
      c.foo = 7;
      t.equal(c.foo, 7);
      t.end();
    });

    /*
    t.test('setting a nested property', function (t) {
      var c = controls({shape: {width: 640}});
      t.equal(c.shape.width, 640);
      c.shape.width = 1024;
      t.equal(c.shape.width, 1024);
      t.end();
    });
    */
  });
  return t.end();

  t.test('context', function (t) {
    t.test('unbound components have no context', function (t) {
      var field = controls.slider(5);
      t.equal(field.context, null);
      t.end();
    });

    t.test('using a component injects context', function (t) {
      var field = controls.slider(5);
      var c = controls({width: field});
      t.notEqual(field.context, null);
      t.equal(c.$field.context, field.context.parentContext);
      t.end();
    });

    t.test('context.field points to the component object', function (t) {
      var field = controls.slider(5);
      var c = controls({width: field});
      t.equal(field.context.field, field);
      t.equal(c.$field, c.$field.context.field);
      t.end();
    });
  });

  t.test('events', function (t) {
    t.test('unbound components can have events attached', function (t) {
      var field = controls.slider(5);
      callCount = 0;
      field.onChange(function () {
        callCount++;
      });
      field.value = 10;
      t.equal(callCount, 1);
      t.end();
    });

    return t.end();
    t.test('accepts event handlers on instantiated components', function (t) {
      t.test('emits nested change events', function (t) {
        var c = controls({
          shape: {
            width: controls.slider(120)
          }
        });
        console.log('c.$path.shape.width:', c.$path.shape.width);

        var called = false;
        c.$field.onFinishChanges(function (updates) {
          t.equal(updates['shape.width'].value, 240);
          called = true;
        });

        c.shape.width = 240;

        raf(function () {
          t.equal(called, true);
          t.end();
        });
      });
    });

    t.test('emits change:path events', function (t) {
      var c = controls({foo: 5});

      var called = false;
      c.$path.foo.onFinishChange(function (event) {
        t.equal(event.field, c.$path.foo);
        t.equal(event.path, 'foo');
        t.equal(event.oldValue, 5);
        t.equal(event.value, 7);
        called = true;
      });

      c.foo = 7;

      raf(function () {
        t.equal(called, true);
        t.end();
      });
    });
    
    t.test('emits nested change:path events', function (t) {
      var c = controls({shape: {width: 120}});

      var called = false;
      c.$path.shape.width.onFinishChange(function (event) {
        t.equal(event.field, c.$path.shape.width);
        t.equal(event.path, 'shape.width');
        t.equal(event.oldValue, 120);
        t.equal(event.value, 240);
        called = true;
      });

      c.shape.width = 240;

      raf(function (){ 
        t.equal(called, true);
        t.end();
      });
    });
    
    t.test('can subscribe to events on sections', function (t) {
      var c = controls({shape: {width: 120}});

      var callCount = 0;
      c.$path.shape.onFinishChange(function (event) {
        t.equal(event.field, c.$path.shape.width);
        t.equal(event.path, 'shape.width');
        t.equal(event.oldValue, 120);
        t.equal(event.value, 240);
        callCount++;
      });

      c.shape.width = 240;

      raf(function (){ 
        t.equal(callCount, 1);
        t.end();
      });
    });

    t.test('emits change events', function (t) {
      var c = controls({foo: 5});

      var called = false;
      c.$field.onFinishChanges(function (updates) {
        t.equal(updates.foo.field, c.$path.foo);
        t.equal(updates.foo.path, 'foo');
        t.equal(updates.foo.value, 7);
        t.equal(updates.foo.oldValue, 5);
        called = true;
      });

      c.foo = 7;

      raf(function () {
        t.equal(called, true);
        t.end();
      });
    });
    
    t.test('emits nested change events', function (t) {
      var c = controls({shape: {width: 120}});

      var called = false;
      c.$field.onFinishChanges(function (updates) {
        t.equal(updates['shape.width'].value, 240);
        called = true;
      });

      c.shape.width = 240;

      raf(function () {
        t.equal(called, true);
        t.end();
      });
    });

    t.test('emits batched updates', function (t) {
      var c = controls({shape: {width: 320, height: 240}});

      var callCount = 0;
      c.$field.onFinishChanges(function (updates) {
        callCount++;
        t.equal(updates['shape.width'].oldValue, 320);
        t.equal(updates['shape.width'].value, 1024);
        t.equal(updates['shape.height'].oldValue, 240);
        t.equal(updates['shape.height'].value, 800);
      });

      c.shape.width = 1024;
      c.shape.height = 768;
      c.shape.height = 800;
      t.equal(callCount, 0);

      raf(function () {
        t.equal(callCount, 1);
        t.end();
      });
    });
  });

  return t.end();

  t.test('slider field', function (t) {
    t.test('creation', function (t) {
      var slider = controls.slider(5, {
        min: -1,
        max: 10,
        step: 2,
      });

      t.equal(slider.type, 'slider');
      t.equal(slider.value, 5);
      t.equal(slider.min, -1);
      t.equal(slider.max, 10);
      t.equal(slider.step, 2);

      t.end();
    });

    t.test('with a value', function (t) {
      var slider = controls.slider(5);

      t.equal(slider.type, 'slider');
      t.equal(slider.value, 5);
      t.equal(slider.min, 0);
      t.equal(slider.max, 5);
      t.equal(slider.step, 1);

      t.end();
    });

    t.test('with defaults', function (t) {
      var slider = controls.slider();

      t.equal(slider.type, 'slider');
      t.equal(slider.value, 0);
      t.equal(slider.min, 0);
      t.equal(slider.max, 1);
      t.equal(slider.step, 1);

      t.end();
    });
  });
});
