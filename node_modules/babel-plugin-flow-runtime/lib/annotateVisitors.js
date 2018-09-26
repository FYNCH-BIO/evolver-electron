'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateVisitors;

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _convert = require('./convert');

var _convert2 = _interopRequireDefault(_convert);

var _hasTypeAnnotations = require('./hasTypeAnnotations');

var _hasTypeAnnotations2 = _interopRequireDefault(_hasTypeAnnotations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function annotateVisitors(context) {
  return {
    Function: {
      exit: function exit(path) {
        if (context.shouldSuppressPath(path) || context.visited.has(path.node) || path.isClassMethod() || path.isObjectMethod()) {
          path.skip();
          return;
        }
        context.visited.add(path.node);
        if (!(0, _hasTypeAnnotations2.default)(path)) {
          return;
        }

        var extractedName = path.isArrowFunctionExpression() && extractFunctionName(path);
        if (extractedName) {
          path.arrowFunctionToShadowed();
          path.node.id = t.identifier(extractedName);
        }

        var typeCall = (0, _convert2.default)(context, path);

        // Capture the data from the scope, as it
        // may be overwritten by the replacement.
        var scopeData = path.get('body').scope.data;

        if (path.isExpression()) {
          var replacement = context.call('annotate', path.node, typeCall);
          context.replacePath(path, replacement);
          // Refetch the replaced node
          var body = path.get('body');
          body.scope.data = Object.assign(scopeData, body.scope.data);
        } else if (path.has('id')) {
          var _replacement = t.expressionStatement(context.call('annotate', path.node.id, typeCall));
          if (path.parentPath.isExportDefaultDeclaration() || path.parentPath.isExportDeclaration()) {
            path.parentPath.insertAfter(_replacement);
          } else {
            path.insertAfter(_replacement);
          }
        } else if (path.isFunctionDeclaration() && path.parentPath.isExportDefaultDeclaration()) {
          // @fixme - this is not nice, we just turn the declaration into an expression.
          path.node.type = 'FunctionExpression';
          path.node.expression = true;
          var _replacement2 = t.exportDefaultDeclaration(context.call('annotate', path.node, typeCall));
          context.replacePath(path.parentPath, _replacement2);

          // Refetch the replaced node
          var _body = path.get('body');
          _body.scope.data = Object.assign(scopeData, _body.scope.data);
        } else {
          console.warn('Could not annotate function with parent node:', path.parentPath.type);
        }
      }
    },

    Class: {
      exit: function exit(path) {
        if (context.shouldSuppressPath(path)) {
          path.skip();
          return;
        }
        var typeCall = (0, _convert2.default)(context, path);
        var decorator = t.decorator(context.call('annotate', typeCall));
        if (!path.has('decorators')) {
          path.node.decorators = [];
        }
        path.unshiftContainer('decorators', decorator);
      }
    }
  };
}


function extractFunctionName(path) {
  var id = void 0;
  if (path.parentPath.type === 'VariableDeclarator') {
    id = path.parentPath.node.id;
  } else if (path.parentPath.type === 'AssignmentExpression') {
    id = path.parentPath.node.left;
  } else {
    return;
  }

  if (id.type === 'Identifier') {
    return id.name;
  } else if (id.type === 'MemberExpression' && !id.computed) {
    return id.property.name;
  }
}