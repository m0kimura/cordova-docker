Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _atomTernjsProvider = require('./atom-ternjs-provider');

var _atomTernjsProvider2 = _interopRequireDefault(_atomTernjsProvider);

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsHyperclickProvider = require('./atom-ternjs-hyperclick-provider');

var _atomTernjsHyperclickProvider2 = _interopRequireDefault(_atomTernjsHyperclickProvider);

'use babel';

var AtomTernjs = (function () {
  function AtomTernjs() {
    _classCallCheck(this, AtomTernjs);

    this.config = _config2['default'];
  }

  _createClass(AtomTernjs, [{
    key: 'activate',
    value: function activate() {

      _atomTernjsManager2['default'].activate();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {

      _atomTernjsManager2['default'].destroy();
    }
  }, {
    key: 'provide',
    value: function provide() {

      return _atomTernjsProvider2['default'];
    }
  }, {
    key: 'provideHyperclick',
    value: function provideHyperclick() {

      return _atomTernjsHyperclickProvider2['default'];
    }
  }]);

  return AtomTernjs;
})();

exports['default'] = new AtomTernjs();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFeUIsVUFBVTs7OztrQ0FDZCx3QkFBd0I7Ozs7aUNBQ3pCLHVCQUF1Qjs7Ozs0Q0FDcEIsbUNBQW1DOzs7O0FBTDFELFdBQVcsQ0FBQzs7SUFPTixVQUFVO0FBRUgsV0FGUCxVQUFVLEdBRUE7MEJBRlYsVUFBVTs7QUFJWixRQUFJLENBQUMsTUFBTSxzQkFBZSxDQUFDO0dBQzVCOztlQUxHLFVBQVU7O1dBT04sb0JBQUc7O0FBRVQscUNBQVEsUUFBUSxFQUFFLENBQUM7S0FDcEI7OztXQUVTLHNCQUFHOztBQUVYLHFDQUFRLE9BQU8sRUFBRSxDQUFDO0tBQ25COzs7V0FFTSxtQkFBRzs7QUFFUiw2Q0FBZ0I7S0FDakI7OztXQUVnQiw2QkFBRzs7QUFFbEIsdURBQWtCO0tBQ25COzs7U0F6QkcsVUFBVTs7O3FCQTRCRCxJQUFJLFVBQVUsRUFBRSIsImZpbGUiOiIvaG9tZS9raW11cmEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBkZWZhdWxDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHByb3ZpZGVyIGZyb20gJy4vYXRvbS10ZXJuanMtcHJvdmlkZXInO1xuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1tYW5hZ2VyJztcbmltcG9ydCBoeXBlcmNsaWNrIGZyb20gJy4vYXRvbS10ZXJuanMtaHlwZXJjbGljay1wcm92aWRlcic7XG5cbmNsYXNzIEF0b21UZXJuanMge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgdGhpcy5jb25maWcgPSBkZWZhdWxDb25maWc7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcblxuICAgIG1hbmFnZXIuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG5cbiAgICBtYW5hZ2VyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHByb3ZpZGUoKSB7XG5cbiAgICByZXR1cm4gcHJvdmlkZXI7XG4gIH1cblxuICBwcm92aWRlSHlwZXJjbGljaygpIHtcbiAgICBcbiAgICByZXR1cm4gaHlwZXJjbGljaztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQXRvbVRlcm5qcygpO1xuIl19