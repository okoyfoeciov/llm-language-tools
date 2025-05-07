const path = require('path');

module.exports = {
  entry: {
    dich: './src/dich.js', 
    paraphrase: './src/paraphrase.js', 
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, "src"),
  },
  mode: 'production',
};
