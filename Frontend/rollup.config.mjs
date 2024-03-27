// rollup.config.mjs
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'static/js/main.js',
	output: {
		file: 'static/js/bundle.js', // Use dir instead of file
		format: 'es'
	},
    plugins: [
        nodeResolve(),
        commonjs() // No need to specify namedExports anymore, it's handled automatically
    ]
};
