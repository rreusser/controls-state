var test = require('tape');
var Controls = require('./');
var raf = require('raf');

test('controls', function (t) {
  t.test('field types', function (t) {
    t.test('a string is type textinput', function (t) {
      var c = Controls({foo: 'bar'});
      t.equal(c.$path.foo.type, 'textinput');
      t.end();
    });
  });

  t.test('injecting context', function (t) {
    t.test('injects context into already-instantiated controls', function (t) {
      var s = Controls.Slider({value: 1});
      t.equal(s.path, null);
      var c = Controls({foo: s});
      t.equal(c.$path.foo.path, 'foo');
      t.end();
    });

    t.test('throw if you pass the same control multiple times', function (t) {
      t.throws(function () {
        var slider = Controls.Slider();
        Controls({foo: slider, bar: slider});
      }, /You may only add an field to a set of controls once\./);
      t.end();
    });
  });

  t.test('paths', function (t) {
    t.test('fields with a dot throw', function (t) {
      t.throws(function () {
        Controls({'foo.bar': 5});
      }, /may not contain a period/);
      t.end();
    });

    t.test('top level paths', function (t) {
      var c = Controls({foo: 5, bar: 'test'});
      t.equal(c.$path.foo.path, 'foo');
      t.equal(c.$path.bar.path, 'bar');
      t.end();
    });

    t.test('dereferencing a section with $field', function (t) {
      var c = Controls({size: {width: 480}});
      t.equal(c.$path.size.$field.path, 'size');
      t.end();
    });

    t.test('accessing a doubly nested field via $path', function (t) {
      var c = Controls({size: {width: 480}});
      t.equal(c.$path.size.width.path, 'size.width');
      t.end();
    });

    t.test('trivially dereferencing a nested field with $field', function (t) {
      var c = Controls({size: {width: 480}});
      t.equal(c.$path.size.width.$field.path, 'size.width');
      t.end();
    });

    t.test('nested paths', function (t) {
      var c = Controls({shape: {size: {width: 480}}});
      t.equal(c.$path.shape.$field.path, 'shape');
      t.equal(c.$path.shape.size.$field.path, 'shape.size');
      t.equal(c.$path.shape.size.width.path, 'shape.size.width');
      t.equal(c.$path.shape.size.width.$field.path, 'shape.size.width');
      t.end();
    });

    t.test('a section gets a name', function (t) {
      var c = Controls({foo: {name: 'baz'}});
      t.equal(c.$path.foo.$field.name, 'foo');
      t.equal(c.$path.foo.name.$field.name, 'name');
      t.end();
    });

    t.test('getting the field object of the top-level section', function (t) {
      var c = Controls({foo: {name: 'baz'}});
      t.equal(c.$field.name, '');
      t.equal(c.$field.path, null);
      t.end();
    });
  });

  t.test('getting values', function (t) {
    t.test('initializes top-level properties', function (t) {
      var c = Controls({foo: 5, bar: 'test'});
      t.equal(c.foo, 5);
      t.equal(c.bar, 'test');
      t.end();
    });

    t.test('initializes nested properties', function (t) {
      var c = Controls({shape: {width: 640, height: 480}});
      t.equal(c.shape.width, 640);
      t.equal(c.shape.height, 480);
      t.end();
    });
  });

  t.test('accessing controls', function (t) {
    t.test('accessing top level controls', function (t) {
      var c = Controls({foo: 5, bar: 'test'});
      t.equal(c.$path.foo.value, 5);
      t.equal(c.$path.bar.value, 'test');
      t.end();
    });

    t.test('accessing nested controls', function (t) {
      var c = Controls({foo: 5, bar: {baz: 'test'}});
      t.equal(c.$path.foo.value, 5);
      t.equal(c.$path.bar.baz.value, 'test');
      t.end();
    });
  });

  t.test('enumeration', function (t) {
    t.test('exposes properties as enumerable', function (t) {
      var c = Controls({foo: 5, bar: 'test'});
      t.deepEqual(Object.keys(c), ['foo', 'bar']);
      t.end();
    });

    t.test('exposes nested properties as enumerable', function (t) {
      var c = Controls({shape: {width: 640, height: 480}});
      t.deepEqual(Object.keys(c.shape), ['width', 'height']);
      t.end();
    });
  });

  t.test('setting values', function (t) {
    t.test('setting a top-level property', function (t) {
      var c = Controls({foo: 5});
      t.equal(c.foo, 5);
      c.foo = 7;
      t.equal(c.foo, 7);
      t.end();
    });

    t.test('setting a nested property', function (t) {
      var c = Controls({shape: {width: 640}});
      t.equal(c.shape.width, 640);
      c.shape.width = 1024;
      t.equal(c.shape.width, 1024);
      t.end();
    });
  });

  t.test('events', function (t) {
    t.test('unbound components can have events attached', function (t) {
      var field = Controls.Slider(5);
      callCount = 0;
      field.onBeforeChange(function () {
        callCount++;
      });
      field.value = 10;
      t.equal(callCount, 1);
      t.end();
    });

    t.test('accepts event handlers on instantiated components', function (t) {
      t.test('emits nested change events', function (t) {
        var c = Controls({
          shape: {
            width: Controls.Slider(120)
          }
        });

        var called = false;
        c.$field.onChanges(function (updates) {
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

    t.test('emits onChange events', function (t) {
      var c = Controls({foo: 5});

      var called = false;
      c.$path.foo.onChange(function (event) {
        t.equal(event.field, c.$path.foo);
        t.equal(event.name, 'foo');
        t.equal(event.fullPath, 'foo');
        t.equal(event.path, '');
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
      var c = Controls({shape: {width: 120}});

      var called = false;
      c.$path.shape.width.onChange(function (event) {
        t.equal(event.field, c.$path.shape.width);
        t.equal(event.name, 'width');
        t.equal(event.path, '');
        t.equal(event.fullPath, 'shape.width');
        t.equal(event.oldValue, 120);
        t.equal(event.value, 240);
        called = true;
      });

      c.shape.width = 240;

      raf(function () {
        t.equal(called, true);
        t.end();
      });
    });

    t.test('can subscribe to events on sections', function (t) {
      var c = Controls({shape: {width: 120}});

      var callCount = 0;
      c.shape.$onChange(function (event) {
        t.equal(event.field, c.$path.shape.width);
        t.equal(event.fullPath, 'shape.width');
        t.equal(event.name, 'width');
        t.equal(event.path, 'width');
        t.equal(event.oldValue, 120);
        t.equal(event.value, 240);
        callCount++;
      });

      c.shape.width = 240;

      raf(function () {
        t.equal(callCount, 1);
        t.end();
      });
    });

    t.test('emits change events', function (t) {
      var c = Controls({foo: 5});

      var called = false;
      c.$onChanges(function (updates) {
        t.equal(updates.foo.field, c.$path.foo);
        t.equal(updates.foo.path, 'foo');
        t.equal(updates.foo.fullPath, 'foo');
        t.equal(updates.foo.name, 'foo');
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
      var c = Controls({shape: {width: 120}});

      var called = false;
      c.$onChanges(function (updates) {
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
      var c = Controls({shape: {width: 320, height: 240}});

      var callCount = 0;
      c.$onChanges(function (updates) {
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

  t.test('an unbound slider field', function (t) {
    t.test('creation', function (t) {
      var slider = Controls.Slider(5, {
        min: -1,
        max: 10,
        step: 2
      });

      t.equal(slider.type, 'slider');
      t.equal(slider.value, 5);
      t.equal(slider.min, -1);
      t.equal(slider.max, 10);
      t.equal(slider.step, 2);

      t.end();
    });

    t.test('has a null parent', function (t) {
      var slider = Controls.Slider(5);
      t.equal(slider.parent, null);
      t.end();
    });

    t.test('with a value', function (t) {
      var slider = Controls.Slider(5);

      t.equal(slider.type, 'slider');
      t.equal(slider.value, 5);
      t.equal(slider.min, 0);
      t.equal(slider.max, 5);
      t.equal(slider.step, 1);

      t.end();
    });

    t.test('with defaults', function (t) {
      var slider = Controls.Slider();

      t.equal(slider.type, 'slider');
      t.equal(slider.value, 0);
      t.equal(slider.min, 0);
      t.equal(slider.max, 1);
      t.equal(slider.step, 1);

      t.end();
    });

    t.test('can attach events', function (t) {
      var slider = Controls.Slider({name: 'foo'});
      var callCount = 0;
      slider.onBeforeChanges(function (updates) {
        callCount++;
      });
      slider.value = 7;
      t.equal(callCount, 1);
      t.end();
    });
  });
});
