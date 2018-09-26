'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rules = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _KangaxProvider = require('./KangaxProvider');

var _KangaxProvider2 = _interopRequireDefault(_KangaxProvider);

var _CanIUseProvider = require('./CanIUseProvider');

var _CanIUseProvider2 = _interopRequireDefault(_CanIUseProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rules = exports.rules = [].concat((0, _toConsumableArray3.default)(_KangaxProvider2.default), (0, _toConsumableArray3.default)(_CanIUseProvider2.default));

exports.default = {};