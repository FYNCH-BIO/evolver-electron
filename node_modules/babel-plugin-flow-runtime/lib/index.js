'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTypeParameters = exports.findIdentifiers = exports.transform = undefined;
exports.default = babelPluginFlowRuntime;

var _createConversionContext = require('./createConversionContext');

var _createConversionContext2 = _interopRequireDefault(_createConversionContext);

var _collectProgramOptions = require('./collectProgramOptions');

var _collectProgramOptions2 = _interopRequireDefault(_collectProgramOptions);

var _attachImport = require('./attachImport');

var _attachImport2 = _interopRequireDefault(_attachImport);

var _firstPassVisitors = require('./firstPassVisitors');

var _firstPassVisitors2 = _interopRequireDefault(_firstPassVisitors);

var _annotateVisitors = require('./annotateVisitors');

var _annotateVisitors2 = _interopRequireDefault(_annotateVisitors);

var _patternMatchVisitors = require('./patternMatchVisitors');

var _patternMatchVisitors2 = _interopRequireDefault(_patternMatchVisitors);

var _preTransformVisitors = require('./preTransformVisitors');

var _preTransformVisitors2 = _interopRequireDefault(_preTransformVisitors);

var _transformVisitors = require('./transformVisitors');

var _transformVisitors2 = _interopRequireDefault(_transformVisitors);

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

var _findIdentifiers = require('./findIdentifiers');

var _findIdentifiers2 = _interopRequireDefault(_findIdentifiers);

var _getTypeParameters = require('./getTypeParameters');

var _getTypeParameters2 = _interopRequireDefault(_getTypeParameters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function babelPluginFlowRuntime() {
  return {
    visitor: {
      Program: function Program(path, state) {
        var opts = state.opts;

        var context = (0, _createConversionContext2.default)(opts || {});
        if (!(0, _collectProgramOptions2.default)(context, path.node)) {
          return;
        }
        path.traverse((0, _firstPassVisitors2.default)(context));
        if (context.shouldImport) {
          // We need to do this here because the Program visitor
          // in firstPassVisitors will never receive a node as
          // we're already travsersing a Program.
          (0, _attachImport2.default)(context, path);
        }
        path.traverse((0, _patternMatchVisitors2.default)(context));
        if (context.shouldAnnotate) {
          context.isAnnotating = true;
          path.traverse((0, _annotateVisitors2.default)(context));
          context.isAnnotating = false;
          context.visited = new WeakSet();
        }
        path.traverse((0, _preTransformVisitors2.default)(context));
        path.traverse((0, _transformVisitors2.default)(context));
      }
    }
  };
}

exports.transform = _transform2.default;
exports.findIdentifiers = _findIdentifiers2.default;
exports.getTypeParameters = _getTypeParameters2.default;