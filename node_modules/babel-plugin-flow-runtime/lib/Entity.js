'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = function () {
  function Entity() {
    _classCallCheck(this, Entity);

    this.type = 'Value';
  }

  _createClass(Entity, [{
    key: 'node',
    get: function get() {
      return this.path && this.path.node;
    }
  }, {
    key: 'scope',
    get: function get() {
      return this.path && this.path.scope;
    }
  }, {
    key: 'isTypeAlias',
    get: function get() {
      return this.type === 'TypeAlias';
    }
  }, {
    key: 'isImportedType',
    get: function get() {
      return this.type === 'ImportedType';
    }
  }, {
    key: 'isTypeParameter',
    get: function get() {
      return this.type === 'TypeParameter';
    }
  }, {
    key: 'isClassTypeParameter',
    get: function get() {
      return this.type === 'ClassTypeParameter';
    }
  }, {
    key: 'isValue',
    get: function get() {
      return this.type === 'Value';
    }
  }, {
    key: 'isGlobal',
    get: function get() {
      return this.path == null;
    }
  }]);

  return Entity;
}();

exports.default = Entity;