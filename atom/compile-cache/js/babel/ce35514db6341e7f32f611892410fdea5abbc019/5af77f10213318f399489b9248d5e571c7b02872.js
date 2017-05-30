Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atom = require('atom');

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _underscorePlus = require('underscore-plus');

'use babel';

var TypeView = require('./atom-ternjs-type-view');
var TOLERANCE = 20;

var Type = (function () {
  function Type() {
    _classCallCheck(this, Type);

    this.view = null;
    this.overlayDecoration = null;

    this.currentRange = null;
    this.currentViewData = null;

    this.destroyOverlayListener = this.destroyOverlay.bind(this);
  }

  _createClass(Type, [{
    key: 'init',
    value: function init() {

      this.view = new TypeView();
      this.view.initialize(this);

      atom.views.getView(atom.workspace).appendChild(this.view);

      _atomTernjsEvents2['default'].on('type-destroy-overlay', this.destroyOverlayListener);
    }
  }, {
    key: 'setPosition',
    value: function setPosition() {

      if (this.overlayDecoration) {

        return;
      }

      var editor = atom.workspace.getActiveTextEditor();

      if (!editor) {

        return;
      }

      var marker = editor.getLastCursor().getMarker();

      if (!marker) {

        return;
      }

      this.overlayDecoration = editor.decorateMarker(marker, {

        type: 'overlay',
        item: this.view,
        'class': 'atom-ternjs-type',
        position: 'tale',
        invalidate: 'touch'
      });
    }
  }, {
    key: 'queryType',
    value: function queryType(editor, e) {
      var _this = this;

      var rowStart = 0;
      var rangeBefore = false;
      var tmp = false;
      var may = 0;
      var may2 = 0;
      var skipCounter = 0;
      var skipCounter2 = 0;
      var paramPosition = 0;
      var position = e.newBufferPosition;
      var buffer = editor.getBuffer();

      if (position.row - TOLERANCE < 0) {

        rowStart = 0;
      } else {

        rowStart = position.row - TOLERANCE;
      }

      buffer.backwardsScanInRange(/\]|\[|\(|\)|\,|\{|\}/g, new _atom.Range([rowStart, 0], [position.row, position.column]), function (obj) {

        if (obj.matchText === '}') {

          may++;
          return;
        }

        if (obj.matchText === ']') {

          if (!tmp) {

            skipCounter2++;
          }

          may2++;
          return;
        }

        if (obj.matchText === '{') {

          if (!may) {

            rangeBefore = false;
            obj.stop();

            return;
          }

          may--;
          return;
        }

        if (obj.matchText === '[') {

          if (skipCounter2) {

            skipCounter2--;
          }

          if (!may2) {

            rangeBefore = false;
            obj.stop();
            return;
          }

          may2--;
          return;
        }

        if (obj.matchText === ')' && !tmp) {

          skipCounter++;
          return;
        }

        if (obj.matchText === ',' && !skipCounter && !skipCounter2 && !may && !may2) {

          paramPosition++;
          return;
        }

        if (obj.matchText === ',') {

          return;
        }

        if (obj.matchText === '(' && skipCounter) {

          skipCounter--;
          return;
        }

        if (skipCounter || skipCounter2) {

          return;
        }

        if (obj.matchText === '(' && !tmp) {

          rangeBefore = obj.range;
          obj.stop();

          return;
        }

        tmp = obj.matchText;
      });

      if (!rangeBefore) {

        this.currentViewData = null;
        this.currentRange = null;
        this.destroyOverlay();

        return;
      }

      if (rangeBefore.isEqual(this.currentRange)) {

        this.currentViewData && this.setViewData(this.currentViewData, paramPosition);

        return;
      }

      this.currentRange = rangeBefore;
      this.currentViewData = null;
      this.destroyOverlay();

      _atomTernjsManager2['default'].client.update(editor).then(function () {

        _atomTernjsManager2['default'].client.type(editor, rangeBefore.start).then(function (data) {

          if (!data || !data.type.startsWith('fn') || !data.exprName) {

            return;
          }

          _this.currentViewData = data;

          _this.setViewData(data, paramPosition);
        })['catch'](function (error) {

          // most likely the type wasn't found. ignore it.
        });
      });
    }
  }, {
    key: 'setViewData',
    value: function setViewData(data, paramPosition) {

      var viewData = (0, _underscorePlus.deepClone)(data);
      var type = (0, _atomTernjsHelper.prepareType)(viewData);
      var params = (0, _atomTernjsHelper.extractParams)(type);
      (0, _atomTernjsHelper.formatType)(viewData);

      if (params && params[paramPosition]) {

        viewData.type = viewData.type.replace(params[paramPosition], '<span class="text-info">' + params[paramPosition] + '</span>');
      }

      if (viewData.doc && _atomTernjsPackageConfig2['default'].options.inlineFnCompletionDocumentation) {

        viewData.doc = viewData.doc && viewData.doc.replace(/(?:\r\n|\r|\n)/g, '<br />');
        viewData.doc = (0, _atomTernjsHelper.prepareInlineDocs)(viewData.doc);

        this.view.setData(viewData.type, viewData.doc);
      } else {

        this.view.setData(viewData.type);
      }

      this.setPosition();
    }
  }, {
    key: 'destroyOverlay',
    value: function destroyOverlay() {

      if (this.overlayDecoration) {

        this.overlayDecoration.destroy();
      }

      this.overlayDecoration = null;
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      _atomTernjsEvents2['default'].off('destroy-type-overlay', this.destroyOverlayListener);

      this.destroyOverlay();

      if (this.view) {

        this.view.destroy();
        this.view = null;
      }
    }
  }]);

  return Type;
})();

exports['default'] = new Type();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtdHlwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O2lDQUtvQix1QkFBdUI7Ozs7dUNBQ2pCLDhCQUE4Qjs7OztnQ0FDcEMsc0JBQXNCOzs7O29CQUN0QixNQUFNOztnQ0FNbkIsc0JBQXNCOzs4QkFFTCxpQkFBaUI7O0FBaEJ6QyxXQUFXLENBQUM7O0FBRVosSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDcEQsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDOztJQWVmLElBQUk7QUFFRyxXQUZQLElBQUksR0FFTTswQkFGVixJQUFJOztBQUlOLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7O0FBRTlCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDOztBQUU1QixRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDOUQ7O2VBWEcsSUFBSTs7V0FhSixnQkFBRzs7QUFFTCxVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDM0IsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNCLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUxRCxvQ0FBUSxFQUFFLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7S0FDakU7OztXQUVVLHVCQUFHOztBQUVaLFVBQUksSUFBSSxDQUFD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QUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pGLGdCQUFRLENBQUMsR0FBRyxHQUFHLHlDQUFrQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRS9DLFlBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BRWhELE1BQU07O0FBRUwsWUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2xDOztBQUVELFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1dBRWEsMEJBQUc7O0FBRWYsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7O0FBRTFCLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNsQzs7QUFFRCxVQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0tBQy9COzs7V0FFTSxtQkFBRzs7QUFFUixvQ0FBUSxHQUFHLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7O0FBRWpFLFVBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFdEIsVUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFOztBQUViLFlBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEIsWUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7T0FDbEI7S0FDRjs7O1NBclFHLElBQUk7OztxQkF3UUssSUFBSSxJQUFJLEVBQUUiLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy10eXBlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IFR5cGVWaWV3ID0gcmVxdWlyZSgnLi9hdG9tLXRlcm5qcy10eXBlLXZpZXcnKTtcbmNvbnN0IFRPTEVSQU5DRSA9IDIwO1xuXG5pbXBvcnQgbWFuYWdlciBmcm9tICcuL2F0b20tdGVybmpzLW1hbmFnZXInO1xuaW1wb3J0IHBhY2thZ2VDb25maWcgZnJvbSAnLi9hdG9tLXRlcm5qcy1wYWNrYWdlLWNvbmZpZyc7XG5pbXBvcnQgZW1pdHRlciBmcm9tICcuL2F0b20tdGVybmpzLWV2ZW50cyc7XG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIHByZXBhcmVUeXBlLFxuICBwcmVwYXJlSW5saW5lRG9jcyxcbiAgZXh0cmFjdFBhcmFtcyxcbiAgZm9ybWF0VHlwZVxufSBmcm9tICcuL2F0b20tdGVybmpzLWhlbHBlcic7XG5cbmltcG9ydCB7ZGVlcENsb25lfSBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5jbGFzcyBUeXBlIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy5vdmVybGF5RGVjb3JhdGlvbiA9IG51bGw7XG5cbiAgICB0aGlzLmN1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50Vmlld0RhdGEgPSBudWxsO1xuXG4gICAgdGhpcy5kZXN0cm95T3ZlcmxheUxpc3RlbmVyID0gdGhpcy5kZXN0cm95T3ZlcmxheS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaW5pdCgpIHtcblxuICAgIHRoaXMudmlldyA9IG5ldyBUeXBlVmlldygpO1xuICAgIHRoaXMudmlldy5pbml0aWFsaXplKHRoaXMpO1xuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZCh0aGlzLnZpZXcpO1xuXG4gICAgZW1pdHRlci5vbigndHlwZS1kZXN0cm95LW92ZXJsYXknLCB0aGlzLmRlc3Ryb3lPdmVybGF5TGlzdGVuZXIpO1xuICB9XG5cbiAgc2V0UG9zaXRpb24oKSB7XG5cbiAgICBpZiAodGhpcy5vdmVybGF5RGVjb3JhdGlvbikge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgaWYgKCFlZGl0b3IpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0TWFya2VyKCk7XG5cbiAgICBpZiAoIW1hcmtlcikge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vdmVybGF5RGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcblxuICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgaXRlbTogdGhpcy52aWV3LFxuICAgICAgY2xhc3M6ICdhdG9tLXRlcm5qcy10eXBlJyxcbiAgICAgIHBvc2l0aW9uOiAndGFsZScsXG4gICAgICBpbnZhbGlkYXRlOiAndG91Y2gnXG4gICAgfSk7XG4gIH1cblxuICBxdWVyeVR5cGUoZWRpdG9yLCBlKSB7XG5cbiAgICBsZXQgcm93U3RhcnQgPSAwO1xuICAgIGxldCByYW5nZUJlZm9yZSA9IGZhbHNlO1xuICAgIGxldCB0bXAgPSBmYWxzZTtcbiAgICBsZXQgbWF5ID0gMDtcbiAgICBsZXQgbWF5MiA9IDA7XG4gICAgbGV0IHNraXBDb3VudGVyID0gMDtcbiAgICBsZXQgc2tpcENvdW50ZXIyID0gMDtcbiAgICBsZXQgcGFyYW1Qb3NpdGlvbiA9IDA7XG4gICAgY29uc3QgcG9zaXRpb24gPSBlLm5ld0J1ZmZlclBvc2l0aW9uO1xuICAgIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcblxuICAgIGlmIChwb3NpdGlvbi5yb3cgLSBUT0xFUkFOQ0UgPCAwKSB7XG5cbiAgICAgIHJvd1N0YXJ0ID0gMDtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHJvd1N0YXJ0ID0gcG9zaXRpb24ucm93IC0gVE9MRVJBTkNFO1xuICAgIH1cblxuICAgIGJ1ZmZlci5iYWNrd2FyZHNTY2FuSW5SYW5nZSgvXFxdfFxcW3xcXCh8XFwpfFxcLHxcXHt8XFx9L2csIG5ldyBSYW5nZShbcm93U3RhcnQsIDBdLCBbcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW5dKSwgKG9iaikgPT4ge1xuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJ30nKSB7XG5cbiAgICAgICAgbWF5Kys7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5tYXRjaFRleHQgPT09ICddJykge1xuXG4gICAgICAgIGlmICghdG1wKSB7XG5cbiAgICAgICAgICBza2lwQ291bnRlcjIrKztcbiAgICAgICAgfVxuXG4gICAgICAgIG1heTIrKztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJ3snKSB7XG5cbiAgICAgICAgaWYgKCFtYXkpIHtcblxuICAgICAgICAgIHJhbmdlQmVmb3JlID0gZmFsc2U7XG4gICAgICAgICAgb2JqLnN0b3AoKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heS0tO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmoubWF0Y2hUZXh0ID09PSAnWycpIHtcblxuICAgICAgICBpZiAoc2tpcENvdW50ZXIyKSB7XG5cbiAgICAgICAgICBza2lwQ291bnRlcjItLTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbWF5Mikge1xuXG4gICAgICAgICAgcmFuZ2VCZWZvcmUgPSBmYWxzZTtcbiAgICAgICAgICBvYmouc3RvcCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heTItLTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJyknICYmICF0bXApIHtcblxuICAgICAgICBza2lwQ291bnRlcisrO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvYmoubWF0Y2hUZXh0ID09PSAnLCcgJiYgIXNraXBDb3VudGVyICYmICFza2lwQ291bnRlcjIgJiYgIW1heSAmJiAhbWF5Mikge1xuXG4gICAgICAgIHBhcmFtUG9zaXRpb24rKztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJywnKSB7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJygnICYmIHNraXBDb3VudGVyKSB7XG5cbiAgICAgICAgc2tpcENvdW50ZXItLTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2tpcENvdW50ZXIgfHwgc2tpcENvdW50ZXIyKSB7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLm1hdGNoVGV4dCA9PT0gJygnICYmICF0bXApIHtcblxuICAgICAgICByYW5nZUJlZm9yZSA9IG9iai5yYW5nZTtcbiAgICAgICAgb2JqLnN0b3AoKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRtcCA9IG9iai5tYXRjaFRleHQ7XG4gICAgfSk7XG5cbiAgICBpZiAoIXJhbmdlQmVmb3JlKSB7XG5cbiAgICAgIHRoaXMuY3VycmVudFZpZXdEYXRhID0gbnVsbDtcbiAgICAgIHRoaXMuY3VycmVudFJhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMuZGVzdHJveU92ZXJsYXkoKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChyYW5nZUJlZm9yZS5pc0VxdWFsKHRoaXMuY3VycmVudFJhbmdlKSkge1xuXG4gICAgICB0aGlzLmN1cnJlbnRWaWV3RGF0YSAmJiB0aGlzLnNldFZpZXdEYXRhKHRoaXMuY3VycmVudFZpZXdEYXRhLCBwYXJhbVBvc2l0aW9uKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFJhbmdlID0gcmFuZ2VCZWZvcmU7XG4gICAgdGhpcy5jdXJyZW50Vmlld0RhdGEgPSBudWxsO1xuICAgIHRoaXMuZGVzdHJveU92ZXJsYXkoKTtcblxuICAgIG1hbmFnZXIuY2xpZW50LnVwZGF0ZShlZGl0b3IpLnRoZW4oKCkgPT4ge1xuXG4gICAgICBtYW5hZ2VyLmNsaWVudC50eXBlKGVkaXRvciwgcmFuZ2VCZWZvcmUuc3RhcnQpLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgIWRhdGEgfHxcbiAgICAgICAgICAhZGF0YS50eXBlLnN0YXJ0c1dpdGgoJ2ZuJykgfHxcbiAgICAgICAgICAhZGF0YS5leHByTmFtZVxuICAgICAgICApIHtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VycmVudFZpZXdEYXRhID0gZGF0YTtcblxuICAgICAgICB0aGlzLnNldFZpZXdEYXRhKGRhdGEsIHBhcmFtUG9zaXRpb24pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcblxuICAgICAgICAvLyBtb3N0IGxpa2VseSB0aGUgdHlwZSB3YXNuJ3QgZm91bmQuIGlnbm9yZSBpdC5cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0Vmlld0RhdGEoZGF0YSwgcGFyYW1Qb3NpdGlvbikge1xuXG4gICAgY29uc3Qgdmlld0RhdGEgPSBkZWVwQ2xvbmUoZGF0YSk7XG4gICAgY29uc3QgdHlwZSA9IHByZXBhcmVUeXBlKHZpZXdEYXRhKTtcbiAgICBjb25zdCBwYXJhbXMgPSBleHRyYWN0UGFyYW1zKHR5cGUpO1xuICAgIGZvcm1hdFR5cGUodmlld0RhdGEpO1xuXG4gICAgaWYgKHBhcmFtcyAmJiBwYXJhbXNbcGFyYW1Qb3NpdGlvbl0pIHtcblxuICAgICAgdmlld0RhdGEudHlwZSA9IHZpZXdEYXRhLnR5cGUucmVwbGFjZShwYXJhbXNbcGFyYW1Qb3NpdGlvbl0sIGA8c3BhbiBjbGFzcz1cInRleHQtaW5mb1wiPiR7cGFyYW1zW3BhcmFtUG9zaXRpb25dfTwvc3Bhbj5gKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB2aWV3RGF0YS5kb2MgJiZcbiAgICAgIHBhY2thZ2VDb25maWcub3B0aW9ucy5pbmxpbmVGbkNvbXBsZXRpb25Eb2N1bWVudGF0aW9uXG4gICAgKSB7XG5cbiAgICAgIHZpZXdEYXRhLmRvYyA9IHZpZXdEYXRhLmRvYyAmJiB2aWV3RGF0YS5kb2MucmVwbGFjZSgvKD86XFxyXFxufFxccnxcXG4pL2csICc8YnIgLz4nKTtcbiAgICAgIHZpZXdEYXRhLmRvYyA9IHByZXBhcmVJbmxpbmVEb2NzKHZpZXdEYXRhLmRvYyk7XG5cbiAgICAgIHRoaXMudmlldy5zZXREYXRhKHZpZXdEYXRhLnR5cGUsIHZpZXdEYXRhLmRvYyk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICB0aGlzLnZpZXcuc2V0RGF0YSh2aWV3RGF0YS50eXBlKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gIH1cblxuICBkZXN0cm95T3ZlcmxheSgpIHtcblxuICAgIGlmICh0aGlzLm92ZXJsYXlEZWNvcmF0aW9uKSB7XG5cbiAgICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24uZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMub3ZlcmxheURlY29yYXRpb24gPSBudWxsO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcblxuICAgIGVtaXR0ZXIub2ZmKCdkZXN0cm95LXR5cGUtb3ZlcmxheScsIHRoaXMuZGVzdHJveU92ZXJsYXlMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmRlc3Ryb3lPdmVybGF5KCk7XG5cbiAgICBpZiAodGhpcy52aWV3KSB7XG5cbiAgICAgIHRoaXMudmlldy5kZXN0cm95KCk7XG4gICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgVHlwZSgpO1xuIl19