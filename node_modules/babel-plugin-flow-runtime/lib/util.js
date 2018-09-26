'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fs = undefined;
exports.promisify = promisify;

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = exports.fs = Object.keys(_fs3.default).reduce(function (memo, key) {
  memo[key + 'Async'] = promisify(_fs3.default[key]);
  return memo;
}, {});

function promisify(fn) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      function callback(err, data) {
        if (err) return reject(err);
        resolve(data);
      }
      fn.apply(undefined, [].concat(args, [callback]));
    });
  };
}