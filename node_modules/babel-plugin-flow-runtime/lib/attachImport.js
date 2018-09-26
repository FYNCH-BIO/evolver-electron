'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = attachImport;

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function attachImport(context, program) {

  var importDeclaration = t.importDeclaration([t.importDefaultSpecifier(t.identifier(context.libraryId))], t.stringLiteral(context.libraryName));

  importDeclaration.importKind = 'value';

  context.shouldImport = false;

  var last = void 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = program.get('body')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      if (item.isDirective() || item.isImportDeclaration()) {
        last = item;
        continue;
      }

      item.insertBefore(importDeclaration);
      return;
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

  if (last) {
    last.insertAfter(importDeclaration);
  } else {
    program.get('body').unshiftContainer('body', importDeclaration);
  }
}