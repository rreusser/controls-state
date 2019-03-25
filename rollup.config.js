// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import browserifyPlugin from 'rollup-plugin-browserify-transform'
import es2020 from 'es2020'

export default [{
  input: 'index.js',
  output: 'dist/state.js',
}, {
  input: 'gui.js',
  output: 'dist/gui.js',
}].map(bundle => ({
  input: bundle.input,
  output: {
    file: bundle.output,
    format: 'cjs'
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    browserifyPlugin(es2020),
  ]
}));
