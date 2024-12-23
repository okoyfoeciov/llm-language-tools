const path = require('path');

module.exports = {
  entry: {
    gpt4o: './src/gpt4o.js',
    gpt4omini: './src/gpt4omini.js', 
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'src'),
  },
  mode: 'production',
};