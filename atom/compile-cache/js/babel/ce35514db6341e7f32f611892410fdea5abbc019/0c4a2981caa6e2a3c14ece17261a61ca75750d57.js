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

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _underscorePlus = require('underscore-plus');

'use babel';

var Function = require('loophole').Function;
var REGEXP_LINE = /(([\$\w]+[\w-]*)|([.:;'"[{( ]+))$/g;

var Provider = (function () {
  function Provider() {
    _classCallCheck(this, Provider);

    this.disposables = [];

    this.force = false;

    // automcomplete-plus
    this.selector = '.source.js';
    this.disableForSelector = '.source.js .comment';
    this.inclusionPriority = 1;
    this.suggestionPriority = _atomTernjsPackageConfig2['default'].options.snippetsFirst ? null : 2;
    this.excludeLowerPriority = _atomTernjsPackageConfig2['default'].options.excludeLowerPriorityProviders;

    this.suggestionsArr = null;
    this.suggestion = null;
    this.suggestionClone = null;
  }

  _createClass(Provider, [{
    key: 'init',
    value: function init() {

      this.registerCommands();
    }
  }, {
    key: 'registerCommands',
    value: function registerCommands() {

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:startCompletion', this.forceCompletion.bind(this)));
    }
  }, {
    key: 'isValidPrefix',
    value: function isValidPrefix(prefix, prefixLast) {

      if (prefixLast === undefined) {

        return false;
      }

      if (prefixLast === '\.') {

        return true;
      }

      if (prefixLast.match(/;|\s/)) {

        return false;
      }

      if (prefix.length > 1) {

        prefix = '_' + prefix;
      }

      try {

        new Function('var ' + prefix)();
      } catch (e) {

        return false;
      }

      return true;
    }
  }, {
    key: 'checkPrefix',
    value: function checkPrefix(prefix) {

      if (/(\(|\s|;|\.|\"|\')$/.test(prefix) || prefix.replace(/\s/g, '').length === 0) {

        return '';
      }

      return prefix;
    }
  }, {
    key: 'getPrefix',
    value: function getPrefix(editor, bufferPosition) {

      var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      var matches = line.match(REGEXP_LINE);

      return matches && matches[0];
    }
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(_ref) {
      var _this = this;

      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var scopeDescriptor = _ref.scopeDescriptor;
      var prefix = _ref.prefix;
      var activatedManually = _ref.activatedManually;

      if (!_atomTernjsManager2['default'].client) {

        return [];
      }

      var tempPrefix = this.getPrefix(editor, bufferPosition) || prefix;

      if (!this.isValidPrefix(tempPrefix, tempPrefix[tempPrefix.length - 1]) && !this.force && !activatedManually) {

        return [];
      }

      return new Promise(function (resolve) {

        prefix = _this.checkPrefix(tempPrefix);

        _atomTernjsManager2['default'].client.update(editor).then(function (data) {

          if (!data) {

            return resolve([]);
          }

          _atomTernjsManager2['default'].client.completions(atom.project.relativizePath(editor.getURI())[1], {

            line: bufferPosition.row,
            ch: bufferPosition.column

          }).then(function (data) {

            if (!data) {

              return resolve([]);
            }

            if (!data.completions.length) {

              return resolve([]);
            }

            _this.suggestionsArr = [];

            var scopesPath = scopeDescriptor.getScopesArray();
            var isInFunDef = scopesPath.indexOf('meta.function.js') > -1;

            for (var obj of data.completions) {

              obj = (0, _atomTernjsHelper.formatTypeCompletion)(obj, data.isProperty, data.isObjectKey, isInFunDef);

              _this.suggestion = {

                text: obj.name,
                replacementPrefix: prefix,
                className: null,
                type: obj._typeSelf,
                leftLabel: obj.leftLabel,
                snippet: obj._snippet,
                displayText: obj._displayText,
                description: obj.doc || null,
                descriptionMoreURL: obj.url || null
              };

              if (_atomTernjsPackageConfig2['default'].options.useSnippetsAndFunction && obj._hasParams) {

                _this.suggestionClone = (0, _underscorePlus.clone)(_this.suggestion);
                _this.suggestionClone.type = 'snippet';

                if (obj._hasParams) {

                  _this.suggestion.snippet = obj.name + '(${0:})';
                } else {

                  _this.suggestion.snippet = obj.name + '()';
                }

                _this.suggestionsArr.push(_this.suggestion);
                _this.suggestionsArr.push(_this.suggestionClone);
              } else {

                _this.suggestionsArr.push(_this.suggestion);
              }
            }

            resolve(_this.suggestionsArr);
          })['catch'](function (err) {

            console.error(err);
            resolve([]);
          });
        })['catch'](function () {

          resolve([]);
        });
      });
    }
  }, {
    key: 'forceCompletion',
    value: function forceCompletion() {

      this.force = true;
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'autocomplete-plus:activate');
      this.force = false;
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      (0, _atomTernjsHelper.disposeAll)(this.disposables);
      this.disposables = [];
    }
  }]);

  return Provider;
})();

exports['default'] = new Provider();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztpQ0FLb0IsdUJBQXVCOzs7O3VDQUNqQiw4QkFBOEI7Ozs7Z0NBSWpELHNCQUFzQjs7OEJBR3RCLGlCQUFpQjs7QUFieEIsV0FBVyxDQUFDOztBQUVaLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDOUMsSUFBTSxXQUFXLEdBQUcsb0NBQW9DLENBQUM7O0lBWW5ELFFBQVE7QUFFRCxXQUZQLFFBQVEsR0FFRTswQkFGVixRQUFROztBQUlWLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7O0FBR25CLFFBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQ0FBYyxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDekUsUUFBSSxDQUFDLG9CQUFvQixHQUFHLHFDQUFjLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQzs7QUFFaEYsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7R0FDN0I7O2VBbEJHLFFBQVE7O1dBb0JSLGdCQUFHOztBQUVMLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFZSw0QkFBRzs7QUFFakIsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFB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QyxFQUFFLDRCQUE0QixDQUFDLENBQUM7QUFDL0csVUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7OztXQUVNLG1CQUFHOztBQUVSLHdDQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztLQUN2Qjs7O1NBdE1HLFFBQVE7OztxQkF5TUMsSUFBSSxRQUFRLEVBQUUiLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvb3Bob2xlJykuRnVuY3Rpb247XG5jb25zdCBSRUdFWFBfTElORSA9IC8oKFtcXCRcXHddK1tcXHctXSopfChbLjo7J1wiW3soIF0rKSkkL2c7XG5cbmltcG9ydCBtYW5hZ2VyIGZyb20gJy4vYXRvbS10ZXJuanMtbWFuYWdlcic7XG5pbXBvcnQgcGFja2FnZUNvbmZpZyBmcm9tICcuL2F0b20tdGVybmpzLXBhY2thZ2UtY29uZmlnJztcbmltcG9ydCB7XG4gIGRpc3Bvc2VBbGwsXG4gIGZvcm1hdFR5cGVDb21wbGV0aW9uXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCB7XG4gIGNsb25lXG59IGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5cbmNsYXNzIFByb3ZpZGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcblxuICAgIHRoaXMuZm9yY2UgPSBmYWxzZTtcblxuICAgIC8vIGF1dG9tY29tcGxldGUtcGx1c1xuICAgIHRoaXMuc2VsZWN0b3IgPSAnLnNvdXJjZS5qcyc7XG4gICAgdGhpcy5kaXNhYmxlRm9yU2VsZWN0b3IgPSAnLnNvdXJjZS5qcyAuY29tbWVudCc7XG4gICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IDE7XG4gICAgdGhpcy5zdWdnZXN0aW9uUHJpb3JpdHkgPSBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuc25pcHBldHNGaXJzdCA/IG51bGwgOiAyO1xuICAgIHRoaXMuZXhjbHVkZUxvd2VyUHJpb3JpdHkgPSBwYWNrYWdlQ29uZmlnLm9wdGlvbnMuZXhjbHVkZUxvd2VyUHJpb3JpdHlQcm92aWRlcnM7XG5cbiAgICB0aGlzLnN1Z2dlc3Rpb25zQXJyID0gbnVsbDtcbiAgICB0aGlzLnN1Z2dlc3Rpb24gPSBudWxsO1xuICAgIHRoaXMuc3VnZ2VzdGlvbkNsb25lID0gbnVsbDtcbiAgfVxuXG4gIGluaXQoKSB7XG5cbiAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZHMoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6c3RhcnRDb21wbGV0aW9uJywgdGhpcy5mb3JjZUNvbXBsZXRpb24uYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgaXNWYWxpZFByZWZpeChwcmVmaXgsIHByZWZpeExhc3QpIHtcblxuICAgIGlmIChwcmVmaXhMYXN0ID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChwcmVmaXhMYXN0ID09PSAnXFwuJykge1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocHJlZml4TGFzdC5tYXRjaCgvO3xcXHMvKSkge1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHByZWZpeC5sZW5ndGggPiAxKSB7XG5cbiAgICAgIHByZWZpeCA9IGBfJHtwcmVmaXh9YDtcbiAgICB9XG5cbiAgICB0cnkge1xuXG4gICAgICAobmV3IEZ1bmN0aW9uKGB2YXIgJHtwcmVmaXh9YCkpKCk7XG5cbiAgICB9IGNhdGNoIChlKSB7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNoZWNrUHJlZml4KHByZWZpeCkge1xuXG4gICAgaWYgKFxuICAgICAgLyhcXCh8XFxzfDt8XFwufFxcXCJ8XFwnKSQvLnRlc3QocHJlZml4KSB8fFxuICAgICAgcHJlZml4LnJlcGxhY2UoL1xccy9nLCAnJykubGVuZ3RoID09PSAwXG4gICAgKSB7XG5cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJlZml4O1xuICB9XG5cbiAgZ2V0UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIHtcblxuICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pO1xuICAgIGNvbnN0IG1hdGNoZXMgPSBsaW5lLm1hdGNoKFJFR0VYUF9MSU5FKTtcblxuICAgIHJldHVybiBtYXRjaGVzICYmIG1hdGNoZXNbMF07XG4gIH1cblxuICBnZXRTdWdnZXN0aW9ucyh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXgsIGFjdGl2YXRlZE1hbnVhbGx5fSkge1xuXG4gICAgaWYgKCFtYW5hZ2VyLmNsaWVudCkge1xuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcFByZWZpeCA9IHRoaXMuZ2V0UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIHx8IHByZWZpeDtcblxuICAgIGlmICghdGhpcy5pc1ZhbGlkUHJlZml4KHRlbXBQcmVmaXgsIHRlbXBQcmVmaXhbdGVtcFByZWZpeC5sZW5ndGggLSAxXSkgJiYgIXRoaXMuZm9yY2UgJiYgIWFjdGl2YXRlZE1hbnVhbGx5KSB7XG5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgcHJlZml4ID0gdGhpcy5jaGVja1ByZWZpeCh0ZW1wUHJlZml4KTtcblxuICAgICAgbWFuYWdlci5jbGllbnQudXBkYXRlKGVkaXRvcikudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgIGlmICghZGF0YSkge1xuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFuYWdlci5jbGllbnQuY29tcGxldGlvbnMoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGVkaXRvci5nZXRVUkkoKSlbMV0sIHtcblxuICAgICAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvdyxcbiAgICAgICAgICBjaDogYnVmZmVyUG9zaXRpb24uY29sdW1uXG5cbiAgICAgICAgfSkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgICAgaWYgKCFkYXRhKSB7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKFtdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWRhdGEuY29tcGxldGlvbnMubGVuZ3RoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKFtdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zQXJyID0gW107XG5cbiAgICAgICAgICBsZXQgc2NvcGVzUGF0aCA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpO1xuICAgICAgICAgIGxldCBpc0luRnVuRGVmID0gc2NvcGVzUGF0aC5pbmRleE9mKCdtZXRhLmZ1bmN0aW9uLmpzJykgPiAtMTtcblxuICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBkYXRhLmNvbXBsZXRpb25zKSB7XG5cbiAgICAgICAgICAgIG9iaiA9IGZvcm1hdFR5cGVDb21wbGV0aW9uKG9iaiwgZGF0YS5pc1Byb3BlcnR5LCBkYXRhLmlzT2JqZWN0S2V5LCBpc0luRnVuRGVmKTtcblxuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9uID0ge1xuXG4gICAgICAgICAgICAgIHRleHQ6IG9iai5uYW1lLFxuICAgICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4LFxuICAgICAgICAgICAgICBjbGFzc05hbWU6IG51bGwsXG4gICAgICAgICAgICAgIHR5cGU6IG9iai5fdHlwZVNlbGYsXG4gICAgICAgICAgICAgIGxlZnRMYWJlbDogb2JqLmxlZnRMYWJlbCxcbiAgICAgICAgICAgICAgc25pcHBldDogb2JqLl9zbmlwcGV0LFxuICAgICAgICAgICAgICBkaXNwbGF5VGV4dDogb2JqLl9kaXNwbGF5VGV4dCxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG9iai5kb2MgfHwgbnVsbCxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBvYmoudXJsIHx8IG51bGxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChwYWNrYWdlQ29uZmlnLm9wdGlvbnMudXNlU25pcHBldHNBbmRGdW5jdGlvbiAmJiBvYmouX2hhc1BhcmFtcykge1xuXG4gICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbkNsb25lID0gY2xvbmUodGhpcy5zdWdnZXN0aW9uKTtcbiAgICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9uQ2xvbmUudHlwZSA9ICdzbmlwcGV0JztcblxuICAgICAgICAgICAgICBpZiAob2JqLl9oYXNQYXJhbXMpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbi5zbmlwcGV0ID0gYCR7b2JqLm5hbWV9KCRcXHswOlxcfSlgO1xuXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb24uc25pcHBldCA9IGAke29iai5uYW1lfSgpYDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnNBcnIucHVzaCh0aGlzLnN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zQXJyLnB1c2godGhpcy5zdWdnZXN0aW9uQ2xvbmUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnNBcnIucHVzaCh0aGlzLnN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUodGhpcy5zdWdnZXN0aW9uc0Fycik7XG5cbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuXG4gICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmb3JjZUNvbXBsZXRpb24oKSB7XG5cbiAgICB0aGlzLmZvcmNlID0gdHJ1ZTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpLCAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKTtcbiAgICB0aGlzLmZvcmNlID0gZmFsc2U7XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gICAgZGlzcG9zZUFsbCh0aGlzLmRpc3Bvc2FibGVzKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gW107XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFByb3ZpZGVyKCk7XG4iXX0=