'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _Lint2 = require('../Lint');

var _Lint3 = _interopRequireDefault(_Lint2);

var _Versioning = require('../Versioning');

var _Versioning2 = _interopRequireDefault(_Versioning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line


exports.default = {
  meta: {
    docs: {
      description: 'Ensure cross-browser API compatibility',
      category: 'Compatibility',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    // Determine lowest targets from browserslist config, which reads user's
    var browserslistConfig = context.settings.browsers || context.settings.targets;

    var browserslistTargets = (0, _Versioning.Versioning)((0, _Versioning2.default)(browserslistConfig));

    function lint(node) {
      var _Lint = (0, _Lint3.default)(node, browserslistTargets, context.settings.polyfills ? new _set2.default(context.settings.polyfills) : undefined),
          isValid = _Lint.isValid,
          rule = _Lint.rule,
          unsupportedTargets = _Lint.unsupportedTargets;

      if (!isValid) {
        context.report({
          node,
          message: [(0, _Lint2.generateErrorName)(rule), 'is not supported in', unsupportedTargets.join(', ')].join(' ')
        });
      }
    }

    return {
      // HACK: Ideally, rules will be generated at runtime. Each rule will have
      //       have the ability to register itself to run on specific AST
      //       nodes. For now, we're using the `CallExpression` node since
      //       its what most rules will run on
      CallExpression: lint,
      MemberExpression: lint,
      NewExpression: lint
    };
  }
};
module.exports = exports['default'];