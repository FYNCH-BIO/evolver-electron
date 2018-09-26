'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hasTypeAnnotations;
function hasTypeAnnotations(path) {
  if (path.has('typeAnnotation') || path.has('typeParameters')) {
    return true;
  } else if (path.isFunction()) {
    if (path.has('returnType')) {
      return true;
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = path.get('params')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var param = _step.value;

        if (hasTypeAnnotations(param)) {
          return true;
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

    return false;
  } else if (path.isClass()) {
    return path.has('superTypeParameters') || path.has('implements');
  } else if (path.isAssignmentPattern()) {
    return hasTypeAnnotations(path.get('left'));
  } else {
    return false;
  }
}