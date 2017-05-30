(function() {
  var Breakpoint, BreakpointManager, Client, Debugger, Event, EventEmitter, NodeDebuggerView, ProcessManager, Promise, R, childprocess, fs, jumpToBreakpoint, kill, log, logger, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  R = require('ramda');

  path = require('path');

  kill = require('tree-kill');

  Promise = require('bluebird');

  Client = require('_debugger').Client;

  childprocess = require('child_process');

  EventEmitter = require('./eventing').EventEmitter;

  Event = require('geval/event');

  logger = require('./logger');

  fs = require('fs');

  NodeDebuggerView = require('./node-debugger-view');

  jumpToBreakpoint = require('./jump-to-breakpoint');

  log = function(msg) {};

  ProcessManager = (function(superClass) {
    extend(ProcessManager, superClass);

    function ProcessManager(atom1) {
      this.atom = atom1 != null ? atom1 : atom;
      ProcessManager.__super__.constructor.call(this);
      this.process = null;
    }

    ProcessManager.prototype.parseEnv = function(env) {
      var e, j, key, len, ref1, result, value;
      if (!env) {
        return null;
      }
      key = function(s) {
        return s.split("=")[0];
      };
      value = function(s) {
        return s.split("=")[1];
      };
      result = {};
      ref1 = env.split(";");
      for (j = 0, len = ref1.length; j < len; j++) {
        e = ref1[j];
        result[key(e)] = value(e);
      }
      return result;
    };

    ProcessManager.prototype.startActiveFile = function() {
      return this.start(true);
    };

    ProcessManager.prototype.start = function(withActiveFile) {
      var startActive;
      startActive = withActiveFile;
      return this.cleanup().then((function(_this) {
        return function() {
          var appArgs, appPath, args, cwd, dbgFile, editor, env, nodeArgs, nodePath, packageJSON, packagePath, port, scriptMain;
          packagePath = _this.atom.project.resolvePath('package.json');
          if (fs.existsSync(packagePath)) {
            packageJSON = JSON.parse(fs.readFileSync(packagePath));
          }
          nodePath = _this.atom.config.get('node-debugger.nodePath');
          nodeArgs = _this.atom.config.get('node-debugger.nodeArgs');
          appArgs = _this.atom.config.get('node-debugger.appArgs');
          port = _this.atom.config.get('node-debugger.debugPort');
          env = _this.parseEnv(_this.atom.config.get('node-debugger.env'));
          scriptMain = _this.atom.project.resolvePath(_this.atom.config.get('node-debugger.scriptMain'));
          dbgFile = scriptMain || packageJSON && _this.atom.project.resolvePath(packageJSON.main);
          if (startActive === true || !dbgFile) {
            editor = _this.atom.workspace.getActiveTextEditor();
            appPath = editor.getPath();
            dbgFile = appPath;
          }
          cwd = path.dirname(dbgFile);
          args = [];
          if (nodeArgs) {
            args = args.concat(nodeArgs.split(' '));
          }
          args.push("--debug-brk=" + port);
          args.push(dbgFile);
          if (appArgs) {
            args = args.concat(appArgs.split(' '));
          }
          logger.error('spawn', {
            args: args,
            env: env
          });
          _this.process = childprocess.spawn(nodePath, args, {
            detached: true,
            cwd: cwd,
            env: env ? env : void 0
          });
          _this.process.stdout.on('data', function(d) {
            return logger.info('child_process', d.toString());
          });
          _this.process.stderr.on('data', function(d) {
            return logger.info('child_process', d.toString());
          });
          _this.process.stdout.on('end', function() {
            return logger.info('child_process', 'end out');
          });
          _this.process.stderr.on('end', function() {
            return logger.info('child_process', 'end error');
          });
          _this.emit('processCreated', _this.process);
          _this.process.once('error', function(err) {
            switch (err.code) {
              case "ENOENT":
                logger.error('child_process', "ENOENT exit code. Message: " + err.message);
                atom.notifications.addError("Failed to start debugger. Exit code was ENOENT which indicates that the node executable could not be found. Try specifying an explicit path in your atom config file using the node-debugger.nodePath configuration setting.");
                break;
              default:
                logger.error('child_process', "Exit code " + err.code + ". " + err.message);
            }
            return _this.emit('processEnd', err);
          });
          _this.process.once('close', function() {
            logger.info('child_process', 'close');
            return _this.emit('processEnd', _this.process);
          });
          _this.process.once('disconnect', function() {
            logger.info('child_process', 'disconnect');
            return _this.emit('processEnd', _this.process);
          });
          return _this.process;
        };
      })(this));
    };

    ProcessManager.prototype.cleanup = function() {
      var self;
      self = this;
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var onProcessEnd;
          if (_this.process == null) {
            return resolve();
          }
          if (_this.process.exitCode) {
            logger.info('child_process', 'process already exited with code ' + _this.process.exitCode);
            _this.process = null;
            return resolve();
          }
          onProcessEnd = R.once(function() {
            logger.info('child_process', 'die');
            _this.emit('processEnd', _this.process);
            _this.process = null;
            return resolve();
          });
          logger.info('child_process', 'start killing process');
          kill(_this.process.pid);
          _this.process.once('disconnect', onProcessEnd);
          _this.process.once('exit', onProcessEnd);
          return _this.process.once('close', onProcessEnd);
        };
      })(this));
    };

    return ProcessManager;

  })(EventEmitter);

  Breakpoint = (function() {
    function Breakpoint(editor1, script1, line1) {
      this.editor = editor1;
      this.script = script1;
      this.line = line1;
      this.updateVisualization = bind(this.updateVisualization, this);
      this.clearId = bind(this.clearId, this);
      this.setId = bind(this.setId, this);
      this.marker = null;
      this.marker = this.editor.markBufferPosition([this.line, 0], {
        invalidate: 'never'
      });
      this.decoration = null;
      this.onDidChangeSubscription = this.marker.onDidChange((function(_this) {
        return function(event) {
          log("Breakpoint.markerchanged: " + event.newHeadBufferPosition);
          return _this.line = event.newHeadBufferPosition.row;
        };
      })(this));
      this.onDidDestroySubscription = this.marker.onDidDestroy((function(_this) {
        return function() {
          _this.marker = null;
          return _this.decoration = null;
        };
      })(this));
      this.id = null;
      this.updateVisualization();
    }

    Breakpoint.prototype.dispose = function() {
      this.onDidChangeSubscription.dispose();
      this.onDidDestroySubscription.dispose();
      this.id = null;
      if (this.decoration) {
        this.decoration.destroy();
      }
      this.decoration = null;
      if (this.marker) {
        this.marker.destroy();
      }
      return this.marker = null;
    };

    Breakpoint.prototype.setId = function(id1) {
      this.id = id1;
      return this.updateVisualization();
    };

    Breakpoint.prototype.clearId = function() {
      return this.setId(null);
    };

    Breakpoint.prototype.updateVisualization = function() {
      var className;
      if (this.decoration) {
        this.decoration.destroy();
      }
      className = this.id ? 'node-debugger-attached-breakpoint' : 'node-debugger-detached-breakpoint';
      if (this.marker) {
        return this.decoration = this.editor.decorateMarker(this.marker, {
          type: 'line-number',
          "class": className
        });
      }
    };

    return Breakpoint;

  })();

  BreakpointManager = (function() {
    function BreakpointManager(_debugger) {
      this["debugger"] = _debugger;
      log("BreakpointManager.constructor");
      this.breakpoints = [];
      this.client = null;
      this.removeOnConnected = this["debugger"].subscribe('connected', (function(_this) {
        return function() {
          var breakpoint, j, len, ref1, results;
          log("BreakpointManager.connected");
          _this.client = _this["debugger"].client;
          ref1 = _this.breakpoints;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            breakpoint = ref1[j];
            results.push(_this.attachBreakpoint(breakpoint));
          }
          return results;
        };
      })(this));
      this.removeOnDisconnected = this["debugger"].subscribe('disconnected', (function(_this) {
        return function() {
          var breakpoint, j, len, ref1, results;
          log("BreakpointManager.disconnected");
          _this.client = null;
          ref1 = _this.breakpoints;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            breakpoint = ref1[j];
            results.push(breakpoint.clearId());
          }
          return results;
        };
      })(this));
      this.onAddBreakpointEvent = Event();
      this.onRemoveBreakpointEvent = Event();
    }

    BreakpointManager.prototype.dispose = function() {
      if (this.removeOnConnected) {
        this.removeOnConnected();
      }
      this.removeOnConnected = null;
      if (this.removeOnDisconnected) {
        this.removeOnDisconnected();
      }
      return this.removeOnDisconnected = null;
    };

    BreakpointManager.prototype.toggleBreakpoint = function(editor, script, line) {
      var maybeBreakpoint;
      log("BreakpointManager.toggleBreakpoint " + script + ", " + line);
      maybeBreakpoint = this.tryFindBreakpoint(script, line);
      if (maybeBreakpoint) {
        return this.removeBreakpoint(maybeBreakpoint.breakpoint, maybeBreakpoint.index);
      } else {
        return this.addBreakpoint(editor, script, line);
      }
    };

    BreakpointManager.prototype.removeBreakpoint = function(breakpoint, index) {
      log("BreakpointManager.removeBreakpoint " + index);
      this.breakpoints.splice(index, 1);
      this.onRemoveBreakpointEvent.broadcast(breakpoint);
      this.detachBreakpoint(breakpoint.id);
      return breakpoint.dispose();
    };

    BreakpointManager.prototype.addBreakpoint = function(editor, script, line) {
      var breakpoint;
      log("BreakpointManager.addBreakpoint " + script + ", " + line);
      breakpoint = new Breakpoint(editor, script, line);
      log("BreakpointManager.addBreakpoint - adding to list");
      this.breakpoints.push(breakpoint);
      log("BreakpointManager.addBreakpoint - publishing event, num breakpoints=" + this.breakpoints.length);
      this.onAddBreakpointEvent.broadcast(breakpoint);
      log("BreakpointManager.addBreakpoint - attaching");
      return this.attachBreakpoint(breakpoint);
    };

    BreakpointManager.prototype.attachBreakpoint = function(breakpoint) {
      var self;
      log("BreakpointManager.attachBreakpoint");
      self = this;
      return new Promise(function(resolve, reject) {
        if (!self.client) {
          return resolve();
        }
        log("BreakpointManager.attachBreakpoint - client request");
        return self.client.setBreakpoint({
          type: 'script',
          target: breakpoint.script,
          line: breakpoint.line,
          condition: breakpoint.condition
        }, function(err, res) {
          log("BreakpointManager.attachBreakpoint - done");
          if (err) {
            breakpoint.clearId();
            return reject(err);
          } else {
            breakpoint.setId(res.breakpoint);
            return resolve(breakpoint);
          }
        });
      });
    };

    BreakpointManager.prototype.detachBreakpoint = function(breakpointId) {
      var self;
      log("BreakpointManager.detachBreakpoint");
      self = this;
      return new Promise(function(resolve, reject) {
        if (!self.client) {
          return resolve();
        }
        if (!breakpointId) {
          return resolve();
        }
        log("BreakpointManager.detachBreakpoint - client request");
        return self.client.clearBreakpoint({
          breakpoint: breakpointId
        }, function(err) {
          return resolve();
        });
      });
    };

    BreakpointManager.prototype.tryFindBreakpoint = function(script, line) {
      var breakpoint, i, j, len, ref1;
      ref1 = this.breakpoints;
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        breakpoint = ref1[i];
        if (breakpoint.script === script && breakpoint.line === line) {
          return {
            breakpoint: breakpoint,
            index: i
          };
        }
      }
    };

    return BreakpointManager;

  })();

  Debugger = (function(superClass) {
    extend(Debugger, superClass);

    function Debugger(atom1) {
      this.atom = atom1;
      this.toggle = bind(this.toggle, this);
      this.isConnected = bind(this.isConnected, this);
      this.cleanupInternal = bind(this.cleanupInternal, this);
      this.cleanup = bind(this.cleanup, this);
      this.bindEvents = bind(this.bindEvents, this);
      this.attachInternal = bind(this.attachInternal, this);
      this.attach = bind(this.attach, this);
      this.startActiveFile = bind(this.startActiveFile, this);
      this.start = bind(this.start, this);
      this.setSelectedFrame = bind(this.setSelectedFrame, this);
      this.getSelectedFrame = bind(this.getSelectedFrame, this);
      Debugger.__super__.constructor.call(this);
      this.client = null;
      this.breakpointManager = new BreakpointManager(this);
      this.onBreakEvent = Event();
      this.onBreak = this.onBreakEvent.listen;
      this.onAddBreakpoint = this.breakpointManager.onAddBreakpointEvent.listen;
      this.onRemoveBreakpoint = this.breakpointManager.onRemoveBreakpointEvent.listen;
      this.processManager = new ProcessManager(this.atom);
      this.processManager.on('processCreated', this.attachInternal);
      this.processManager.on('processEnd', this.cleanupInternal);
      this.onSelectedFrameEvent = Event();
      this.onSelectedFrame = this.onSelectedFrameEvent.listen;
      this.selectedFrame = null;
      jumpToBreakpoint(this);
    }

    Debugger.prototype.getSelectedFrame = function() {
      return this.selectedFrame;
    };

    Debugger.prototype.setSelectedFrame = function(frame, index) {
      this.selectedFrame = {
        frame: frame,
        index: index
      };
      return this.onSelectedFrameEvent.broadcast(this.selectedFrame);
    };

    Debugger.prototype.dispose = function() {
      if (this.breakpointManager) {
        this.breakpointManager.dispose();
      }
      this.breakpointManager = null;
      NodeDebuggerView.destroy();
      return jumpToBreakpoint.destroy();
    };

    Debugger.prototype.stopRetrying = function() {
      if (this.timeout == null) {
        return;
      }
      return clearTimeout(this.timeout);
    };

    Debugger.prototype.step = function(type, count) {
      var self;
      self = this;
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.client.step(type, count, function(err) {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
        };
      })(this));
    };

    Debugger.prototype.reqContinue = function() {
      var self;
      self = this;
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.client.req({
            command: 'continue'
          }, function(err) {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
        };
      })(this));
    };

    Debugger.prototype.getScriptById = function(id) {
      var self;
      self = this;
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.client.req({
            command: 'scripts',
            "arguments": {
              ids: [id],
              includeSource: true
            }
          }, function(err, res) {
            if (err) {
              return reject(err);
            }
            return resolve(res[0]);
          });
        };
      })(this));
    };

    Debugger.prototype.fullTrace = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.client.fullTrace(function(err, res) {
            if (err) {
              return reject(err);
            }
            return resolve(res);
          });
        };
      })(this));
    };

    Debugger.prototype.start = function() {
      this.debugHost = "127.0.0.1";
      this.debugPort = this.atom.config.get('node-debugger.debugPort');
      this.externalProcess = false;
      NodeDebuggerView.show(this);
      return this.processManager.start();
    };

    Debugger.prototype.startActiveFile = function() {
      this.debugHost = "127.0.0.1";
      this.debugPort = this.atom.config.get('node-debugger.debugPort');
      this.externalProcess = false;
      NodeDebuggerView.show(this);
      return this.processManager.startActiveFile();
    };

    Debugger.prototype.attach = function() {
      this.debugHost = this.atom.config.get('node-debugger.debugHost');
      this.debugPort = this.atom.config.get('node-debugger.debugPort');
      this.externalProcess = true;
      NodeDebuggerView.show(this);
      return this.attachInternal();
    };

    Debugger.prototype.attachInternal = function() {
      var attemptConnect, attemptConnectCount, onConnectionError, self;
      logger.info('debugger', 'start connect to process');
      self = this;
      attemptConnectCount = 0;
      attemptConnect = function() {
        logger.info('debugger', 'attempt to connect to child process');
        if (self.client == null) {
          logger.info('debugger', 'client has been cleanup');
          return;
        }
        attemptConnectCount++;
        return self.client.connect(self.debugPort, self.debugHost);
      };
      onConnectionError = (function(_this) {
        return function() {
          var timeout;
          logger.info('debugger', "trying to reconnect " + attemptConnectCount);
          timeout = 500;
          _this.emit('reconnect', {
            count: attemptConnectCount,
            port: self.debugPort,
            host: self.debugHost,
            timeout: timeout
          });
          return _this.timeout = setTimeout(function() {
            return attemptConnect();
          }, timeout);
        };
      })(this);
      this.client = new Client();
      this.client.once('ready', this.bindEvents);
      this.client.on('unhandledResponse', (function(_this) {
        return function(res) {
          return _this.emit('unhandledResponse', res);
        };
      })(this));
      this.client.on('break', (function(_this) {
        return function(res) {
          _this.onBreakEvent.broadcast(res.body);
          _this.emit('break', res.body);
          return _this.setSelectedFrame(null);
        };
      })(this));
      this.client.on('exception', (function(_this) {
        return function(res) {
          return _this.emit('exception', res.body);
        };
      })(this));
      this.client.on('error', onConnectionError);
      this.client.on('close', function() {
        return logger.info('client', 'client closed');
      });
      return attemptConnect();
    };

    Debugger.prototype.bindEvents = function() {
      logger.info('debugger', 'connected');
      this.emit('connected');
      return this.client.on('close', (function(_this) {
        return function() {
          logger.info('debugger', 'connection closed');
          return _this.processManager.cleanup().then(function() {
            return _this.emit('close');
          });
        };
      })(this));
    };

    Debugger.prototype.lookup = function(ref) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.client.reqLookup([ref], function(err, res) {
            if (err) {
              return reject(err);
            }
            return resolve(res[ref]);
          });
        };
      })(this));
    };

    Debugger.prototype["eval"] = function(text) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var ref1;
          return _this.client.reqFrameEval(text, ((ref1 = _this.selectedFrame) != null ? ref1.index : void 0) || 0, function(err, result) {
            if (err) {
              return reject(err);
            }
            return resolve(result);
          });
        };
      })(this));
    };

    Debugger.prototype.cleanup = function() {
      this.processManager.cleanup();
      NodeDebuggerView.destroy();
      return this.cleanupInternal();
    };

    Debugger.prototype.cleanupInternal = function() {
      if (this.client) {
        this.client.destroy();
      }
      this.client = null;
      jumpToBreakpoint.cleanup();
      return this.emit('disconnected');
    };

    Debugger.prototype.isConnected = function() {
      return this.client != null;
    };

    Debugger.prototype.toggle = function() {
      return NodeDebuggerView.toggle(this);
    };

    return Debugger;

  })(EventEmitter);

  exports.Debugger = Debugger;

  exports.ProcessManager = ProcessManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL2RlYnVnZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0tBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsT0FBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVCxTQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUNYLFlBQUEsR0FBZSxPQUFBLENBQVEsZUFBUjs7RUFDZCxlQUFnQixPQUFBLENBQVEsWUFBUjs7RUFDakIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVI7O0VBRW5CLEdBQUEsR0FBTSxTQUFDLEdBQUQsR0FBQTs7RUFFQTs7O0lBQ1Msd0JBQUMsS0FBRDtNQUFDLElBQUMsQ0FBQSx1QkFBRCxRQUFRO01BQ3BCLDhDQUFBO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUZBOzs2QkFJYixRQUFBLEdBQVUsU0FBQyxHQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUEsQ0FBbUIsR0FBbkI7QUFBQSxlQUFPLEtBQVA7O01BQ0EsR0FBQSxHQUFNLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBUixDQUFhLENBQUEsQ0FBQTtNQUFwQjtNQUNOLEtBQUEsR0FBUSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQVIsQ0FBYSxDQUFBLENBQUE7TUFBcEI7TUFDUixNQUFBLEdB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TSxjQUFOO0lBSmU7O3VCQU1qQixXQUFBLEdBQWEsU0FBQTtBQUNULGFBQU87SUFERTs7dUJBR2IsTUFBQSxHQUFRLFNBQUE7YUFDTixnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixJQUF4QjtJQURNOzs7O0tBekthOztFQTRLdkIsT0FBTyxDQUFDLFFBQVIsR0FBbUI7O0VBQ25CLE9BQU8sQ0FBQyxjQUFSLEdBQXlCO0FBaGF6QiIsInNvdXJjZXNDb250ZW50IjpbIlIgPSByZXF1aXJlICdyYW1kYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xua2lsbCA9IHJlcXVpcmUgJ3RyZWUta2lsbCdcblByb21pc2UgPSByZXF1aXJlICdibHVlYmlyZCdcbntDbGllbnR9ID0gcmVxdWlyZSAnX2RlYnVnZ2VyJ1xuY2hpbGRwcm9jZXNzID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbntFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSAnLi9ldmVudGluZydcbkV2ZW50ID0gcmVxdWlyZSAnZ2V2YWwvZXZlbnQnXG5sb2dnZXIgPSByZXF1aXJlICcuL2xvZ2dlcidcbmZzID0gcmVxdWlyZSAnZnMnXG5Ob2RlRGVidWdnZXJWaWV3ID0gcmVxdWlyZSAnLi9ub2RlLWRlYnVnZ2VyLXZpZXcnXG5qdW1wVG9CcmVha3BvaW50ID0gcmVxdWlyZSAnLi9qdW1wLXRvLWJyZWFrcG9pbnQnXG5cbmxvZyA9IChtc2cpIC0+ICNjb25zb2xlLmxvZyhtc2cpXG5cbmNsYXNzIFByb2Nlc3NNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG4gIGNvbnN0cnVjdG9yOiAoQGF0b20gPSBhdG9tKS0+XG4gICAgc3VwZXIoKVxuICAgIEBwcm9jZXNzID0gbnVsbFxuXG4gIHBhcnNlRW52OiAoZW52KSAtPlxuICAgIHJldHVybiBudWxsIHVubGVzcyBlbnZcbiAgICBrZXkgPSAocykgLT4gcy5zcGxpdChcIj1cIilbMF1cbiAgICB2YWx1ZSA9IChzKSAtPiBzLnNwbGl0KFwiPVwiKVsxXVxuICAgIHJlc3VsdCA9IHt9XG4gICAgcmVzdWx0W2tleShlKV0gPSB2YWx1ZShlKSBmb3IgZSBpbiBlbnYuc3BsaXQoXCI7XCIpXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIHN0YXJ0QWN0aXZlRmlsZTogKCkgLT5cbiAgICBAc3RhcnQgdHJ1ZVxuXG4gIHN0YXJ0OiAod2l0aEFjdGl2ZUZpbGUpIC0+XG4gICAgc3RhcnRBY3RpdmUgPSB3aXRoQWN0aXZlRmlsZVxuICAgIEBjbGVhbnVwKClcbiAgICAgIC50aGVuID0+XG4gICAgICAgIHBhY2thZ2VQYXRoID0gQGF0b20ucHJvamVjdC5yZXNvbHZlUGF0aCgncGFja2FnZS5qc29uJylcbiAgICAgICAgcGFja2FnZUpTT04gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYWNrYWdlUGF0aCkpIGlmIGZzLmV4aXN0c1N5bmMocGFja2FnZVBhdGgpXG4gICAgICAgIG5vZGVQYXRoID0gQGF0b20uY29uZmlnLmdldCgnbm9kZS1kZWJ1Z2dlci5ub2RlUGF0aCcpXG4gICAgICAgIG5vZGVBcmdzID0gQGF0b20uY29uZmlnLmdldCgnbm9kZS1kZWJ1Z2dlci5ub2RlQXJncycpXG4gICAgICAgIGFwcEFyZ3MgPSBAYXRvbS5jb25maWcuZ2V0KCdub2RlLWRlYnVnZ2VyLmFwcEFyZ3MnKVxuICAgICAgICBwb3J0ID0gQGF0b20uY29uZmlnLmdldCgnbm9kZS1kZWJ1Z2dlci5kZWJ1Z1BvcnQnKVxuICAgICAgICBlbnYgPSBAcGFyc2VFbnYgQGF0b20uY29uZmlnLmdldCgnbm9kZS1kZWJ1Z2dlci5lbnYnKVxuICAgICAgICBzY3JpcHRNYWluID0gQGF0b20ucHJvamVjdC5yZXNvbHZlUGF0aChAYXRvbS5jb25maWcuZ2V0KCdub2RlLWRlYnVnZ2VyLnNjcmlwdE1haW4nKSlcblxuICAgICAgICBkYmdGaWxlID0gc2NyaXB0TWFpbiB8fCBwYWNrYWdlSlNPTiAmJiBAYXRvbS5wcm9qZWN0LnJlc29sdmVQYXRoKHBhY2thZ2VKU09OLm1haW4pXG5cbiAgICAgICAgaWYgc3RhcnRBY3RpdmUgPT0gdHJ1ZSB8fCAhZGJnRmlsZVxuICAgICAgICAgIGVkaXRvciA9IEBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgICBhcHBQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIGRiZ0ZpbGUgPSBhcHBQYXRoXG5cbiAgICAgICAgY3dkID0gcGF0aC5kaXJuYW1lKGRiZ0ZpbGUpXG5cbiAgICAgICAgYXJncyA9IFtdXG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCAobm9kZUFyZ3Muc3BsaXQoJyAnKSkgaWYgbm9kZUFyZ3NcbiAgICAgICAgYXJncy5wdXNoIFwiLS1kZWJ1Zy1icms9I3twb3J0fVwiXG4gICAgICAgIGFyZ3MucHVzaCBkYmdGaWxlXG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCAoYXBwQXJncy5zcGxpdCgnICcpKSBpZiBhcHBBcmdzXG5cbiAgICAgICAgbG9nZ2VyLmVycm9yICdzcGF3bicsIHthcmdzOmFyZ3MsIGVudjplbnZ9XG4gICAgICAgIEBwcm9jZXNzID0gY2hpbGRwcm9jZXNzLnNwYXduIG5vZGVQYXRoLCBhcmdzLCB7XG4gICAgICAgICAgZGV0YWNoZWQ6IHRydWVcbiAgICAgICAgICBjd2Q6IGN3ZFxuICAgICAgICAgIGVudjogZW52IGlmIGVudlxuICAgICAgICB9XG5cbiAgICAgICAgQHByb2Nlc3Muc3Rkb3V0Lm9uICdkYXRhJywgKGQpIC0+XG4gICAgICAgICAgbG9nZ2VyLmluZm8gJ2NoaWxkX3Byb2Nlc3MnLCBkLnRvU3RyaW5nKClcblxuICAgICAgICBAcHJvY2Vzcy5zdGRlcnIub24gJ2RhdGEnLCAoZCkgLT5cbiAgICAgICAgICBsb2dnZXIuaW5mbyAnY2hpbGRfcHJvY2VzcycsIGQudG9TdHJpbmcoKVxuXG4gICAgICAgIEBwcm9jZXNzLnN0ZG91dC5vbiAnZW5kJywgKCkgLT5cbiAgICAgICAgICBsb2dnZXIuaW5mbyAnY2hpbGRfcHJvY2VzcycsICdlbmQgb3V0J1xuXG4gICAgICAgIEBwcm9jZXNzLnN0ZGVyci5vbiAnZW5kJywgKCkgLT5cbiAgICAgICAgICBsb2dnZXIuaW5mbyAnY2hpbGRfcHJvY2VzcycsICdlbmQgZXJyb3InXG5cbiAgICAgICAgQGVtaXQgJ3Byb2Nlc3NDcmVhdGVkJywgQHByb2Nlc3NcblxuICAgICAgICBAcHJvY2Vzcy5vbmNlICdlcnJvcicsIChlcnIpID0+XG4gICAgICAgICAgc3dpdGNoIGVyci5jb2RlXG4gICAgICAgICAgICB3aGVuIFwiRU5PRU5UXCJcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yICdjaGlsZF9wcm9jZXNzJywgXCJFTk9FTlQgZXhpdCBjb2RlLiBNZXNzYWdlOiAje2Vyci5tZXNzYWdlfVwiXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBzdGFydCBkZWJ1Z2dlci5cbiAgICAgICAgICAgICAgICBFeGl0IGNvZGUgd2FzIEVOT0VOVCB3aGljaCBpbmRpY2F0ZXMgdGhhdCB0aGUgbm9kZVxuICAgICAgICAgICAgICAgIGV4ZWN1dGFibGUgY291bGQgbm90IGJlIGZvdW5kLlxuICAgICAgICAgICAgICAgIFRyeSBzcGVjaWZ5aW5nIGFuIGV4cGxpY2l0IHBhdGggaW4geW91ciBhdG9tIGNvbmZpZyBmaWxlXG4gICAgICAgICAgICAgICAgdXNpbmcgdGhlIG5vZGUtZGVidWdnZXIubm9kZVBhdGggY29uZmlndXJhdGlvbiBzZXR0aW5nLlwiXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yICdjaGlsZF9wcm9jZXNzJywgXCJFeGl0IGNvZGUgI3tlcnIuY29kZX0uICN7ZXJyLm1lc3NhZ2V9XCJcbiAgICAgICAgICBAZW1pdCAncHJvY2Vzc0VuZCcsIGVyclxuXG4gICAgICAgIEBwcm9jZXNzLm9uY2UgJ2Nsb3NlJywgKCkgPT5cbiAgICAgICAgICBsb2dnZXIuaW5mbyAnY2hpbGRfcHJvY2VzcycsICdjbG9zZSdcbiAgICAgICAgICBAZW1pdCAncHJvY2Vzc0VuZCcsIEBwcm9jZXNzXG5cbiAgICAgICAgQHByb2Nlc3Mub25jZSAnZGlzY29ubmVjdCcsICgpID0+XG4gICAgICAgICAgbG9nZ2VyLmluZm8gJ2NoaWxkX3Byb2Nlc3MnLCAnZGlzY29ubmVjdCdcbiAgICAgICAgICBAZW1pdCAncHJvY2Vzc0VuZCcsIEBwcm9jZXNzXG5cbiAgICAgICAgcmV0dXJuIEBwcm9jZXNzXG5cbiAgY2xlYW51cDogLT5cbiAgICBzZWxmID0gdGhpc1xuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICByZXR1cm4gcmVzb2x2ZSgpIGlmIG5vdCBAcHJvY2Vzcz9cbiAgICAgIGlmIEBwcm9jZXNzLmV4aXRDb2RlXG4gICAgICAgIGxvZ2dlci5pbmZvICdjaGlsZF9wcm9jZXNzJywgJ3Byb2Nlc3MgYWxyZWFkeSBleGl0ZWQgd2l0aCBjb2RlICcgKyBAcHJvY2Vzcy5leGl0Q29kZVxuICAgICAgICBAcHJvY2VzcyA9IG51bGxcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoKVxuXG4gICAgICBvblByb2Nlc3NFbmQgPSBSLm9uY2UgPT5cbiAgICAgICAgbG9nZ2VyLmluZm8gJ2NoaWxkX3Byb2Nlc3MnLCAnZGllJ1xuICAgICAgICBAZW1pdCAncHJvY2Vzc0VuZCcsIEBwcm9jZXNzXG4gICAgICAgIEBwcm9jZXNzID0gbnVsbFxuICAgICAgICByZXNvbHZlKClcblxuICAgICAgbG9nZ2VyLmluZm8gJ2NoaWxkX3Byb2Nlc3MnLCAnc3RhcnQga2lsbGluZyBwcm9jZXNzJ1xuICAgICAga2lsbCBAcHJvY2Vzcy5waWRcblxuICAgICAgQHByb2Nlc3Mub25jZSAnZGlzY29ubmVjdCcsIG9uUHJvY2Vzc0VuZFxuICAgICAgQHByb2Nlc3Mub25jZSAnZXhpdCcsIG9uUHJvY2Vzc0VuZFxuICAgICAgQHByb2Nlc3Mub25jZSAnY2xvc2UnLCBvblByb2Nlc3NFbmRcblxuY2xhc3MgQnJlYWtwb2ludFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBzY3JpcHQsIEBsaW5lKSAtPlxuICAgIEBtYXJrZXIgPSBudWxsXG4gICAgQG1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtAbGluZSwgMF0sIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQGRlY29yYXRpb24gPSBudWxsXG4gICAgQG9uRGlkQ2hhbmdlU3Vic2NyaXB0aW9uID0gQG1hcmtlci5vbkRpZENoYW5nZSAoZXZlbnQpID0+XG4gICAgICBsb2cgXCJCcmVha3BvaW50Lm1hcmtlcmNoYW5nZWQ6ICN7ZXZlbnQubmV3SGVhZEJ1ZmZlclBvc2l0aW9ufVwiXG4gICAgICBAbGluZSA9IGV2ZW50Lm5ld0hlYWRCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICBAb25EaWREZXN0cm95U3Vic2NyaXB0aW9uID0gQG1hcmtlci5vbkRpZERlc3Ryb3kgKCkgPT5cbiAgICAgIEBtYXJrZXIgPSBudWxsXG4gICAgICBAZGVjb3JhdGlvbiA9IG51bGxcbiAgICBAaWQgPSBudWxsXG4gICAgQHVwZGF0ZVZpc3VhbGl6YXRpb24oKVxuXG4gIGRpc3Bvc2U6ICgpIC0+XG4gICAgQG9uRGlkQ2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEBvbkRpZERlc3Ryb3lTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQGlkID0gbnVsbFxuICAgIEBkZWNvcmF0aW9uLmRlc3Ryb3koKSBpZiBAZGVjb3JhdGlvblxuICAgIEBkZWNvcmF0aW9uID0gbnVsbFxuICAgIEBtYXJrZXIuZGVzdHJveSgpIGlmIEBtYXJrZXJcbiAgICBAbWFya2VyID0gbnVsbFxuXG4gIHNldElkOiAoQGlkKSA9PlxuICAgIEB1cGRhdGVWaXN1YWxpemF0aW9uKClcblxuICBjbGVhcklkOiAoKSA9PlxuICAgIEBzZXRJZChudWxsKVxuXG4gIHVwZGF0ZVZpc3VhbGl6YXRpb246ICgpID0+XG4gICAgQGRlY29yYXRpb24uZGVzdHJveSgpIGlmIEBkZWNvcmF0aW9uXG4gICAgY2xhc3NOYW1lID0gaWYgQGlkIHRoZW4gJ25vZGUtZGVidWdnZXItYXR0YWNoZWQtYnJlYWtwb2ludCcgZWxzZSAnbm9kZS1kZWJ1Z2dlci1kZXRhY2hlZC1icmVha3BvaW50J1xuICAgIEBkZWNvcmF0aW9uID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihAbWFya2VyLCB0eXBlOiAnbGluZS1udW1iZXInLCBjbGFzczogY2xhc3NOYW1lKSBpZiBAbWFya2VyXG5cbmNsYXNzIEJyZWFrcG9pbnRNYW5hZ2VyXG4gIGNvbnN0cnVjdG9yOiAoQGRlYnVnZ2VyKSAtPlxuICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmNvbnN0cnVjdG9yXCJcbiAgICBAYnJlYWtwb2ludHMgPSBbXVxuICAgIEBjbGllbnQgPSBudWxsXG4gICAgQHJlbW92ZU9uQ29ubmVjdGVkID0gQGRlYnVnZ2VyLnN1YnNjcmliZSAnY29ubmVjdGVkJywgPT5cbiAgICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmNvbm5lY3RlZFwiXG4gICAgICBAY2xpZW50ID0gQGRlYnVnZ2VyLmNsaWVudFxuICAgICAgQGF0dGFjaEJyZWFrcG9pbnQoYnJlYWtwb2ludCkgZm9yIGJyZWFrcG9pbnQgaW4gQGJyZWFrcG9pbnRzXG4gICAgQHJlbW92ZU9uRGlzY29ubmVjdGVkID0gQGRlYnVnZ2VyLnN1YnNjcmliZSAnZGlzY29ubmVjdGVkJywgPT5cbiAgICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmRpc2Nvbm5lY3RlZFwiXG4gICAgICBAY2xpZW50ID0gbnVsbFxuICAgICAgYnJlYWtwb2ludC5jbGVhcklkKCkgZm9yIGJyZWFrcG9pbnQgaW4gQGJyZWFrcG9pbnRzXG4gICAgQG9uQWRkQnJlYWtwb2ludEV2ZW50ID0gRXZlbnQoKVxuICAgIEBvblJlbW92ZUJyZWFrcG9pbnRFdmVudCA9IEV2ZW50KClcblxuICBkaXNwb3NlOiAoKSAtPlxuICAgIEByZW1vdmVPbkNvbm5lY3RlZCgpIGlmIEByZW1vdmVPbkNvbm5lY3RlZFxuICAgIEByZW1vdmVPbkNvbm5lY3RlZCA9IG51bGxcbiAgICBAcmVtb3ZlT25EaXNjb25uZWN0ZWQoKSBpZiBAcmVtb3ZlT25EaXNjb25uZWN0ZWRcbiAgICBAcmVtb3ZlT25EaXNjb25uZWN0ZWQgPSBudWxsXG5cbiAgdG9nZ2xlQnJlYWtwb2ludDogKGVkaXRvciwgc2NyaXB0LCBsaW5lKSAtPlxuICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLnRvZ2dsZUJyZWFrcG9pbnQgI3tzY3JpcHR9LCAje2xpbmV9XCJcbiAgICBtYXliZUJyZWFrcG9pbnQgPSBAdHJ5RmluZEJyZWFrcG9pbnQgc2NyaXB0LCBsaW5lXG4gICAgaWYgbWF5YmVCcmVha3BvaW50XG4gICAgICBAcmVtb3ZlQnJlYWtwb2ludCBtYXliZUJyZWFrcG9pbnQuYnJlYWtwb2ludCwgbWF5YmVCcmVha3BvaW50LmluZGV4XG4gICAgZWxzZVxuICAgICAgQGFkZEJyZWFrcG9pbnQgZWRpdG9yLCBzY3JpcHQsIGxpbmVcblxuICByZW1vdmVCcmVha3BvaW50OiAoYnJlYWtwb2ludCwgaW5kZXgpIC0+XG4gICAgbG9nIFwiQnJlYWtwb2ludE1hbmFnZXIucmVtb3ZlQnJlYWtwb2ludCAje2luZGV4fVwiXG4gICAgQGJyZWFrcG9pbnRzLnNwbGljZSBpbmRleCwgMVxuICAgIEBvblJlbW92ZUJyZWFrcG9pbnRFdmVudC5icm9hZGNhc3QgYnJlYWtwb2ludFxuICAgIEBkZXRhY2hCcmVha3BvaW50IGJyZWFrcG9pbnQuaWRcbiAgICBicmVha3BvaW50LmRpc3Bvc2UoKVxuXG4gIGFkZEJyZWFrcG9pbnQ6IChlZGl0b3IsIHNjcmlwdCwgbGluZSkgLT5cbiAgICBsb2cgXCJCcmVha3BvaW50TWFuYWdlci5hZGRCcmVha3BvaW50ICN7c2NyaXB0fSwgI3tsaW5lfVwiXG4gICAgYnJlYWtwb2ludCA9IG5ldyBCcmVha3BvaW50KGVkaXRvciwgc2NyaXB0LCBsaW5lKVxuICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmFkZEJyZWFrcG9pbnQgLSBhZGRpbmcgdG8gbGlzdFwiXG4gICAgQGJyZWFrcG9pbnRzLnB1c2ggYnJlYWtwb2ludFxuICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmFkZEJyZWFrcG9pbnQgLSBwdWJsaXNoaW5nIGV2ZW50LCBudW0gYnJlYWtwb2ludHM9I3tAYnJlYWtwb2ludHMubGVuZ3RofVwiXG4gICAgQG9uQWRkQnJlYWtwb2ludEV2ZW50LmJyb2FkY2FzdCBicmVha3BvaW50XG4gICAgbG9nIFwiQnJlYWtwb2ludE1hbmFnZXIuYWRkQnJlYWtwb2ludCAtIGF0dGFjaGluZ1wiXG4gICAgQGF0dGFjaEJyZWFrcG9pbnQgYnJlYWtwb2ludFxuXG4gIGF0dGFjaEJyZWFrcG9pbnQ6IChicmVha3BvaW50KSAtPlxuICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmF0dGFjaEJyZWFrcG9pbnRcIlxuICAgIHNlbGYgPSB0aGlzXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHJldHVybiByZXNvbHZlKCkgdW5sZXNzIHNlbGYuY2xpZW50XG4gICAgICBsb2cgXCJCcmVha3BvaW50TWFuYWdlci5hdHRhY2hCcmVha3BvaW50IC0gY2xpZW50IHJlcXVlc3RcIlxuICAgICAgc2VsZi5jbGllbnQuc2V0QnJlYWtwb2ludCB7XG4gICAgICAgIHR5cGU6ICdzY3JpcHQnXG4gICAgICAgIHRhcmdldDogYnJlYWtwb2ludC5zY3JpcHRcbiAgICAgICAgbGluZTogYnJlYWtwb2ludC5saW5lXG4gICAgICAgIGNvbmRpdGlvbjogYnJlYWtwb2ludC5jb25kaXRpb25cbiAgICAgIH0sIChlcnIsIHJlcykgLT5cbiAgICAgICAgbG9nIFwiQnJlYWtwb2ludE1hbmFnZXIuYXR0YWNoQnJlYWtwb2ludCAtIGRvbmVcIlxuICAgICAgICBpZiBlcnJcbiAgICAgICAgICBicmVha3BvaW50LmNsZWFySWQoKVxuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBicmVha3BvaW50LnNldElkKHJlcy5icmVha3BvaW50KVxuICAgICAgICAgIHJlc29sdmUoYnJlYWtwb2ludClcblxuICBkZXRhY2hCcmVha3BvaW50OiAoYnJlYWtwb2ludElkKSAtPlxuICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmRldGFjaEJyZWFrcG9pbnRcIlxuICAgIHNlbGYgPSB0aGlzXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHJldHVybiByZXNvbHZlKCkgdW5sZXNzIHNlbGYuY2xpZW50XG4gICAgICByZXR1cm4gcmVzb2x2ZSgpIHVubGVzcyBicmVha3BvaW50SWRcbiAgICAgIGxvZyBcIkJyZWFrcG9pbnRNYW5hZ2VyLmRldGFjaEJyZWFrcG9pbnQgLSBjbGllbnQgcmVxdWVzdFwiXG4gICAgICBzZWxmLmNsaWVudC5jbGVhckJyZWFrcG9pbnQge1xuICAgICAgICBicmVha3BvaW50OiBicmVha3BvaW50SWRcbiAgICAgIH0sIChlcnIpIC0+XG4gICAgICAgIHJlc29sdmUoKVxuXG4gIHRyeUZpbmRCcmVha3BvaW50OiAoc2NyaXB0LCBsaW5lKSAtPlxuICAgIHJldHVybiB7IGJyZWFrcG9pbnQ6IGJyZWFrcG9pbnQsIGluZGV4OiBpIH0gZm9yIGJyZWFrcG9pbnQsIGkgaW4gQGJyZWFrcG9pbnRzIHdoZW4gYnJlYWtwb2ludC5zY3JpcHQgaXMgc2NyaXB0IGFuZCBicmVha3BvaW50LmxpbmUgaXMgbGluZVxuXG5jbGFzcyBEZWJ1Z2dlciBleHRlbmRzIEV2ZW50RW1pdHRlclxuICBjb25zdHJ1Y3RvcjogKEBhdG9tKS0+XG4gICAgc3VwZXIoKVxuICAgIEBjbGllbnQgPSBudWxsXG4gICAgQGJyZWFrcG9pbnRNYW5hZ2VyID0gbmV3IEJyZWFrcG9pbnRNYW5hZ2VyKHRoaXMpXG4gICAgQG9uQnJlYWtFdmVudCA9IEV2ZW50KClcbiAgICBAb25CcmVhayA9IEBvbkJyZWFrRXZlbnQubGlzdGVuXG4gICAgQG9uQWRkQnJlYWtwb2ludCA9IEBicmVha3BvaW50TWFuYWdlci5vbkFkZEJyZWFrcG9pbnRFdmVudC5saXN0ZW5cbiAgICBAb25SZW1vdmVCcmVha3BvaW50ID0gQGJyZWFrcG9pbnRNYW5hZ2VyLm9uUmVtb3ZlQnJlYWtwb2ludEV2ZW50Lmxpc3RlblxuICAgIEBwcm9jZXNzTWFuYWdlciA9IG5ldyBQcm9jZXNzTWFuYWdlcihAYXRvbSlcbiAgICBAcHJvY2Vzc01hbmFnZXIub24gJ3Byb2Nlc3NDcmVhdGVkJywgQGF0dGFjaEludGVybmFsXG4gICAgQHByb2Nlc3NNYW5hZ2VyLm9uICdwcm9jZXNzRW5kJywgQGNsZWFudXBJbnRlcm5hbFxuICAgIEBvblNlbGVjdGVkRnJhbWVFdmVudCA9IEV2ZW50KClcbiAgICBAb25TZWxlY3RlZEZyYW1lID0gQG9uU2VsZWN0ZWRGcmFtZUV2ZW50Lmxpc3RlblxuICAgIEBzZWxlY3RlZEZyYW1lID0gbnVsbFxuICAgIGp1bXBUb0JyZWFrcG9pbnQodGhpcylcblxuICBnZXRTZWxlY3RlZEZyYW1lOiAoKSA9PiBAc2VsZWN0ZWRGcmFtZVxuICBzZXRTZWxlY3RlZEZyYW1lOiAoZnJhbWUsIGluZGV4KSA9PlxuICAgICAgQHNlbGVjdGVkRnJhbWUgPSB7ZnJhbWUsIGluZGV4fVxuICAgICAgQG9uU2VsZWN0ZWRGcmFtZUV2ZW50LmJyb2FkY2FzdChAc2VsZWN0ZWRGcmFtZSlcblxuICBkaXNwb3NlOiAtPlxuICAgIEBicmVha3BvaW50TWFuYWdlci5kaXNwb3NlKCkgaWYgQGJyZWFrcG9pbnRNYW5hZ2VyXG4gICAgQGJyZWFrcG9pbnRNYW5hZ2VyID0gbnVsbFxuICAgIE5vZGVEZWJ1Z2dlclZpZXcuZGVzdHJveSgpXG4gICAganVtcFRvQnJlYWtwb2ludC5kZXN0cm95KClcblxuICBzdG9wUmV0cnlpbmc6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGltZW91dD9cbiAgICBjbGVhclRpbWVvdXQgQHRpbWVvdXRcblxuICBzdGVwOiAodHlwZSwgY291bnQpIC0+XG4gICAgc2VsZiA9IHRoaXNcbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGNsaWVudC5zdGVwIHR5cGUsIGNvdW50LCAoZXJyKSAtPlxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgIHJlc29sdmUoKVxuXG4gIHJlcUNvbnRpbnVlOiAtPlxuICAgIHNlbGYgPSB0aGlzXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEBjbGllbnQucmVxIHtcbiAgICAgICAgY29tbWFuZDogJ2NvbnRpbnVlJ1xuICAgICAgfSwgKGVycikgLT5cbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICByZXNvbHZlKClcblxuICBnZXRTY3JpcHRCeUlkOiAoaWQpIC0+XG4gICAgc2VsZiA9IHRoaXNcbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGNsaWVudC5yZXEge1xuICAgICAgICBjb21tYW5kOiAnc2NyaXB0cycsXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlkczogW2lkXSxcbiAgICAgICAgICBpbmNsdWRlU291cmNlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sIChlcnIsIHJlcykgLT5cbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICByZXNvbHZlKHJlc1swXSlcblxuXG4gIGZ1bGxUcmFjZTogKCkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGNsaWVudC5mdWxsVHJhY2UgKGVyciwgcmVzKSAtPlxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgIHJlc29sdmUocmVzKVxuXG4gIHN0YXJ0OiA9PlxuICAgICAgQGRlYnVnSG9zdCA9IFwiMTI3LjAuMC4xXCJcbiAgICAgIEBkZWJ1Z1BvcnQgPSBAYXRvbS5jb25maWcuZ2V0KCdub2RlLWRlYnVnZ2VyLmRlYnVnUG9ydCcpXG4gICAgICBAZXh0ZXJuYWxQcm9jZXNzID0gZmFsc2VcbiAgICAgIE5vZGVEZWJ1Z2dlclZpZXcuc2hvdyh0aGlzKVxuICAgICAgQHByb2Nlc3NNYW5hZ2VyLnN0YXJ0KClcbiAgICAgICMgZGVidWdnZXIgd2lsbCBhdHRhY2ggd2hlbiBwcm9jZXNzIGlzIHN0YXJ0ZWRcblxuICBzdGFydEFjdGl2ZUZpbGU6ID0+XG4gICAgICBAZGVidWdIb3N0ID0gXCIxMjcuMC4wLjFcIlxuICAgICAgQGRlYnVnUG9ydCA9IEBhdG9tLmNvbmZpZy5nZXQoJ25vZGUtZGVidWdnZXIuZGVidWdQb3J0JylcbiAgICAgIEBleHRlcm5hbFByb2Nlc3MgPSBmYWxzZVxuICAgICAgTm9kZURlYnVnZ2VyVmlldy5zaG93KHRoaXMpXG4gICAgICBAcHJvY2Vzc01hbmFnZXIuc3RhcnRBY3RpdmVGaWxlKClcbiAgICAgICMgZGVidWdnZXIgd2lsbCBhdHRhY2ggd2hlbiBwcm9jZXNzIGlzIHN0YXJ0ZWRcblxuICBhdHRhY2g6ID0+XG4gICAgQGRlYnVnSG9zdCA9IEBhdG9tLmNvbmZpZy5nZXQoJ25vZGUtZGVidWdnZXIuZGVidWdIb3N0JylcbiAgICBAZGVidWdQb3J0ID0gQGF0b20uY29uZmlnLmdldCgnbm9kZS1kZWJ1Z2dlci5kZWJ1Z1BvcnQnKVxuICAgIEBleHRlcm5hbFByb2Nlc3MgPSB0cnVlXG4gICAgTm9kZURlYnVnZ2VyVmlldy5zaG93KHRoaXMpXG4gICAgQGF0dGFjaEludGVybmFsKClcblxuICBhdHRhY2hJbnRlcm5hbDogPT5cbiAgICBsb2dnZXIuaW5mbyAnZGVidWdnZXInLCAnc3RhcnQgY29ubmVjdCB0byBwcm9jZXNzJ1xuICAgIHNlbGYgPSB0aGlzXG4gICAgYXR0ZW1wdENvbm5lY3RDb3VudCA9IDBcbiAgICBhdHRlbXB0Q29ubmVjdCA9IC0+XG4gICAgICBsb2dnZXIuaW5mbyAnZGVidWdnZXInLCAnYXR0ZW1wdCB0byBjb25uZWN0IHRvIGNoaWxkIHByb2Nlc3MnXG4gICAgICBpZiBub3Qgc2VsZi5jbGllbnQ/XG4gICAgICAgIGxvZ2dlci5pbmZvICdkZWJ1Z2dlcicsICdjbGllbnQgaGFzIGJlZW4gY2xlYW51cCdcbiAgICAgICAgcmV0dXJuXG4gICAgICBhdHRlbXB0Q29ubmVjdENvdW50KytcbiAgICAgIHNlbGYuY2xpZW50LmNvbm5lY3QoXG4gICAgICAgIHNlbGYuZGVidWdQb3J0LFxuICAgICAgICBzZWxmLmRlYnVnSG9zdFxuICAgICAgKVxuXG4gICAgb25Db25uZWN0aW9uRXJyb3IgPSA9PlxuICAgICAgbG9nZ2VyLmluZm8gJ2RlYnVnZ2VyJywgXCJ0cnlpbmcgdG8gcmVjb25uZWN0ICN7YXR0ZW1wdENvbm5lY3RDb3VudH1cIlxuICAgICAgdGltZW91dCA9IDUwMFxuICAgICAgQGVtaXQgJ3JlY29ubmVjdCcsIHtcbiAgICAgICAgY291bnQ6IGF0dGVtcHRDb25uZWN0Q291bnRcbiAgICAgICAgcG9ydDogc2VsZi5kZWJ1Z1BvcnRcbiAgICAgICAgaG9zdDogc2VsZi5kZWJ1Z0hvc3RcbiAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgfVxuICAgICAgQHRpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgIGF0dGVtcHRDb25uZWN0KClcbiAgICAgICwgdGltZW91dFxuXG4gICAgQGNsaWVudCA9IG5ldyBDbGllbnQoKVxuICAgIEBjbGllbnQub25jZSAncmVhZHknLCBAYmluZEV2ZW50c1xuXG4gICAgQGNsaWVudC5vbiAndW5oYW5kbGVkUmVzcG9uc2UnLCAocmVzKSA9PiBAZW1pdCAndW5oYW5kbGVkUmVzcG9uc2UnLCByZXNcbiAgICBAY2xpZW50Lm9uICdicmVhaycsIChyZXMpID0+XG4gICAgICBAb25CcmVha0V2ZW50LmJyb2FkY2FzdChyZXMuYm9keSk7IEBlbWl0ICdicmVhaycsIHJlcy5ib2R5XG4gICAgICBAc2V0U2VsZWN0ZWRGcmFtZShudWxsKVxuXG4gICAgQGNsaWVudC5vbiAnZXhjZXB0aW9uJywgKHJlcykgPT4gQGVtaXQgJ2V4Y2VwdGlvbicsIHJlcy5ib2R5XG4gICAgQGNsaWVudC5vbiAnZXJyb3InLCBvbkNvbm5lY3Rpb25FcnJvclxuICAgIEBjbGllbnQub24gJ2Nsb3NlJywgKCkgLT4gbG9nZ2VyLmluZm8gJ2NsaWVudCcsICdjbGllbnQgY2xvc2VkJ1xuXG4gICAgYXR0ZW1wdENvbm5lY3QoKVxuXG4gIGJpbmRFdmVudHM6ID0+XG4gICAgbG9nZ2VyLmluZm8gJ2RlYnVnZ2VyJywgJ2Nvbm5lY3RlZCdcbiAgICBAZW1pdCAnY29ubmVjdGVkJ1xuICAgIEBjbGllbnQub24gJ2Nsb3NlJywgPT5cbiAgICAgIGxvZ2dlci5pbmZvICdkZWJ1Z2dlcicsICdjb25uZWN0aW9uIGNsb3NlZCdcblxuICAgICAgQHByb2Nlc3NNYW5hZ2VyLmNsZWFudXAoKVxuICAgICAgICAudGhlbiA9PlxuICAgICAgICAgIEBlbWl0ICdjbG9zZSdcblxuICBsb29rdXA6IChyZWYpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIEBjbGllbnQucmVxTG9va3VwIFtyZWZdLCAoZXJyLCByZXMpIC0+XG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgcmVzb2x2ZShyZXNbcmVmXSlcblxuICBldmFsOiAodGV4dCkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGNsaWVudC5yZXFGcmFtZUV2YWwgdGV4dCwgQHNlbGVjdGVkRnJhbWU/LmluZGV4IG9yIDAsIChlcnIsIHJlc3VsdCkgLT5cbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICByZXR1cm4gcmVzb2x2ZShyZXN1bHQpXG5cbiAgY2xlYW51cDogPT5cbiAgICBAcHJvY2Vzc01hbmFnZXIuY2xlYW51cCgpXG4gICAgTm9kZURlYnVnZ2VyVmlldy5kZXN0cm95KClcbiAgICBAY2xlYW51cEludGVybmFsKClcblxuICBjbGVhbnVwSW50ZXJuYWw6ID0+XG4gICAgQGNsaWVudC5kZXN0cm95KCkgaWYgQGNsaWVudFxuICAgIEBjbGllbnQgPSBudWxsXG4gICAganVtcFRvQnJlYWtwb2ludC5jbGVhbnVwKClcbiAgICBAZW1pdCAnZGlzY29ubmVjdGVkJ1xuXG4gIGlzQ29ubmVjdGVkOiA9PlxuICAgICAgcmV0dXJuIEBjbGllbnQ/XG5cbiAgdG9nZ2xlOiA9PlxuICAgIE5vZGVEZWJ1Z2dlclZpZXcudG9nZ2xlKHRoaXMpXG5cbmV4cG9ydHMuRGVidWdnZXIgPSBEZWJ1Z2dlclxuZXhwb3J0cy5Qcm9jZXNzTWFuYWdlciA9IFByb2Nlc3NNYW5hZ2VyXG4iXX0=
