'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getTypeParameters;


/**
 * Get an array of type parameters from the given path.
 */
function getTypeParameters(path) {
  var node = path.node;
  if (node && node.typeParameters && node.typeParameters.params) {
    return path.get('typeParameters.params');
  } else {
    return [];
  }
}