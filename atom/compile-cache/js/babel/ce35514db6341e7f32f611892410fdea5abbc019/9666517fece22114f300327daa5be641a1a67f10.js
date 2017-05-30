Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsHelper = require('./atom-ternjs-helper');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _resolveFrom = require('resolve-from');

var _resolveFrom2 = _interopRequireDefault(_resolveFrom);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _configTernConfig = require('../config/tern-config');

var _underscorePlus = require('underscore-plus');

'use babel';

var maxPendingRequests = 50;

var Server = (function () {
  function Server(projectRoot, client) {
    _classCallCheck(this, Server);

    this.client = client;

    this.child = null;

    this.resolves = {};
    this.rejects = {};

    this.pendingRequest = 0;

    this.projectDir = projectRoot;
    this.distDir = _path2['default'].resolve(__dirname, '../node_modules/tern');

    this.defaultConfig = (0, _underscorePlus.clone)(_configTernConfig.defaultServerConfig);

    var homeDir = process.env.HOME || process.env.USERPROFILE;

    if (homeDir && _fs2['default'].existsSync(_path2['default'].resolve(homeDir, '.tern-config'))) {

      this.defaultConfig = this.readProjectFile(_path2['default'].resolve(homeDir, '.tern-config'));
    }

    this.projectFileName = '.tern-project';
    this.disableLoadingLocal = false;

    this.init();
  }

  _createClass(Server, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if (!this.projectDir) {

        return;
      }

      this.config = this.readProjectFile(_path2['default'].resolve(this.projectDir, this.projectFileName));

      if (!this.config) {

        this.config = this.defaultConfig;
      }

      this.config.async = _atomTernjsPackageConfig2['default'].options.ternServerGetFileAsync;
      this.config.dependencyBudget = _atomTernjsPackageConfig2['default'].options.ternServerDependencyBudget;

      if (!this.config.plugins['doc_comment']) {

        this.config.plugins['doc_comment'] = true;
      }

      var defs = this.findDefs(this.projectDir, this.config);
      var plugins = this.loadPlugins(this.projectDir, this.config);
      var files = [];

      if (this.config.loadEagerly) {

        this.config.loadEagerly.forEach(function (pat) {

          _glob2['default'].sync(pat, { cwd: _this.projectDir }).forEach(function (file) {

            files.push(file);
          });
        });
      }

      this.child = _child_process2['default'].fork(_path2['default'].resolve(__dirname, './atom-ternjs-server-worker.js'));
      this.child.on('message', this.onWorkerMessage.bind(this));
      this.child.on('error', this.onError);
      this.child.on('disconnect', this.onDisconnect);
      this.child.send({

        type: 'init',
        dir: this.projectDir,
        config: this.config,
        defs: defs,
        plugins: plugins,
        files: files
      });
    }
  }, {
    key: 'onError',
    value: function onError(e) {

      this.restart('Child process error: ' + e);
    }
  }, {
    key: 'onDisconnect',
    value: function onDisconnect() {

      console.warn('child process disconnected.');
    }
  }, {
    key: 'request',
    value: function request(type, data) {
      var _this2 = this;

      if (this.pendingRequest >= maxPendingRequests) {

        this.restart('Max number of pending requests reached. Restarting server...');

        return;
      }

      var requestID = _nodeUuid2['default'].v1();

      this.pendingRequest++;

      return new Promise(function (resolve, reject) {

        _this2.resolves[requestID] = resolve;
        _this2.rejects[requestID] = reject;

        _this2.child.send({

          type: type,
          id: requestID,
          data: data
        });
      });
    }
  }, {
    key: 'flush',
    value: function flush() {

      this.request('flush', {}).then(function () {

        atom.notifications.addInfo('All files fetched and analyzed.');
      });
    }
  }, {
    key: 'dontLoad',
    value: function dontLoad(file) {

      if (!this.config.dontLoad) {

        return;
      }

      return this.config.dontLoad.some(function (pat) {

        return (0, _minimatch2['default'])(file, pat);
      });
    }
  }, {
    key: 'restart',
    value: function restart(message) {

      atom.notifications.addError(message || 'Restarting Server...', {

        dismissable: false
      });

      _atomTernjsManager2['default'].destroyServer(this.projectDir);
      _atomTernjsManager2['default'].startServer(this.projectDir);
    }
  }, {
    key: 'onWorkerMessage',
    value: function onWorkerMessage(e) {

      if (e.error && e.error.isUncaughtException) {

        this.restart('UncaughtException: ' + e.error.message + '. Restarting Server...');

        return;
      }

      var isError = e.error !== 'null' && e.error !== 'undefined';
      var id = e.id;

      if (!id) {

        console.error('no id given', e);

        return;
      }

      if (isError) {

        this.rejects[id] && this.rejects[id](e.error);
      } else {

        this.resolves[id] && this.resolves[id](e.data);
      }

      delete this.resolves[id];
      delete this.rejects[id];

      this.pendingRequest--;
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      if (!this.child) {

        return;
      }

      for (var key in this.rejects) {

        this.rejects[key]('Server is being destroyed. Rejecting.');
      }

      this.resolves = {};
      this.rejects = {};

      this.pendingRequest = 0;

      try {

        this.child.disconnect();
      } catch (error) {

        console.error(error);
      }
    }
  }, {
    key: 'readJSON',
    value: function readJSON(fileName) {

      if ((0, _atomTernjsHelper.fileExists)(fileName) !== undefined) {

        return false;
      }

      var file = _fs2['default'].readFileSync(fileName, 'utf8');

      try {

        return JSON.parse(file);
      } catch (e) {

        atom.notifications.addError('Bad JSON in ' + fileName + ': ' + e.message + '. Please restart atom after the file is fixed. This issue isn\'t fully covered yet.', { dismissable: true });

        _atomTernjsManager2['default'].destroyServer(this.projectDir);
      }
    }
  }, {
    key: 'mergeObjects',
    value: function mergeObjects(base, value) {

      if (!base) {

        return value;
      }

      if (!value) {

        return base;
      }

      var result = {};

      for (var prop in base) {

        result[prop] = base[prop];
      }

      for (var prop in value) {

        result[prop] = value[prop];
      }

      return result;
    }
  }, {
    key: 'readProjectFile',
    value: function readProjectFile(fileName) {

      var data = this.readJSON(fileName);

      if (!data) {

        return false;
      }

      for (var option in this.defaultConfig) {

        if (!data.hasOwnProperty(option)) {

          data[option] = this.defaultConfig[option];
        } else if (option === 'plugins') {

          data[option] = this.mergeObjects(this.defaultConfig[option], data[option]);
        }
      }

      return data;
    }
  }, {
    key: 'findFile',
    value: function findFile(file, projectDir, fallbackDir) {

      var local = _path2['default'].resolve(projectDir, file);

      if (!this.disableLoadingLocal && _fs2['default'].existsSync(local)) {

        return local;
      }

      var shared = _path2['default'].resolve(fallbackDir, file);

      if (_fs2['default'].existsSync(shared)) {

        return shared;
      }
    }
  }, {
    key: 'findDefs',
    value: function findDefs(projectDir, config) {

      var defs = [];
      var src = config.libs.slice();

      if (config.ecmaScript && src.indexOf('ecmascript') === -1) {

        src.unshift('ecmascript');
      }

      for (var i = 0; i < src.length; ++i) {

        var file = src[i];

        if (!/\.json$/.test(file)) {

          file = file + '.json';
        }

        var found = this.findFile(file, projectDir, _path2['default'].resolve(this.distDir, 'defs')) || (0, _resolveFrom2['default'])(projectDir, 'tern-' + src[i]);

        if (!found) {

          try {

            found = require.resolve('tern-' + src[i]);
          } catch (e) {

            atom.notifications.addError('Failed to find library ' + src[i] + '\n', {

              dismissable: true
            });
            continue;
          }
        }

        if (found) {

          defs.push(this.readJSON(found));
        }
      }

      return defs;
    }
  }, {
    key: 'loadPlugins',
    value: function loadPlugins(projectDir, config) {

      var plugins = config.plugins;
      var options = {};
      this.config.pluginImports = [];

      for (var plugin in plugins) {

        var val = plugins[plugin];

        if (!val) {

          continue;
        }

        var found = this.findFile(plugin + '.js', projectDir, _path2['default'].resolve(this.distDir, 'plugin')) || (0, _resolveFrom2['default'])(projectDir, 'tern-' + plugin);

        if (!found) {

          try {

            found = require.resolve('tern-' + plugin);
          } catch (e) {

            console.warn(e);
          }
        }

        if (!found) {

          try {

            found = require.resolve(this.projectDir + '/node_modules/tern-' + plugin);
          } catch (e) {

            atom.notifications.addError('Failed to find plugin ' + plugin + '\n', {

              dismissable: true
            });
            continue;
          }
        }

        this.config.pluginImports.push(found);
        options[_path2['default'].basename(plugin)] = val;
      }

      return options;
    }
  }]);

  return Server;
})();

exports['default'] = Server;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtc2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7aUNBRW9CLHVCQUF1Qjs7OztnQ0FDbEIsc0JBQXNCOztrQkFDaEMsSUFBSTs7OztvQkFDRixNQUFNOzs7O29CQUNOLE1BQU07Ozs7NkJBQ1IsZUFBZTs7Ozt5QkFDUixXQUFXOzs7O3dCQUNoQixXQUFXOzs7OzJCQUNKLGNBQWM7Ozs7dUNBQ1osOEJBQThCOzs7O2dDQUN0Qix1QkFBdUI7OzhCQUlsRCxpQkFBaUI7O0FBaEJ4QixXQUFXLENBQUM7O0FBa0JaLElBQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDOztJQUVULE1BQU07QUFFZCxXQUZRLE1BQU0sQ0FFYixXQUFXLEVBQUUsTUFBTSxFQUFFOzBCQUZkLE1BQU07O0FBSXZCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVyQixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDOztBQUV4QixRQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQztBQUM5QixRQUFJLENBQUMsT0FBTyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzs7QUFFL0QsUUFBSSxDQUFDLGFBQWEsR0FBRyxpRUFBMEIsQ0FBQzs7QUFFaEQsUUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7O0FBRTVELFFBQUksT0FBTyxJQUFJLGdCQUFHLFVBQVUsQ0FBQyxrQkFBSyxPQUFPLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FB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QVUsWUFBVSxNQUFNLENBQUcsQ0FDeEM7O0FBRUgsWUFBSSxDQUFDLEtBQUssRUFBRTs7QUFFVixjQUFJOztBQUVGLGlCQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sV0FBUyxNQUFNLENBQUcsQ0FBQztXQUUzQyxDQUFDLE9BQU8sQ0FBQyxFQUFFOztBQUVWLG1CQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ2pCO1NBQ0Y7O0FBRUQsWUFBSSxDQUFDLEtBQUssRUFBRTs7QUFFVixjQUFJOztBQUVGLGlCQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBSSxJQUFJLENBQUMsVUFBVSwyQkFBc0IsTUFBTSxDQUFHLENBQUM7V0FFM0UsQ0FBQyxPQUFPLENBQUMsRUFBRTs7QUFFVixnQkFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLDRCQUEwQixNQUFNLFNBQU07O0FBRS9ELHlCQUFXLEVBQUUsSUFBSTthQUNsQixDQUFDLENBQUM7QUFDSCxxQkFBUztXQUNWO1NBQ0Y7O0FBRUQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RDLGVBQU8sQ0FBQyxrQkFBSyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7T0FDdEM7O0FBRUQsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQXZaa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9hdG9tLXRlcm5qcy1zZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IG1hbmFnZXIgZnJvbSAnLi9hdG9tLXRlcm5qcy1tYW5hZ2VyJztcbmltcG9ydCB7ZmlsZUV4aXN0c30gZnJvbSAnLi9hdG9tLXRlcm5qcy1oZWxwZXInO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgY3AgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgbWluaW1hdGNoIGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQgdXVpZCBmcm9tICdub2RlLXV1aWQnO1xuaW1wb3J0IHJlc29sdmVGcm9tIGZyb20gJ3Jlc29sdmUtZnJvbSc7XG5pbXBvcnQgcGFja2FnZUNvbmZpZyBmcm9tICcuL2F0b20tdGVybmpzLXBhY2thZ2UtY29uZmlnJztcbmltcG9ydCB7ZGVmYXVsdFNlcnZlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL3Rlcm4tY29uZmlnJztcblxuaW1wb3J0IHtcbiAgY2xvbmVcbn0gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcblxuY29uc3QgbWF4UGVuZGluZ1JlcXVlc3RzID0gNTA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlciB7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdFJvb3QsIGNsaWVudCkge1xuXG4gICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG5cbiAgICB0aGlzLmNoaWxkID0gbnVsbDtcblxuICAgIHRoaXMucmVzb2x2ZXMgPSB7fTtcbiAgICB0aGlzLnJlamVjdHMgPSB7fTtcblxuICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgPSAwO1xuXG4gICAgdGhpcy5wcm9qZWN0RGlyID0gcHJvamVjdFJvb3Q7XG4gICAgdGhpcy5kaXN0RGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL25vZGVfbW9kdWxlcy90ZXJuJyk7XG5cbiAgICB0aGlzLmRlZmF1bHRDb25maWcgPSBjbG9uZShkZWZhdWx0U2VydmVyQ29uZmlnKTtcblxuICAgIGNvbnN0IGhvbWVEaXIgPSBwcm9jZXNzLmVudi5IT01FIHx8IHByb2Nlc3MuZW52LlVTRVJQUk9GSUxFO1xuXG4gICAgaWYgKGhvbWVEaXIgJiYgZnMuZXhpc3RzU3luYyhwYXRoLnJlc29sdmUoaG9tZURpciwgJy50ZXJuLWNvbmZpZycpKSkge1xuXG4gICAgICB0aGlzLmRlZmF1bHRDb25maWcgPSB0aGlzLnJlYWRQcm9qZWN0RmlsZShwYXRoLnJlc29sdmUoaG9tZURpciwgJy50ZXJuLWNvbmZpZycpKTtcbiAgICB9XG5cbiAgICB0aGlzLnByb2plY3RGaWxlTmFtZSA9ICcudGVybi1wcm9qZWN0JztcbiAgICB0aGlzLmRpc2FibGVMb2FkaW5nTG9jYWwgPSBmYWxzZTtcblxuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcblxuICAgIGlmICghdGhpcy5wcm9qZWN0RGlyKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMucmVhZFByb2plY3RGaWxlKHBhdGgucmVzb2x2ZSh0aGlzLnByb2plY3REaXIsIHRoaXMucHJvamVjdEZpbGVOYW1lKSk7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnKSB7XG5cbiAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5kZWZhdWx0Q29uZmlnO1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnLmFzeW5jID0gcGFja2FnZUNvbmZpZy5vcHRpb25zLnRlcm5TZXJ2ZXJHZXRGaWxlQXN5bmM7XG4gICAgdGhpcy5jb25maWcuZGVwZW5kZW5jeUJ1ZGdldCA9IHBhY2thZ2VDb25maWcub3B0aW9ucy50ZXJuU2VydmVyRGVwZW5kZW5jeUJ1ZGdldDtcblxuICAgIGlmICghdGhpcy5jb25maWcucGx1Z2luc1snZG9jX2NvbW1lbnQnXSkge1xuXG4gICAgICB0aGlzLmNvbmZpZy5wbHVnaW5zWydkb2NfY29tbWVudCddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBsZXQgZGVmcyA9IHRoaXMuZmluZERlZnModGhpcy5wcm9qZWN0RGlyLCB0aGlzLmNvbmZpZyk7XG4gICAgbGV0IHBsdWdpbnMgPSB0aGlzLmxvYWRQbHVnaW5zKHRoaXMucHJvamVjdERpciwgdGhpcy5jb25maWcpO1xuICAgIGxldCBmaWxlcyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuY29uZmlnLmxvYWRFYWdlcmx5KSB7XG5cbiAgICAgIHRoaXMuY29uZmlnLmxvYWRFYWdlcmx5LmZvckVhY2goKHBhdCkgPT4ge1xuXG4gICAgICAgIGdsb2Iuc3luYyhwYXQsIHsgY3dkOiB0aGlzLnByb2plY3REaXIgfSkuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG5cbiAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuY2hpbGQgPSBjcC5mb3JrKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2F0b20tdGVybmpzLXNlcnZlci13b3JrZXIuanMnKSk7XG4gICAgdGhpcy5jaGlsZC5vbignbWVzc2FnZScsIHRoaXMub25Xb3JrZXJNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuY2hpbGQub24oJ2Vycm9yJywgdGhpcy5vbkVycm9yKTtcbiAgICB0aGlzLmNoaWxkLm9uKCdkaXNjb25uZWN0JywgdGhpcy5vbkRpc2Nvbm5lY3QpO1xuICAgIHRoaXMuY2hpbGQuc2VuZCh7XG5cbiAgICAgIHR5cGU6ICdpbml0JyxcbiAgICAgIGRpcjogdGhpcy5wcm9qZWN0RGlyLFxuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGRlZnM6IGRlZnMsXG4gICAgICBwbHVnaW5zOiBwbHVnaW5zLFxuICAgICAgZmlsZXM6IGZpbGVzXG4gICAgfSk7XG4gIH1cblxuICBvbkVycm9yKGUpIHtcblxuICAgIHRoaXMucmVzdGFydChgQ2hpbGQgcHJvY2VzcyBlcnJvcjogJHtlfWApO1xuICB9XG5cbiAgb25EaXNjb25uZWN0KCkge1xuXG4gICAgY29uc29sZS53YXJuKCdjaGlsZCBwcm9jZXNzIGRpc2Nvbm5lY3RlZC4nKTtcbiAgfVxuXG4gIHJlcXVlc3QodHlwZSwgZGF0YSkge1xuXG4gICAgaWYgKHRoaXMucGVuZGluZ1JlcXVlc3QgPj0gbWF4UGVuZGluZ1JlcXVlc3RzKSB7XG5cbiAgICAgIHRoaXMucmVzdGFydCgnTWF4IG51bWJlciBvZiBwZW5kaW5nIHJlcXVlc3RzIHJlYWNoZWQuIFJlc3RhcnRpbmcgc2VydmVyLi4uJyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcmVxdWVzdElEID0gdXVpZC52MSgpO1xuXG4gICAgdGhpcy5wZW5kaW5nUmVxdWVzdCsrO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgdGhpcy5yZXNvbHZlc1tyZXF1ZXN0SURdID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMucmVqZWN0c1tyZXF1ZXN0SURdID0gcmVqZWN0O1xuXG4gICAgICB0aGlzLmNoaWxkLnNlbmQoe1xuXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGlkOiByZXF1ZXN0SUQsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZmx1c2goKSB7XG5cbiAgICB0aGlzLnJlcXVlc3QoJ2ZsdXNoJywge30pLnRoZW4oKCkgPT4ge1xuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnQWxsIGZpbGVzIGZldGNoZWQgYW5kIGFuYWx5emVkLicpO1xuICAgIH0pO1xuICB9XG5cbiAgZG9udExvYWQoZmlsZSkge1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5kb250TG9hZCkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmRvbnRMb2FkLnNvbWUoKHBhdCkgPT4ge1xuXG4gICAgICByZXR1cm4gbWluaW1hdGNoKGZpbGUsIHBhdCk7XG4gICAgfSk7XG4gIH1cblxuICByZXN0YXJ0KG1lc3NhZ2UpIHtcblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlIHx8ICdSZXN0YXJ0aW5nIFNlcnZlci4uLicsIHtcblxuICAgICAgZGlzbWlzc2FibGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBtYW5hZ2VyLmRlc3Ryb3lTZXJ2ZXIodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBtYW5hZ2VyLnN0YXJ0U2VydmVyKHRoaXMucHJvamVjdERpcik7XG4gIH1cblxuICBvbldvcmtlck1lc3NhZ2UoZSkge1xuXG4gICAgaWYgKGUuZXJyb3IgJiYgZS5lcnJvci5pc1VuY2F1Z2h0RXhjZXB0aW9uKSB7XG5cbiAgICAgIHRoaXMucmVzdGFydChgVW5jYXVnaHRFeGNlcHRpb246ICR7ZS5lcnJvci5tZXNzYWdlfS4gUmVzdGFydGluZyBTZXJ2ZXIuLi5gKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzRXJyb3IgPSBlLmVycm9yICE9PSAnbnVsbCcgJiYgZS5lcnJvciAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgY29uc3QgaWQgPSBlLmlkO1xuXG4gICAgaWYgKCFpZCkge1xuXG4gICAgICBjb25zb2xlLmVycm9yKCdubyBpZCBnaXZlbicsIGUpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGlzRXJyb3IpIHtcblxuICAgICAgdGhpcy5yZWplY3RzW2lkXSAmJiB0aGlzLnJlamVjdHNbaWRdKGUuZXJyb3IpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgdGhpcy5yZXNvbHZlc1tpZF0gJiYgdGhpcy5yZXNvbHZlc1tpZF0oZS5kYXRhKTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5yZXNvbHZlc1tpZF07XG4gICAgZGVsZXRlIHRoaXMucmVqZWN0c1tpZF07XG5cbiAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0LS07XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gICAgaWYgKCF0aGlzLmNoaWxkKSB7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLnJlamVjdHMpIHtcblxuICAgICAgdGhpcy5yZWplY3RzW2tleV0oJ1NlcnZlciBpcyBiZWluZyBkZXN0cm95ZWQuIFJlamVjdGluZy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc29sdmVzID0ge307XG4gICAgdGhpcy5yZWplY3RzID0ge307XG5cbiAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0ID0gMDtcblxuICAgIHRyeSB7XG5cbiAgICAgIHRoaXMuY2hpbGQuZGlzY29ubmVjdCgpO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcmVhZEpTT04oZmlsZU5hbWUpIHtcblxuICAgIGlmIChmaWxlRXhpc3RzKGZpbGVOYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgZmlsZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlTmFtZSwgJ3V0ZjgnKTtcblxuICAgIHRyeSB7XG5cbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZpbGUpO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgIGBCYWQgSlNPTiBpbiAke2ZpbGVOYW1lfTogJHtlLm1lc3NhZ2V9LiBQbGVhc2UgcmVzdGFydCBhdG9tIGFmdGVyIHRoZSBmaWxlIGlzIGZpeGVkLiBUaGlzIGlzc3VlIGlzbid0IGZ1bGx5IGNvdmVyZWQgeWV0LmAsXG4gICAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfVxuICAgICAgKTtcblxuICAgICAgbWFuYWdlci5kZXN0cm95U2VydmVyKHRoaXMucHJvamVjdERpcik7XG4gICAgfVxuICB9XG5cbiAgbWVyZ2VPYmplY3RzKGJhc2UsIHZhbHVlKSB7XG5cbiAgICBpZiAoIWJhc2UpIHtcblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHtcblxuICAgICAgcmV0dXJuIGJhc2U7XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBwcm9wIGluIGJhc2UpIHtcblxuICAgICAgcmVzdWx0W3Byb3BdID0gYmFzZVtwcm9wXTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gdmFsdWUpIHtcblxuICAgICAgcmVzdWx0W3Byb3BdID0gdmFsdWVbcHJvcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJlYWRQcm9qZWN0RmlsZShmaWxlTmFtZSkge1xuXG4gICAgbGV0IGRhdGEgPSB0aGlzLnJlYWRKU09OKGZpbGVOYW1lKTtcblxuICAgIGlmICghZGF0YSkge1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgb3B0aW9uIGluIHRoaXMuZGVmYXVsdENvbmZpZykge1xuXG4gICAgICBpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkob3B0aW9uKSkge1xuXG4gICAgICAgIGRhdGFbb3B0aW9uXSA9IHRoaXMuZGVmYXVsdENvbmZpZ1tvcHRpb25dO1xuXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbiA9PT0gJ3BsdWdpbnMnKSB7XG5cbiAgICAgICAgZGF0YVtvcHRpb25dID0gdGhpcy5tZXJnZU9iamVjdHModGhpcy5kZWZhdWx0Q29uZmlnW29wdGlvbl0sIGRhdGFbb3B0aW9uXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBmaW5kRmlsZShmaWxlLCBwcm9qZWN0RGlyLCBmYWxsYmFja0Rpcikge1xuXG4gICAgbGV0IGxvY2FsID0gcGF0aC5yZXNvbHZlKHByb2plY3REaXIsIGZpbGUpO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVMb2FkaW5nTG9jYWwgJiYgZnMuZXhpc3RzU3luYyhsb2NhbCkpIHtcblxuICAgICAgcmV0dXJuIGxvY2FsO1xuICAgIH1cblxuICAgIGxldCBzaGFyZWQgPSBwYXRoLnJlc29sdmUoZmFsbGJhY2tEaXIsIGZpbGUpO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2hhcmVkKSkge1xuXG4gICAgICByZXR1cm4gc2hhcmVkO1xuICAgIH1cbiAgfVxuXG4gIGZpbmREZWZzKHByb2plY3REaXIsIGNvbmZpZykge1xuXG4gICAgbGV0IGRlZnMgPSBbXTtcbiAgICBsZXQgc3JjID0gY29uZmlnLmxpYnMuc2xpY2UoKTtcblxuICAgIGlmIChjb25maWcuZWNtYVNjcmlwdCAmJiBzcmMuaW5kZXhPZignZWNtYXNjcmlwdCcpID09PSAtMSkge1xuXG4gICAgICBzcmMudW5zaGlmdCgnZWNtYXNjcmlwdCcpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3JjLmxlbmd0aDsgKytpKSB7XG5cbiAgICAgIGxldCBmaWxlID0gc3JjW2ldO1xuXG4gICAgICBpZiAoIS9cXC5qc29uJC8udGVzdChmaWxlKSkge1xuXG4gICAgICAgIGZpbGUgPSBgJHtmaWxlfS5qc29uYDtcbiAgICAgIH1cblxuICAgICAgbGV0IGZvdW5kID1cbiAgICAgICAgdGhpcy5maW5kRmlsZShmaWxlLCBwcm9qZWN0RGlyLCBwYXRoLnJlc29sdmUodGhpcy5kaXN0RGlyLCAnZGVmcycpKSB8fFxuICAgICAgICByZXNvbHZlRnJvbShwcm9qZWN0RGlyLCBgdGVybi0ke3NyY1tpXX1gKVxuICAgICAgICA7XG5cbiAgICAgIGlmICghZm91bmQpIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgZm91bmQgPSByZXF1aXJlLnJlc29sdmUoYHRlcm4tJHtzcmNbaV19YCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBGYWlsZWQgdG8gZmluZCBsaWJyYXJ5ICR7c3JjW2ldfVxcbmAsIHtcblxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZm91bmQpIHtcblxuICAgICAgICBkZWZzLnB1c2godGhpcy5yZWFkSlNPTihmb3VuZCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWZzO1xuICB9XG5cbiAgbG9hZFBsdWdpbnMocHJvamVjdERpciwgY29uZmlnKSB7XG5cbiAgICBsZXQgcGx1Z2lucyA9IGNvbmZpZy5wbHVnaW5zO1xuICAgIGxldCBvcHRpb25zID0ge307XG4gICAgdGhpcy5jb25maWcucGx1Z2luSW1wb3J0cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgcGx1Z2luIGluIHBsdWdpbnMpIHtcblxuICAgICAgbGV0IHZhbCA9IHBsdWdpbnNbcGx1Z2luXTtcblxuICAgICAgaWYgKCF2YWwpIHtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGZvdW5kID1cbiAgICAgICAgdGhpcy5maW5kRmlsZShgJHtwbHVnaW59LmpzYCwgcHJvamVjdERpciwgcGF0aC5yZXNvbHZlKHRoaXMuZGlzdERpciwgJ3BsdWdpbicpKSB8fFxuICAgICAgICByZXNvbHZlRnJvbShwcm9qZWN0RGlyLCBgdGVybi0ke3BsdWdpbn1gKVxuICAgICAgICA7XG5cbiAgICAgIGlmICghZm91bmQpIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgZm91bmQgPSByZXF1aXJlLnJlc29sdmUoYHRlcm4tJHtwbHVnaW59YCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghZm91bmQpIHtcblxuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgZm91bmQgPSByZXF1aXJlLnJlc29sdmUoYCR7dGhpcy5wcm9qZWN0RGlyfS9ub2RlX21vZHVsZXMvdGVybi0ke3BsdWdpbn1gKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYEZhaWxlZCB0byBmaW5kIHBsdWdpbiAke3BsdWdpbn1cXG5gLCB7XG5cbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5jb25maWcucGx1Z2luSW1wb3J0cy5wdXNoKGZvdW5kKTtcbiAgICAgIG9wdGlvbnNbcGF0aC5iYXNlbmFtZShwbHVnaW4pXSA9IHZhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfVxufVxuIl19