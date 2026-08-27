import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/thread-mesh-card.js',
  output: {
    file: 'dist/thread-mesh-card.js',
    format: 'iife',
    name: 'ThreadMeshCard',
    sourcemap: false
  },
  plugins: [
    resolve()
  ]
};
