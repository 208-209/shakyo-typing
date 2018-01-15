module.exports = {
  context: __dirname + '/app',
  entry: ['./entry', './ajax', './typing'],
  output: {
    path: __dirname + '/public/javascripts',
    filename: 'bundle.js'
  }
};