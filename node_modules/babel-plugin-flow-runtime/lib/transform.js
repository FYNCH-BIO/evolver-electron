'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _collectProgramOptions = require('./collectProgramOptions');

var _collectProgramOptions2 = _interopRequireDefault(_collectProgramOptions);

var _firstPassVisitors = require('./firstPassVisitors');

var _firstPassVisitors2 = _interopRequireDefault(_firstPassVisitors);

var _patternMatchVisitors = require('./patternMatchVisitors');

var _patternMatchVisitors2 = _interopRequireDefault(_patternMatchVisitors);

var _annotateVisitors = require('./annotateVisitors');

var _annotateVisitors2 = _interopRequireDefault(_annotateVisitors);

var _preTransformVisitors = require('./preTransformVisitors');

var _preTransformVisitors2 = _interopRequireDefault(_preTransformVisitors);

var _transformVisitors = require('./transformVisitors');

var _transformVisitors2 = _interopRequireDefault(_transformVisitors);

var _createConversionContext = require('./createConversionContext');

var _createConversionContext2 = _interopRequireDefault(_createConversionContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transform(input) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var scope = arguments[2];
  var state = arguments[3];
  var parentPath = arguments[4];

  var context = (0, _createConversionContext2.default)(options);
  if (!(0, _collectProgramOptions2.default)(context, input)) {
    return input;
  }
  (0, _babelTraverse2.default)(input, (0, _firstPassVisitors2.default)(context), scope, state, parentPath);
  (0, _babelTraverse2.default)(input, (0, _patternMatchVisitors2.default)(context), scope, state, parentPath);
  if (context.shouldAnnotate) {
    context.isAnnotating = true;
    (0, _babelTraverse2.default)(input, (0, _annotateVisitors2.default)(context), scope, state, parentPath);
    context.isAnnotating = false;
    context.visited = new WeakSet();
  }
  (0, _babelTraverse2.default)(input, (0, _preTransformVisitors2.default)(context), scope, state, parentPath);
  (0, _babelTraverse2.default)(input, (0, _transformVisitors2.default)(context), scope, state, parentPath);

  return input;
}