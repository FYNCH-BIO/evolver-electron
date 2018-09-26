'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _flowConfigParser = require('flow-config-parser');

var _flowConfigParser2 = _interopRequireDefault(_flowConfigParser);

var _util = require('./util');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator(function* () {
    var startDir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();

    var dirname = startDir;
    while (dirname) {
      try {
        var filename = _path2.default.join(dirname, '.flowconfig');
        var stat = yield _util.fs.statAsync(filename);
        if (stat.isFile()) {
          var content = _util.fs.readFileAsync(filename, 'utf8');
          return (0, _flowConfigParser2.default)(content);
        }
      } catch (e) {
        // do nothing
      }
      var next = _path2.default.dirname(dirname);
      if (next === dirname) {
        return false;
      } else {
        dirname = next;
      }
    }
  });

  function loadFlowConfig() {
    return _ref.apply(this, arguments);
  }

  return loadFlowConfig;
}();