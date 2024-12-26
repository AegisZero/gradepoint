const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
  },
  target: 'node',
  plugins: [
    new CopyWebpackPlugin({
        patterns: [
            {from: 'templates', to: 'templates'},
            {from: 'input', to: 'input"'},
            {from: 'output', to: 'output'}
        ]
    })
]
};