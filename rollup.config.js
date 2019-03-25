// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import browserifyPlugin from 'rollup-plugin-browserify-transform'
import brfs from 'brfs'
import es2020 from 'es2020'

export default {
  input: 'index.js',
  output: {
    file: 'dist/control-panel-2.js',
    format: 'cjs'
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    browserifyPlugin(brfs),
    browserifyPlugin(es2020),
  ]
};
