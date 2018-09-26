'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fixturesDir = _path2.default.join(__dirname, '__fixtures__');

var INCLUDE_PATTERN = process.env.TEST_FILTER ? new RegExp(process.env.TEST_FILTER) : null;

function findFiles(dirname, filenames) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _fs2.default.readdirSync(dirname)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var filename = _step.value;

      var qualified = _path2.default.join(dirname, filename);
      if (/\.js$/.test(filename)) {
        filenames.push(qualified.slice(fixturesDir.length + 1, -3));
      } else {
        var stat = _fs2.default.statSync(qualified);
        if (stat.isDirectory()) {
          findFiles(qualified, filenames);
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return filenames;
}

function filterIncluded(filename) {
  if (INCLUDE_PATTERN) {
    return INCLUDE_PATTERN.test(filename);
  } else {
    return true;
  }
}

var files = findFiles(fixturesDir, []);

var fixtures = new Map(files.filter(filterIncluded).map(function (filename) {
  // Ignore
  return [filename, require('./__fixtures__/' + filename)];
}));

exports.default = fixtures;