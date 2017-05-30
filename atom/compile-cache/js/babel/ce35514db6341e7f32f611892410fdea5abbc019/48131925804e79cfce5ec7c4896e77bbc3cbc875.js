Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsServer = require('./atom-ternjs-server');

var _atomTernjsServer2 = _interopRequireDefault(_atomTernjsServer);

var _atomTernjsClient = require('./atom-ternjs-client');

var _atomTernjsClient2 = _interopRequireDefault(_atomTernjsClient);

var _atomTernjsEvents = require('./atom-ternjs-events');

var _atomTernjsEvents2 = _interopRequireDefault(_atomTernjsEvents);

var _atomTernjsDocumentation = require('./atom-ternjs-documentation');

var _atomTernjsDocumentation2 = _interopRequireDefault(_atomTernjsDocumentation);

var _atomTernjsReference = require('./atom-ternjs-reference');

var _atomTernjsReference2 = _interopRequireDefault(_atomTernjsReference);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _atomTernjsType = require('./atom-ternjs-type');

var _atomTernjsType2 = _interopRequireDefault(_atomTernjsType);

var _atomTernjsConfig = require('./atom-ternjs-config');

var _atomTernjsConfig2 = _interopRequireDefault(_atomTernjsConfig);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _atomTernjsProvider = require('./atom-ternjs-provider');

var _atomTernjsProvider2 = _interopRequireDefault(_atomTernjsProvider);

var _atomTernjsRename = require('./atom-ternjs-rename');

var _atomTernjsRename2 = _interopRequireDefault(_atomTernjsRename);

var _servicesNavigation = require('./services/navigation');

var _servicesNavigation2 = _interopRequireDefault(_servicesNavigation);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var Manager = (function () {
  function Manager() {
    _classCallCheck(this, Manager);

    this.disposables = [];
    /**
     * collection of all active clients
     * @type {Array}
     */
    this.clients = [];
    /**
     * reference to the client for the active text-editor
     * @type {Client}
     */
    this.client = null;
    /**
     * collection of all active servers
     * @type {Array}
     */
    this.servers = [];
    /**
     * reference to the server for the active text-editor
     * @type {Server}
     */
    this.server = null;
    this.editors = [];
  }

  _createClass(Manager, [{
    key: 'activate',
    value: function activate() {

      this.registerListeners();
      this.registerCommands();

      _atomTernjsConfig2['default'].init();
      _atomTernjsDocumentation2['default'].init();
      _atomTernjsPackageConfig2['default'].init();
      _atomTernjsProvider2['default'].init();
      _atomTernjsReference2['default'].init();
      _atomTernjsRename2['default'].init();
      _atomTernjsType2['default'].init();
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      (0, _atomTernjsHelper.disposeAll)(this.disposables);
      this.disposables = [];
      this.editors.forEach(function (editor) {
        return (0, _atomTernjsHelper.disposeAll)(editor.disposables);
      });
      this.editors = [];

      for (var server of this.servers) {

        server.destroy();
      }

      this.servers = [];
      this.clients = [];

      this.server = null;
      this.client = null;

      _atomTernjsDocumentation2['default'] && _atomTernjsDocumentation2['default'].destroy();
      _atomTernjsReference2['default'] && _atomTernjsReference2['default'].destroy();
      _atomTernjsType2['default'] && _atomTernjsType2['default'].destroy();
      _atomTernjsPackageConfig2['default'] && _atomTernjsPackageConfig2['default'].destroy();
      _atomTernjsRename2['default'] && _atomTernjsRename2['default'].destroy();
      _atomTernjsConfig2['default'] && _atomTernjsConfig2['default'].destroy();
      _atomTernjsProvider2['default'] && _atomTernjsProvider2['default'].destroy();
      _servicesNavigation2['default'].reset();
    }
  }, {
    key: 'startServer',
    value: function startServer(projectDir) {

      if (!(0, _atomTernjsHelper.isDirectory)(projectDir)) {

        return false;
      }

      if (this.getServerForProject(projectDir)) {

        return true;
      }

      var client = new _atomTernjsClient2['default'](projectDir);
      this.clients.push(client);

      this.servers.push(new _atomTernjsServer2['default'](projectDir, client));

      this.setActiveServerAndClient(projectDir);

      return true;
    }
  }, {
    key: 'setActiveServerAndClient',
    value: function setActiveServerAndClient(uRI) {

      this.server = this.getServerForProject(uRI);
      this.client = this.getClientForProject(uRI);
    }
  }, {
    key: 'destroyClient',
    value: function destroyClient(projectDir) {
      var _this = this;

      var clients = this.clients.slice();

      clients.forEach(function (client, i) {

        if (client.projectDir === projectDir) {

          _this.clients.splice(i, 1);
        }
      });
    }
  }, {
    key: 'destroyServer',
    value: function destroyServer(projectDir) {
      var _this2 = this;

      var servers = this.servers.slice();

      servers.forEach(function (server, i) {

        if (server.projectDir === projectDir) {

          server.destroy();
          _this2.servers.splice(i, 1);
          _this2.destroyClient(projectDir);
        }
      });
    }
  }, {
    key: 'destroyUnusedServers',
    value: function destroyUnusedServers() {
      var _this3 = this;

      var projectDirs = this.editors.map(function (editor) {
        return editor.projectDir;
      });
      var servers = this.servers.slice();

      servers.forEach(function (server) {

        if (!projectDirs.includes(server.projectDir)) {

          _this3.destroyServer(server.projectDir);
        }
      });
    }
  }, {
    key: 'getServerForProject',
    value: function getServerForProject(projectDir) {

      return this.servers.filter(function (server) {
        return server.projectDir === projectDir;
      }).pop();
    }
  }, {
    key: 'getClientForProject',
    value: function getClientForProject(projectDir) {

      return this.clients.filter(function (client) {
        return client.projectDir === projectDir;
      }).pop();
    }
  }, {
    key: 'getEditor',
    value: function getEditor(id) {

      return this.editors.filter(function (editor) {
        return editor.id === id;
      }).pop();
    }
  }, {
    key: 'destroyEditor',
    value: function destroyEditor(id) {
      var _this4 = this;

      var editors = this.editors.slice();

      editors.forEach(function (editor, i) {

        if (editor.id === id) {

          (0, _atomTernjsHelper.disposeAll)(editor.disposables);
          _this4.editors.splice(i, 1);
        }
      });
    }
  }, {
    key: 'getProjectDir',
    value: function getProjectDir(uRI) {
      var _atom$project$relativizePath = atom.project.relativizePath(uRI);

      var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

      var project = _atom$project$relativizePath2[0];
      var file = _atom$project$relativizePath2[1];

      if (project) {

        return project;
      }

      if (file) {

        var absolutePath = _path2['default'].resolve(__dirname, file);

        return _path2['default'].dirname(absolutePath);
      }

      return undefined;
    }
  }, {
    key: 'registerListeners',
    value: function registerListeners() {
      var _this5 = this;

      this.disposables.push(atom.workspace.observeTextEditors(function (editor) {

        if (!(0, _atomTernjsHelper.isValidEditor)(editor)) {

          return;
        }

        var uRI = editor.getURI();
        var projectDir = _this5.getProjectDir(uRI);
        var serverCreatedOrPresent = _this5.startServer(projectDir);

        if (!serverCreatedOrPresent) {

          return;
        }

        var id = editor.id;
        var disposables = [];

        // Register valid editor
        _this5.editors.push({

          id: id,
          projectDir: projectDir,
          disposables: disposables
        });

        disposables.push(editor.onDidDestroy(function () {

          _this5.destroyEditor(id);
          _this5.destroyUnusedServers();
        }));

        disposables.push(editor.onDidChangeCursorPosition(function (e) {

          if (_atomTernjsPackageConfig2['default'].options.inlineFnCompletion) {

            _this5.client && _atomTernjsType2['default'].queryType(editor, e);
          }
        }));

        disposables.push(editor.getBuffer().onDidSave(function (e) {

          _this5.client && _this5.client.update(editor);
        }));
      }));

      this.disposables.push(atom.workspace.onDidChangeActivePaneItem(function (item) {

        _atomTernjsEvents2['default'].emit('type-destroy-overlay');
        _atomTernjsEvents2['default'].emit('documentation-destroy-overlay');
        _atomTernjsEvents2['default'].emit('rename-hide');

        if (!(0, _atomTernjsHelper.isValidEditor)(item)) {

          _atomTernjsEvents2['default'].emit('reference-hide');
        } else {

          var uRI = item.getURI();
          var projectDir = _this5.getProjectDir(uRI);

          _this5.setActiveServerAndClient(projectDir);
        }
      }));
    }
  }, {
    key: 'registerCommands',
    value: function registerCommands() {
      var _this6 = this;

      this.disposables.push(atom.commands.add('atom-text-editor', 'core:cancel', function (e) {

        _atomTernjsEvents2['default'].emit('type-destroy-overlay');
        _atomTernjsEvents2['default'].emit('documentation-destroy-overlay');
        _atomTernjsEvents2['default'].emit('reference-hide');
        _atomTernjsEvents2['default'].emit('rename-hide');
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:listFiles', function (e) {

        if (_this6.client) {

          _this6.client.files().then(function (data) {

            console.dir(data);
          });
        }
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:flush', function (e) {

        _this6.server && _this6.server.flush();
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:navigateBack', function (e) {

        _servicesNavigation2['default'].goTo(-1);
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:navigateForward', function (e) {

        _servicesNavigation2['default'].goTo(1);
      }));

      this.disposables.push(atom.commands.add('atom-text-editor', 'atom-ternjs:definition', function (e) {

        _this6.client && _this6.client.definition();
      }));

      this.disposables.push(atom.commands.add('atom-workspace', 'atom-ternjs:restart', function (e) {

        _this6.server && _this6.server.restart();
      }));
    }
  }]);

  return Manager;
})();

exports['default'] = new Manager();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Z0NBRW1CLHNCQUFzQjs7OztnQ0FDdEIsc0JBQXNCOzs7O2dDQUNyQixzQkFBc0I7Ozs7dUNBQ2hCLDZCQUE2Qjs7OzttQ0FDakMseUJBQXlCOzs7O3VDQUNyQiw4QkFBOEI7Ozs7OEJBQ3ZDLG9CQUFvQjs7OztnQ0FDbEIsc0JBQXNCOzs7O2dDQUtsQyxzQkFBc0I7O2tDQUNSLHdCQUF3Qjs7OztnQ0FDMUIsc0JBQXNCOzs7O2tDQUNsQix1QkFBdUI7Ozs7b0JBQzdCLE1BQU07Ozs7QUFsQnZCLFdBQVcsQ0FBQzs7SUFvQk4sT0FBTztBQUVBLFdBRlAsT0FBTyxHQUVHOzBCQUZWLE9BQU87O0FBSVQsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Ozs7O0FBS3RCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOzs7OztBQUtsQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7Ozs7QUFLbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Ozs7O0FBS2xCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQTFCRyxPQUFPOztXQTRCSCxvQkFBRzs7QUFFVCxVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN6QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFeEIsb0NBQU8sSUFBSSxFQUFFLENBQUM7QUFDZCwyQ0FBYyxJQUFJLEVBQUUsQ0FBQztBQUNyQiwyQ0FBYyxJQUFJLEVBQUUsQ0FBQztBQUNyQixzQ0FBUyxJQUFJLEVBQUUsQ0FBQztBQUNoQix1Q0FBVSxJQUFJLEVBQUUsQ0FBQztBQUNqQixvQ0FBTyxJQUFJLEVBQUUsQ0FBQztBQUNk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cy1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBTZXJ2ZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1zZXJ2ZXInO1xuaW1wb3J0IENsaWVudCBmcm9tICcuL2F0b20tdGVybmpzLWNsaWVudCc7XG5pbXBvcnQgZW1pdHRlciBmcm9tICcuL2F0b20tdGVybmpzLWV2ZW50cyc7XG5pbXBvcnQgZG9jdW1lbnRhdGlvbiBmcm9tICcuL2F0b20tdGVybmpzLWRvY3VtZW50YXRpb24nO1xuaW1wb3J0IHJlZmVyZW5jZSBmcm9tICcuL2F0b20tdGVybmpzLXJlZmVyZW5jZSc7XG5pbXBvcnQgcGFja2FnZUNvbmZpZyBmcm9tICcuL2F0b20tdGVybmpzLXBhY2thZ2UtY29uZmlnJztcbmltcG9ydCB0eXBlIGZyb20gJy4vYXRvbS10ZXJuanMtdHlwZSc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vYXRvbS10ZXJuanMtY29uZmlnJztcbmltcG9ydCB7XG4gIGlzRGlyZWN0b3J5LFxuICBpc1ZhbGlkRWRpdG9yLFxuICBkaXNwb3NlQWxsXG59IGZyb20gJy4vYXRvbS10ZXJuanMtaGVscGVyJztcbmltcG9ydCBwcm92aWRlciBmcm9tICcuL2F0b20tdGVybmpzLXByb3ZpZGVyJztcbmltcG9ydCByZW5hbWUgZnJvbSAnLi9hdG9tLXRlcm5qcy1yZW5hbWUnO1xuaW1wb3J0IG5hdmlnYXRpb24gZnJvbSAnLi9zZXJ2aWNlcy9uYXZpZ2F0aW9uJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jbGFzcyBNYW5hZ2VyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcbiAgICAvKipcbiAgICAgKiBjb2xsZWN0aW9uIG9mIGFsbCBhY3RpdmUgY2xpZW50c1xuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWVudHMgPSBbXTtcbiAgICAvKipcbiAgICAgKiByZWZlcmVuY2UgdG8gdGhlIGNsaWVudCBmb3IgdGhlIGFjdGl2ZSB0ZXh0LWVkaXRvclxuICAgICAqIEB0eXBlIHtDbGllbnR9XG4gICAgICovXG4gICAgdGhpcy5jbGllbnQgPSBudWxsO1xuICAgIC8qKlxuICAgICAqIGNvbGxlY3Rpb24gb2YgYWxsIGFjdGl2ZSBzZXJ2ZXJzXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHRoaXMuc2VydmVycyA9IFtdO1xuICAgIC8qKlxuICAgICAqIHJlZmVyZW5jZSB0byB0aGUgc2VydmVyIGZvciB0aGUgYWN0aXZlIHRleHQtZWRpdG9yXG4gICAgICogQHR5cGUge1NlcnZlcn1cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgdGhpcy5lZGl0b3JzID0gW107XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZHMoKTtcblxuICAgIGNvbmZpZy5pbml0KCk7XG4gICAgZG9jdW1lbnRhdGlvbi5pbml0KCk7XG4gICAgcGFja2FnZUNvbmZpZy5pbml0KCk7XG4gICAgcHJvdmlkZXIuaW5pdCgpO1xuICAgIHJlZmVyZW5jZS5pbml0KCk7XG4gICAgcmVuYW1lLmluaXQoKTtcbiAgICB0eXBlLmluaXQoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG5cbiAgICBkaXNwb3NlQWxsKHRoaXMuZGlzcG9zYWJsZXMpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBbXTtcbiAgICB0aGlzLmVkaXRvcnMuZm9yRWFjaChlZGl0b3IgPT4gZGlzcG9zZUFsbChlZGl0b3IuZGlzcG9zYWJsZXMpKTtcbiAgICB0aGlzLmVkaXRvcnMgPSBbXTtcblxuICAgIGZvciAoY29uc3Qgc2VydmVyIG9mIHRoaXMuc2VydmVycykge1xuXG4gICAgICBzZXJ2ZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVycyA9IFtdO1xuICAgIHRoaXMuY2xpZW50cyA9IFtdO1xuXG4gICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuY2xpZW50ID0gbnVsbDtcblxuICAgIGRvY3VtZW50YXRpb24gJiYgZG9jdW1lbnRhdGlvbi5kZXN0cm95KCk7XG4gICAgcmVmZXJlbmNlICYmIHJlZmVyZW5jZS5kZXN0cm95KCk7XG4gICAgdHlwZSAmJiB0eXBlLmRlc3Ryb3koKTtcbiAgICBwYWNrYWdlQ29uZmlnICYmIHBhY2thZ2VDb25maWcuZGVzdHJveSgpO1xuICAgIHJlbmFtZSAmJiByZW5hbWUuZGVzdHJveSgpO1xuICAgIGNvbmZpZyAmJiBjb25maWcuZGVzdHJveSgpO1xuICAgIHByb3ZpZGVyICYmIHByb3ZpZGVyLmRlc3Ryb3koKTtcbiAgICBuYXZpZ2F0aW9uLnJlc2V0KCk7XG4gIH1cblxuICBzdGFydFNlcnZlcihwcm9qZWN0RGlyKSB7XG5cbiAgICBpZiAoIWlzRGlyZWN0b3J5KHByb2plY3REaXIpKSB7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRTZXJ2ZXJGb3JQcm9qZWN0KHByb2plY3REaXIpKSB7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQocHJvamVjdERpcik7XG4gICAgdGhpcy5jbGllbnRzLnB1c2goY2xpZW50KTtcblxuICAgIHRoaXMuc2VydmVycy5wdXNoKG5ldyBTZXJ2ZXIocHJvamVjdERpciwgY2xpZW50KSk7XG5cbiAgICB0aGlzLnNldEFjdGl2ZVNlcnZlckFuZENsaWVudChwcm9qZWN0RGlyKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc2V0QWN0aXZlU2VydmVyQW5kQ2xpZW50KHVSSSkge1xuXG4gICAgdGhpcy5zZXJ2ZXIgPSB0aGlzLmdldFNlcnZlckZvclByb2plY3QodVJJKTtcbiAgICB0aGlzLmNsaWVudCA9IHRoaXMuZ2V0Q2xpZW50Rm9yUHJvamVjdCh1UkkpO1xuICB9XG5cbiAgZGVzdHJveUNsaWVudChwcm9qZWN0RGlyKSB7XG5cbiAgICBjb25zdCBjbGllbnRzID0gdGhpcy5jbGllbnRzLnNsaWNlKCk7XG5cbiAgICBjbGllbnRzLmZvckVhY2goKGNsaWVudCwgaSkgPT4ge1xuXG4gICAgICBpZiAoY2xpZW50LnByb2plY3REaXIgPT09IHByb2plY3REaXIpIHtcblxuICAgICAgICB0aGlzLmNsaWVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveVNlcnZlcihwcm9qZWN0RGlyKSB7XG5cbiAgICBjb25zdCBzZXJ2ZXJzID0gdGhpcy5zZXJ2ZXJzLnNsaWNlKCk7XG5cbiAgICBzZXJ2ZXJzLmZvckVhY2goKHNlcnZlciwgaSkgPT4ge1xuXG4gICAgICBpZiAoc2VydmVyLnByb2plY3REaXIgPT09IHByb2plY3REaXIpIHtcblxuICAgICAgICBzZXJ2ZXIuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLnNlcnZlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLmRlc3Ryb3lDbGllbnQocHJvamVjdERpcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95VW51c2VkU2VydmVycygpIHtcblxuICAgIGNvbnN0IHByb2plY3REaXJzID0gdGhpcy5lZGl0b3JzLm1hcChlZGl0b3IgPT4gZWRpdG9yLnByb2plY3REaXIpO1xuICAgIGNvbnN0IHNlcnZlcnMgPSB0aGlzLnNlcnZlcnMuc2xpY2UoKTtcblxuICAgIHNlcnZlcnMuZm9yRWFjaChzZXJ2ZXIgPT4ge1xuXG4gICAgICBpZiAoIXByb2plY3REaXJzLmluY2x1ZGVzKHNlcnZlci5wcm9qZWN0RGlyKSkge1xuXG4gICAgICAgIHRoaXMuZGVzdHJveVNlcnZlcihzZXJ2ZXIucHJvamVjdERpcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRTZXJ2ZXJGb3JQcm9qZWN0KHByb2plY3REaXIpIHtcblxuICAgIHJldHVybiB0aGlzLnNlcnZlcnMuZmlsdGVyKHNlcnZlciA9PiBzZXJ2ZXIucHJvamVjdERpciA9PT0gcHJvamVjdERpcikucG9wKCk7XG4gIH1cblxuICBnZXRDbGllbnRGb3JQcm9qZWN0KHByb2plY3REaXIpIHtcblxuICAgIHJldHVybiB0aGlzLmNsaWVudHMuZmlsdGVyKGNsaWVudCA9PiBjbGllbnQucHJvamVjdERpciA9PT0gcHJvamVjdERpcikucG9wKCk7XG4gIH1cblxuICBnZXRFZGl0b3IoaWQpIHtcblxuICAgIHJldHVybiB0aGlzLmVkaXRvcnMuZmlsdGVyKGVkaXRvciA9PiBlZGl0b3IuaWQgPT09IGlkKS5wb3AoKTtcbiAgfVxuXG4gIGRlc3Ryb3lFZGl0b3IoaWQpIHtcblxuICAgIGNvbnN0IGVkaXRvcnMgPSB0aGlzLmVkaXRvcnMuc2xpY2UoKTtcblxuICAgIGVkaXRvcnMuZm9yRWFjaCgoZWRpdG9yLCBpKSA9PiB7XG5cbiAgICAgIGlmIChlZGl0b3IuaWQgPT09IGlkKSB7XG5cbiAgICAgICAgZGlzcG9zZUFsbChlZGl0b3IuZGlzcG9zYWJsZXMpO1xuICAgICAgICB0aGlzLmVkaXRvcnMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHJvamVjdERpcih1UkkpIHtcblxuICAgIGNvbnN0IFtwcm9qZWN0LCBmaWxlXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aCh1UkkpO1xuXG4gICAgaWYgKHByb2plY3QpIHtcblxuICAgICAgcmV0dXJuIHByb2plY3Q7XG4gICAgfVxuXG4gICAgaWYgKGZpbGUpIHtcblxuICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgZmlsZSk7XG5cbiAgICAgIHJldHVybiBwYXRoLmRpcm5hbWUoYWJzb2x1dGVQYXRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcblxuICAgICAgaWYgKCFpc1ZhbGlkRWRpdG9yKGVkaXRvcikpIHtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVSSSA9IGVkaXRvci5nZXRVUkkoKTtcbiAgICAgIGNvbnN0IHByb2plY3REaXIgPSB0aGlzLmdldFByb2plY3REaXIodVJJKTtcbiAgICAgIGNvbnN0IHNlcnZlckNyZWF0ZWRPclByZXNlbnQgPSB0aGlzLnN0YXJ0U2VydmVyKHByb2plY3REaXIpO1xuXG4gICAgICBpZiAoIXNlcnZlckNyZWF0ZWRPclByZXNlbnQpIHtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlkID0gZWRpdG9yLmlkO1xuICAgICAgY29uc3QgZGlzcG9zYWJsZXMgPSBbXTtcblxuICAgICAgLy8gUmVnaXN0ZXIgdmFsaWQgZWRpdG9yXG4gICAgICB0aGlzLmVkaXRvcnMucHVzaCh7XG5cbiAgICAgICAgaWQsXG4gICAgICAgIHByb2plY3REaXIsXG4gICAgICAgIGRpc3Bvc2FibGVzXG4gICAgICB9KTtcblxuICAgICAgZGlzcG9zYWJsZXMucHVzaChlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcblxuICAgICAgICB0aGlzLmRlc3Ryb3lFZGl0b3IoaWQpO1xuICAgICAgICB0aGlzLmRlc3Ryb3lVbnVzZWRTZXJ2ZXJzKCk7XG4gICAgICB9KSk7XG5cbiAgICAgIGRpc3Bvc2FibGVzLnB1c2goZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKGUpID0+IHtcblxuICAgICAgICBpZiAocGFja2FnZUNvbmZpZy5vcHRpb25zLmlubGluZUZuQ29tcGxldGlvbikge1xuXG4gICAgICAgICAgdGhpcy5jbGllbnQgJiYgdHlwZS5xdWVyeVR5cGUoZWRpdG9yLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuXG4gICAgICBkaXNwb3NhYmxlcy5wdXNoKGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoKGUpID0+IHtcblxuICAgICAgICB0aGlzLmNsaWVudCAmJiB0aGlzLmNsaWVudC51cGRhdGUoZWRpdG9yKTtcbiAgICAgIH0pKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSgoaXRlbSkgPT4ge1xuXG4gICAgICBlbWl0dGVyLmVtaXQoJ3R5cGUtZGVzdHJveS1vdmVybGF5Jyk7XG4gICAgICBlbWl0dGVyLmVtaXQoJ2RvY3VtZW50YXRpb24tZGVzdHJveS1vdmVybGF5Jyk7XG4gICAgICBlbWl0dGVyLmVtaXQoJ3JlbmFtZS1oaWRlJyk7XG5cbiAgICAgIGlmICghaXNWYWxpZEVkaXRvcihpdGVtKSkge1xuXG4gICAgICAgIGVtaXR0ZXIuZW1pdCgncmVmZXJlbmNlLWhpZGUnKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBjb25zdCB1UkkgPSBpdGVtLmdldFVSSSgpO1xuICAgICAgICBjb25zdCBwcm9qZWN0RGlyID0gdGhpcy5nZXRQcm9qZWN0RGlyKHVSSSk7XG5cbiAgICAgICAgdGhpcy5zZXRBY3RpdmVTZXJ2ZXJBbmRDbGllbnQocHJvamVjdERpcik7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgcmVnaXN0ZXJDb21tYW5kcygpIHtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNhbmNlbCcsIChlKSA9PiB7XG5cbiAgICAgIGVtaXR0ZXIuZW1pdCgndHlwZS1kZXN0cm95LW92ZXJsYXknKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgnZG9jdW1lbnRhdGlvbi1kZXN0cm95LW92ZXJsYXknKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgncmVmZXJlbmNlLWhpZGUnKTtcbiAgICAgIGVtaXR0ZXIuZW1pdCgncmVuYW1lLWhpZGUnKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bGlzdEZpbGVzJywgKGUpID0+IHtcblxuICAgICAgaWYgKHRoaXMuY2xpZW50KSB7XG5cbiAgICAgICAgdGhpcy5jbGllbnQuZmlsZXMoKS50aGVuKChkYXRhKSA9PiB7XG5cbiAgICAgICAgICBjb25zb2xlLmRpcihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5wdXNoKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2F0b20tdGVybmpzOmZsdXNoJywgKGUpID0+IHtcblxuICAgICAgdGhpcy5zZXJ2ZXIgJiYgdGhpcy5zZXJ2ZXIuZmx1c2goKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bmF2aWdhdGVCYWNrJywgKGUpID0+IHtcblxuICAgICAgbmF2aWdhdGlvbi5nb1RvKC0xKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLnB1c2goYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnYXRvbS10ZXJuanM6bmF2aWdhdGVGb3J3YXJkJywgKGUpID0+IHtcblxuICAgICAgbmF2aWdhdGlvbi5nb1RvKDEpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsICdhdG9tLXRlcm5qczpkZWZpbml0aW9uJywgKGUpID0+IHtcblxuICAgICAgdGhpcy5jbGllbnQgJiYgdGhpcy5jbGllbnQuZGVmaW5pdGlvbigpO1xuICAgIH0pKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMucHVzaChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS10ZXJuanM6cmVzdGFydCcsIChlKSA9PiB7XG5cbiAgICAgIHRoaXMuc2VydmVyICYmIHRoaXMuc2VydmVyLnJlc3RhcnQoKTtcbiAgICB9KSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1hbmFnZXIoKTtcbiJdfQ==