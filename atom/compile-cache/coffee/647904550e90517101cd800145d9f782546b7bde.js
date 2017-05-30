(function() {
  var MochaWrapper, STATS_MATCHER, ansi, clickablePaths, escape, events, fs, kill, killTree, path, psTree, spawn, util,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs');

  path = require('path');

  util = require('util');

  events = require('events');

  escape = require('jsesc');

  ansi = require('ansi-html-stream');

  psTree = require('process-tree');

  spawn = require('child_process').spawn;

  kill = require('tree-kill');

  clickablePaths = require('./clickable-paths');

  STATS_MATCHER = /\d+\s+(?:failing|passing|pending)/g;

  module.exports = MochaWrapper = (function(superClass) {
    extend(MochaWrapper, superClass);

    function MochaWrapper(context, debugMode) {
      var optionsForDebug;
      this.context = context;
      if (debugMode == null) {
        debugMode = false;
      }
      this.mocha = null;
      this.node = atom.config.get('mocha-test-runner.nodeBinaryPath');
      this.textOnly = atom.config.get('mocha-test-runner.textOnlyOutput');
      this.options = atom.config.get('mocha-test-runner.options');
      this.env = atom.config.get('mocha-test-runner.env');
      if (debugMode) {
        optionsForDebug = atom.config.get('mocha-test-runner.optionsForDebug');
        this.options = this.options + " " + optionsForDebug;
      }
      this.resetStatistics();
    }

    MochaWrapper.prototype.stop = function() {
      if (this.mocha != null) {
        killTree(this.mocha.pid);
        return this.mocha = null;
      }
    };

    MochaWrapper.prototype.run = function() {
      var env, flags, index, key, name, opts, ref, ref1, stream, value;
      flags = [this.context.test];
      env = {
        PATH: path.dirname(this.node)
      };
      if (this.env) {
        ref = this.env.split(' ');
        for (index in ref) {
          name = ref[index];
          ref1 = name.split('='), key = ref1[0], value = ref1[1];
          env[key] = value;
        }
      }
      if (this.textOnly) {
        flags.push('--no-colors');
      } else {
        flags.push('--colors');
      }
      if (this.context.grep) {
        flags.push('--grep');
        flags.push(escape(this.context.grep, {
          escapeEverything: true
        }));
      }
      if (this.options) {
        Array.prototype.push.apply(flags, this.options.split(' '));
      }
      opts = {
        cwd: this.context.root,
        env: env
      };
      this.resetStatistics();
      this.mocha = spawn(this.context.mocha, flags, opts);
      if (this.textOnly) {
        this.mocha.stdout.on('data', (function(_this) {
          return function(data) {
            _this.parseStatistics(data);
            return _this.emit('output', data.toString());
          };
        })(this));
        this.mocha.stderr.on('data', (function(_this) {
          return function(data) {
            _this.parseStatistics(data);
            return _this.emit('output', data.toString());
          };
        })(this));
      } else {
        stream = ansi({
          chunked: false
        });
        this.mocha.stdout.pipe(stream);
        this.mocha.stderr.pipe(stream);
        stream.on('data', (function(_this) {
          return function(data) {
            _this.parseStatistics(data);
            return _this.emit('output', clickablePaths.link(data.toString()));
          };
        })(this));
      }
      this.mocha.on('error', (function(_this) {
        return function(err) {
          return _this.emit('error', err);
        };
      })(this));
      return this.mocha.on('exit', (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this.emit('success', _this.stats);
          } else {
            return _this.emit('failure', _this.stats);
          }
        };
      })(this));
    };

    MochaWrapper.prototype.resetStatistics = function() {
      return this.stats = [];
    };

    MochaWrapper.prototype.parseStatistics = function(data) {
      var matches, results, stat;
      results = [];
      while (matches = STATS_MATCHER.exec(data)) {
        stat = matches[0];
        this.stats.push(stat);
        results.push(this.emit('updateSummary', this.stats));
      }
      return results;
    };

    return MochaWrapper;

  })(events.EventEmitter);

  killTree = function(pid, signal, callback) {
    signal = signal || 'SIGKILL';
    callback = callback || (function() {});
    return psTree(pid, function(err, children) {
      var childrenPid;
      childrenPid = children.map(function(p) {
        return p.PID;
      });
      [pid].concat(childrenPid).forEach(function(tpid) {
        var ex;
        try {
          return kill(tpid, signal);
        } catch (error) {
          ex = error;
          return console.log("Failed to " + signal + " " + tpid);
        }
      });
      return callback();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL2xpYi9tb2NoYS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdIQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7RUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLE9BQVI7O0VBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGNBQVI7O0VBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ2xDLElBQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7RUFFVCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUjs7RUFFakIsYUFBQSxHQUFnQjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7OztJQUVSLHNCQUFDLE9BQUQsRUFBVyxTQUFYO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxVQUFEOztRQUFVLFlBQVk7O01BQ2xDLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEI7TUFDUixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEI7TUFDWixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEI7TUFDWCxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEI7TUFFUCxJQUFHLFNBQUg7UUFDRSxlQUFBLEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQ0FBaEI7UUFDbEIsSUFBQyxDQUFBLE9BQUQsR0FBYyxJQUFDLENBQUEsT0FBRixHQUFVLEdBQVYsR0FBYSxnQkFGNUI7O01BSUEsSUFBQyxDQUFBLGVBQUQsQ0FBQTtJQVhXOzsyQkFhYixJQUFBLEdBQU0sU0FBQTtNQUNKLElBQUcsa0JBQUg7UUFDRSxRQUFBLENBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFoQjtlQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FGWDs7SUFESTs7MkJBS04sR0FBQSxHQUFLLFNBQUE7QUFFSCxVQUFBO01BQUEsS0FBQSxHQUFRLENBQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQURIO01BSVIsR0FBQSxHQUNFO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLElBQWQsQ0FBTjs7TUFFRixJQUFHLElBQUMsQ0FBQSxHQUFKO0FBQ0U7QUFBQSxhQUFBLFlBQUE7O1VBQ0UsT0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVgsQ0FBZixFQUFDLGFBQUQsRUFBTTtVQUNOLEdBQUksQ0FBQSxHQUFBLENBQUosR0FBVztBQUZiLFNBREY7O01BS0EsSUFBRyxJQUFDLENBQUEsUUFBSjtRQUNFLEtBQUssQ0FBQyxJQUFOLENBQVcsYUFBWCxFQURGO09BQUEsTUFBQTtRQUdFLEtBQUssQ0FBQyxJQUFOLENBQVcsVUFBWCxFQUhGOztNQUtBLElBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFaO1FBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYO1FBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFBLENBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFoQixFQUFzQjtVQUFBLGdCQUFBLEVBQWtCLElBQWxCO1NBQXRCLENBQVgsRUFGRjs7TUFJQSxJQUFHLElBQUMsQ0FBQSxPQUFKO1FBQ0UsS0FBSyxDQUFBLFNBQUUsQ0FBQSxJQUFJLENBQUMsS0FBWixDQUFrQixLQUFsQixFQUF5QixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBZSxHQUFmLENBQXpCLEVBREY7O01BR0EsSUFBQSxHQUNFO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBZDtRQUNBLEdBQUEsRUFBSyxHQURMOztNQUdGLElBQUMsQ0FBQSxlQUFELENBQUE7TUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLEtBQUEsQ0FBTSxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQWYsRUFBc0IsS0FBdEIsRUFBNkIsSUFBN0I7TUFFVCxJQUFHLElBQUMsQ0FBQSxRQUFKO1FBQ0UsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBZCxDQUFpQixNQUFqQixFQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLElBQUQ7WUFDdkIsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakI7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWdCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBaEI7VUFGdUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO1FBR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBZCxDQUFpQixNQUFqQixFQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLElBQUQ7WUFDdkIsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakI7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWdCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBaEI7VUFGdUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLEVBSkY7T0FBQSxNQUFBO1FBUUUsTUFBQSxHQUFTLElBQUEsQ0FBSztVQUFBLE9BQUEsRUFBUyxLQUFUO1NBQUw7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFkLENBQW1CLE1BQW5CO1FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBZCxDQUFtQixNQUFuQjtRQUNBLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLElBQUQ7WUFDaEIsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakI7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBQWdCLGNBQWMsQ0FBQyxJQUFmLENBQW9CLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBcEIsQ0FBaEI7VUFGZ0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLEVBWEY7O01BZUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtpQkFDakIsS0FBQyxDQUFBLElBQUQsQ0FBTSxPQUFOLEVBQWUsR0FBZjtRQURpQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7YUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ2hCLElBQUcsSUFBQSxLQUFRLENBQVg7bUJBQ0UsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBQWlCLEtBQUMsQ0FBQSxLQUFsQixFQURGO1dBQUEsTUFBQTttQkFHRSxLQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFBaUIsS0FBQyxDQUFBLEtBQWxCLEVBSEY7O1FBRGdCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQjtJQW5ERzs7MkJBeURMLGVBQUEsR0FBaUIsU0FBQTthQUNmLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFETTs7MkJBR2pCLGVBQUEsR0FBaUIsU0FBQyxJQUFEO0FBQ2YsVUFBQTtBQUFBO2FBQU0sT0FBQSxHQUFVLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CLENBQWhCO1FBQ0UsSUFBQSxHQUFPLE9BQVEsQ0FBQSxDQUFBO1FBQ2YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWjtxQkFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGVBQU4sRUFBdUIsSUFBQyxDQUFBLEtBQXhCO01BSEYsQ0FBQTs7SUFEZTs7OztLQWhGeUIsTUFBTSxDQUFDOztFQXVGbkQsUUFBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLE1BQU4sRUFBYyxRQUFkO0lBQ1QsTUFBQSxHQUFTLE1BQUEsSUFBVTtJQUNuQixRQUFBLEdBQVcsUUFBQSxJQUFZLENBQUMsU0FBQSxHQUFBLENBQUQ7V0FDdkIsTUFBQSxDQUFPLEdBQVAsRUFBWSxTQUFDLEdBQUQsRUFBTSxRQUFOO0FBQ1YsVUFBQTtNQUFBLFdBQUEsR0FBYyxRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQztNQUFULENBQWI7TUFDZCxDQUFDLEdBQUQsQ0FBSyxDQUFDLE1BQU4sQ0FBYSxXQUFiLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsU0FBQyxJQUFEO0FBQ2hDLFlBQUE7QUFBQTtpQkFDRSxJQUFBLENBQUssSUFBTCxFQUFXLE1BQVgsRUFERjtTQUFBLGFBQUE7VUFHTTtpQkFDSixPQUFPLENBQUMsR0FBUixDQUFZLFlBQUEsR0FBYSxNQUFiLEdBQW9CLEdBQXBCLEdBQXVCLElBQW5DLEVBSkY7O01BRGdDLENBQWxDO2FBTUEsUUFBQSxDQUFBO0lBUlUsQ0FBWjtFQUhTO0FBckdYIiwic291cmNlc0NvbnRlbnQiOlsiZnMgICAgID0gcmVxdWlyZSAnZnMnXG5wYXRoICAgPSByZXF1aXJlICdwYXRoJ1xudXRpbCAgID0gcmVxdWlyZSAndXRpbCdcbmV2ZW50cyA9IHJlcXVpcmUgJ2V2ZW50cydcbmVzY2FwZSA9IHJlcXVpcmUgJ2pzZXNjJ1xuYW5zaSAgID0gcmVxdWlyZSAnYW5zaS1odG1sLXN0cmVhbSdcbnBzVHJlZSA9IHJlcXVpcmUgJ3Byb2Nlc3MtdHJlZSdcbnNwYXduICA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxua2lsbCAgID0gcmVxdWlyZSAndHJlZS1raWxsJ1xuXG5jbGlja2FibGVQYXRocyA9IHJlcXVpcmUgJy4vY2xpY2thYmxlLXBhdGhzJ1xuXG5TVEFUU19NQVRDSEVSID0gL1xcZCtcXHMrKD86ZmFpbGluZ3xwYXNzaW5nfHBlbmRpbmcpL2dcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2NoYVdyYXBwZXIgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyXG5cbiAgY29uc3RydWN0b3I6IChAY29udGV4dCwgZGVidWdNb2RlID0gZmFsc2UpIC0+XG4gICAgQG1vY2hhID0gbnVsbFxuICAgIEBub2RlID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5ub2RlQmluYXJ5UGF0aCdcbiAgICBAdGV4dE9ubHkgPSBhdG9tLmNvbmZpZy5nZXQgJ21vY2hhLXRlc3QtcnVubmVyLnRleHRPbmx5T3V0cHV0J1xuICAgIEBvcHRpb25zID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5vcHRpb25zJ1xuICAgIEBlbnYgPSBhdG9tLmNvbmZpZy5nZXQgJ21vY2hhLXRlc3QtcnVubmVyLmVudidcblxuICAgIGlmIGRlYnVnTW9kZVxuICAgICAgb3B0aW9uc0ZvckRlYnVnID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5vcHRpb25zRm9yRGVidWcnXG4gICAgICBAb3B0aW9ucyA9IFwiI3tAb3B0aW9uc30gI3tvcHRpb25zRm9yRGVidWd9XCJcblxuICAgIEByZXNldFN0YXRpc3RpY3MoKVxuXG4gIHN0b3A6IC0+XG4gICAgaWYgQG1vY2hhP1xuICAgICAga2lsbFRyZWUoQG1vY2hhLnBpZClcbiAgICAgIEBtb2NoYSA9IG51bGxcblxuICBydW46IC0+XG5cbiAgICBmbGFncyA9IFtcbiAgICAgIEBjb250ZXh0LnRlc3RcbiAgICBdXG5cbiAgICBlbnYgPVxuICAgICAgUEFUSDogcGF0aC5kaXJuYW1lKEBub2RlKVxuXG4gICAgaWYgQGVudlxuICAgICAgZm9yIGluZGV4LCBuYW1lIG9mIEBlbnYuc3BsaXQgJyAnXG4gICAgICAgIFtrZXksIHZhbHVlXSA9IG5hbWUuc3BsaXQoJz0nKVxuICAgICAgICBlbnZba2V5XSA9IHZhbHVlXG5cbiAgICBpZiBAdGV4dE9ubHlcbiAgICAgIGZsYWdzLnB1c2ggJy0tbm8tY29sb3JzJ1xuICAgIGVsc2VcbiAgICAgIGZsYWdzLnB1c2ggJy0tY29sb3JzJ1xuXG4gICAgaWYgQGNvbnRleHQuZ3JlcFxuICAgICAgZmxhZ3MucHVzaCAnLS1ncmVwJ1xuICAgICAgZmxhZ3MucHVzaCBlc2NhcGUoQGNvbnRleHQuZ3JlcCwgZXNjYXBlRXZlcnl0aGluZzogdHJ1ZSlcblxuICAgIGlmIEBvcHRpb25zXG4gICAgICBBcnJheTo6cHVzaC5hcHBseSBmbGFncywgQG9wdGlvbnMuc3BsaXQgJyAnXG5cbiAgICBvcHRzID1cbiAgICAgIGN3ZDogQGNvbnRleHQucm9vdFxuICAgICAgZW52OiBlbnZcblxuICAgIEByZXNldFN0YXRpc3RpY3MoKVxuICAgIEBtb2NoYSA9IHNwYXduIEBjb250ZXh0Lm1vY2hhLCBmbGFncywgb3B0c1xuXG4gICAgaWYgQHRleHRPbmx5XG4gICAgICBAbW9jaGEuc3Rkb3V0Lm9uICdkYXRhJywgKGRhdGEpID0+XG4gICAgICAgIEBwYXJzZVN0YXRpc3RpY3MgZGF0YVxuICAgICAgICBAZW1pdCAnb3V0cHV0JywgZGF0YS50b1N0cmluZygpXG4gICAgICBAbW9jaGEuc3RkZXJyLm9uICdkYXRhJywgKGRhdGEpID0+XG4gICAgICAgIEBwYXJzZVN0YXRpc3RpY3MgZGF0YVxuICAgICAgICBAZW1pdCAnb3V0cHV0JywgZGF0YS50b1N0cmluZygpXG4gICAgZWxzZVxuICAgICAgc3RyZWFtID0gYW5zaShjaHVua2VkOiBmYWxzZSlcbiAgICAgIEBtb2NoYS5zdGRvdXQucGlwZSBzdHJlYW1cbiAgICAgIEBtb2NoYS5zdGRlcnIucGlwZSBzdHJlYW1cbiAgICAgIHN0cmVhbS5vbiAnZGF0YScsIChkYXRhKSA9PlxuICAgICAgICBAcGFyc2VTdGF0aXN0aWNzIGRhdGFcbiAgICAgICAgQGVtaXQgJ291dHB1dCcsIGNsaWNrYWJsZVBhdGhzLmxpbmsgZGF0YS50b1N0cmluZygpXG5cbiAgICBAbW9jaGEub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgIEBlbWl0ICdlcnJvcicsIGVyclxuXG4gICAgQG1vY2hhLm9uICdleGl0JywgKGNvZGUpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgQGVtaXQgJ3N1Y2Nlc3MnLCBAc3RhdHNcbiAgICAgIGVsc2VcbiAgICAgICAgQGVtaXQgJ2ZhaWx1cmUnLCBAc3RhdHNcblxuICByZXNldFN0YXRpc3RpY3M6IC0+XG4gICAgQHN0YXRzID0gW11cblxuICBwYXJzZVN0YXRpc3RpY3M6IChkYXRhKSAtPlxuICAgIHdoaWxlIG1hdGNoZXMgPSBTVEFUU19NQVRDSEVSLmV4ZWMoZGF0YSlcbiAgICAgIHN0YXQgPSBtYXRjaGVzWzBdXG4gICAgICBAc3RhdHMucHVzaChzdGF0KVxuICAgICAgQGVtaXQgJ3VwZGF0ZVN1bW1hcnknLCBAc3RhdHNcblxuXG5raWxsVHJlZSA9IChwaWQsIHNpZ25hbCwgY2FsbGJhY2spIC0+XG4gIHNpZ25hbCA9IHNpZ25hbCBvciAnU0lHS0lMTCdcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayBvciAoLT4pXG4gIHBzVHJlZSBwaWQsIChlcnIsIGNoaWxkcmVuKSAtPlxuICAgIGNoaWxkcmVuUGlkID0gY2hpbGRyZW4ubWFwIChwKSAtPiBwLlBJRFxuICAgIFtwaWRdLmNvbmNhdChjaGlsZHJlblBpZCkuZm9yRWFjaCAodHBpZCkgLT5cbiAgICAgIHRyeVxuICAgICAgICBraWxsIHRwaWQsIHNpZ25hbFxuICAgICAgICAjIHByb2Nlc3Mua2lsbCB0cGlkLCBzaWduYWxcbiAgICAgIGNhdGNoIGV4XG4gICAgICAgIGNvbnNvbGUubG9nIFwiRmFpbGVkIHRvICN7c2lnbmFsfSAje3RwaWR9XCJcbiAgICBjYWxsYmFjaygpXG4iXX0=
