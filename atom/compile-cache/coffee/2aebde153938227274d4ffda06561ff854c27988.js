(function() {
  var CommandHistory, Event, TextEditorView, h, hg, merge, ref, split, stream;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  Event = require('geval/event');

  ref = require('event-stream'), merge = ref.merge, split = ref.split;

  stream = require('stream');

  hg = require('mercury');

  h = hg.h;

  CommandHistory = require('./consolepane-utils').CommandHistory;

  exports.create = function(_debugger) {
    var ConsoleInput, ConsolePane, input, jsGrammar, tokenizeLine;
    jsGrammar = atom.grammars.grammarForScopeName('source.js');
    tokenizeLine = function(text) {
      var tokens;
      if (!jsGrammar) {
        return h('div.line', {}, text);
      }
      tokens = jsGrammar.tokenizeLine(text).tokens;
      return h('div.line', {}, [
        h('span.test.shell-session', {}, tokens.map(function(token) {
          return h('span', {
            className: token.scopes.join(' ').split('.').join(' ')
          }, [token.value]);
        }))
      ]);
    };
    ConsoleInput = (function() {
      function ConsoleInput(_debugger1) {
        this["debugger"] = _debugger1;
        this.type = "Widget";
        this._changer = Event();
        this.onEvalOrResult = this._changer.listen;
      }

      ConsoleInput.prototype.init = function() {
        var self;
        self = this;
        this.editorView = new TextEditorView({
          mini: true
        });
        this.editor = this.editorView.getModel();
        this.historyTracker = new CommandHistory(this.editor);
        this.editorView.on('keyup', function(ev) {
          var keyCode, text;
          keyCode = ev.keyCode;
          switch (keyCode) {
            case 13:
              text = self.editor.getText();
              self._changer.broadcast(text);
              self.editor.setText('');
              self.historyTracker.saveIfNew(text);
              return self["debugger"]["eval"](text).then(function(result) {
                return self._changer.broadcast(result.text);
              })["catch"](function(e) {
                if (e.message != null) {
                  return self._changer.broadcast(e.message);
                } else {
                  return self._changer.broadcast(e);
                }
              });
            case 38:
              return self.historyTracker.moveUp();
            case 40:
              return self.historyTracker.moveDown();
          }
        });
        return this.editorView.get(0);
      };

      ConsoleInput.prototype.update = function(prev, el) {
        return el;
      };

      return ConsoleInput;

    })();
    input = new ConsoleInput(_debugger);
    ConsolePane = (function(_this) {
      return function() {
        var newWriter, self, state;
        state = hg.state({
          lines: hg.array([]),
          channels: {
            clear: function(state) {
              return state.lines.set([]);
            }
          }
        });
        input.onEvalOrResult(function(text) {
          return state.lines.push(text);
        });
        newWriter = function() {
          return new stream.Writable({
            write: function(chunk, encoding, next) {
              state.lines.push(chunk.toString());
              return next();
            }
          });
        };
        self = _this;
        self.unsubscribeProcessCreated = _debugger.processManager.subscribe('processCreated', function() {
          var ref1, stderr, stdout;
          ref1 = _debugger.processManager.process, stdout = ref1.stdout, stderr = ref1.stderr;
          self.unsubscribeLogData = stdout.subscribe('data', function(d) {
            return console.log(d.toString());
          });
          self.unsubscribeLogError = stderr.subscribe('data', function(d) {
            return console.log(d.toString());
          });
          stdout.pipe(split()).pipe(newWriter());
          return stderr.pipe(split()).pipe(newWriter());
        });
        self.unsubscribeReconnect = _debugger.subscribe('reconnect', function(arg) {
          var count, host, message, port, timeout;
          count = arg.count, host = arg.host, port = arg.port, timeout = arg.timeout;
          message = "Connection attempt " + count + " to node process on " + host + ":" + port + " failed. Will try again in " + timeout + ".";
          return state.lines.push(message);
        });
        return state;
      };
    })(this);
    ConsolePane.render = function(state) {
      return h('div.inset-panel', {
        style: {
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column'
        }
      }, [
        h('div.debugger-panel-heading', {
          style: {
            display: 'flex',
            flexDirection: 'row',
            'align-items': 'center',
            'justify-content': 'center',
            flex: '0 0 auto'
          }
        }, [
          h('div', {}, 'stdout/stderr'), h('div', {
            style: {
              'margin-left': 'auto'
            },
            className: 'icon-trashcan btn btn-primary',
            'ev-click': hg.send(state.channels.clear),
            'title': 'clear console'
          })
        ]), h('div.panel-body.padded.native-key-bindings', {
          attributes: {
            tabindex: '-1'
          },
          style: {
            flex: '1',
            overflow: 'auto',
            "font-family": "Menlo, Consolas, 'DejaVu Sans Mono', monospace"
          }
        }, state.lines.map(tokenizeLine)), h('div.debugger-editor', {
          style: {
            height: '33px',
            flexBasis: '33px'
          }
        }, [input])
      ]);
    };
    ConsolePane.cleanup = (function(_this) {
      return function() {
        if (_this.unsubscribeProcessCreated) {
          _this.unsubscribeProcessCreated();
        }
        if (_this.unsubscribeLogData) {
          _this.unsubscribeLogData();
        }
        if (_this.unsubscribeLogError) {
          _this.unsubscribeLogError();
        }
        if (_this.unsubscribeReconnect) {
          _this.unsubscribeReconnect();
        }
        _this.unsubscribeProcessCreated = null;
        _this.unsubscribeLogData = null;
        _this.unsubscribeLogError = null;
        return _this.unsubscribeReconnect = null;
      };
    })(this);
    return ConsolePane;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvQ29uc29sZVBhbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixLQUFBLEdBQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1IsTUFBaUIsT0FBQSxDQUFRLGNBQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0osSUFBSzs7RUFDTCxpQkFBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUVuQixPQUFPLENBQUMsTUFBUixHQUFpQixTQUFDLFNBQUQ7QUFDZixRQUFBO0lBQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsV0FBbEM7SUFFWixZQUFBLEdBQWUsU0FBQyxJQUFEO0FBQ2IsVUFBQTtNQUFBLElBQUEsQ0FBc0MsU0FBdEM7QUFBQSxlQUFPLENBQUEsQ0FBRSxVQUFGLEVBQWMsRUFBZCxFQUFrQixJQUFsQixFQUFQOztNQUNDLFNBQVUsU0FBUyxDQUFDLFlBQVYsQ0FBdUIsSUFBdkI7YUFDWCxDQUFBLENBQUUsVUFBRixFQUFjLEVBQWQsRUFBa0I7UUFDaEIsQ0FBQSxDQUFFLHlCQUFGLEVBQTZCLEVBQTdCLEVBQWlDLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxLQUFEO2lCQUMxQyxDQUFBLENBQUUsTUFBRixFQUFVO1lBQ1IsU0FBQSxFQUFXLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBYixDQUFrQixHQUFsQixDQUFzQixDQUFDLEtBQXZCLENBQTZCLEdBQTdCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkMsQ0FESDtXQUFWLEVBRUcsQ0FBQyxLQUFLLENBQUMs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QUF6QixFQUdHLENBQ0QsS0FEQyxDQUhILENBN0JDO09BTkg7SUFEbUI7SUE0Q3JCLFdBQVcsQ0FBQyxPQUFaLEdBQXNCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUNwQixJQUFnQyxLQUFDLENBQUEseUJBQWpDO1VBQUEsS0FBQyxDQUFBLHlCQUFELENBQUEsRUFBQTs7UUFDQSxJQUF5QixLQUFDLENBQUEsa0JBQTFCO1VBQUEsS0FBQyxDQUFBLGtCQUFELENBQUEsRUFBQTs7UUFDQSxJQUEwQixLQUFDLENBQUEsbUJBQTNCO1VBQUEsS0FBQyxDQUFBLG1CQUFELENBQUEsRUFBQTs7UUFDQSxJQUEyQixLQUFDLENBQUEsb0JBQTVCO1VBQUEsS0FBQyxDQUFBLG9CQUFELENBQUEsRUFBQTs7UUFDQSxLQUFDLENBQUEseUJBQUQsR0FBNkI7UUFDN0IsS0FBQyxDQUFBLGtCQUFELEdBQXNCO1FBQ3RCLEtBQUMsQ0FBQSxtQkFBRCxHQUF1QjtlQUN2QixLQUFDLENBQUEsb0JBQUQsR0FBd0I7TUFSSjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7QUFVdEIsV0FBTztFQXJKUTtBQVJqQiIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbkV2ZW50ID0gcmVxdWlyZSAnZ2V2YWwvZXZlbnQnXG57bWVyZ2UsIHNwbGl0fSA9IHJlcXVpcmUgJ2V2ZW50LXN0cmVhbSdcbnN0cmVhbSA9IHJlcXVpcmUgJ3N0cmVhbSdcbmhnID0gcmVxdWlyZSAnbWVyY3VyeSdcbntofSA9IGhnXG57Q29tbWFuZEhpc3Rvcnl9ID0gcmVxdWlyZSAnLi9jb25zb2xlcGFuZS11dGlscydcblxuZXhwb3J0cy5jcmVhdGUgPSAoX2RlYnVnZ2VyKSAtPlxuICBqc0dyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5qcycpXG5cbiAgdG9rZW5pemVMaW5lID0gKHRleHQpIC0+XG4gICAgcmV0dXJuIGgoJ2Rpdi5saW5lJywge30sIHRleHQpIHVubGVzcyBqc0dyYW1tYXJcbiAgICB7dG9rZW5zfSA9IGpzR3JhbW1hci50b2tlbml6ZUxpbmUodGV4dClcbiAgICBoKCdkaXYubGluZScsIHt9LCBbXG4gICAgICBoKCdzcGFuLnRlc3Quc2hlbGwtc2Vzc2lvbicsIHt9LCB0b2tlbnMubWFwKCh0b2tlbikgLT5cbiAgICAgICAgaCgnc3BhbicsIHtcbiAgICAgICAgICBjbGFzc05hbWU6IHRva2VuLnNjb3Blcy5qb2luKCcgJykuc3BsaXQoJy4nKS5qb2luKCcgJylcbiAgICAgICAgfSwgW3Rva2VuLnZhbHVlXSlcbiAgICAgICkpXG4gICAgXSlcblxuICBjbGFzcyBDb25zb2xlSW5wdXRcbiAgICBjb25zdHJ1Y3RvcjogKEBkZWJ1Z2dlciktPlxuICAgICAgQHR5cGUgPSBcIldpZGdldFwiXG4gICAgICBAX2NoYW5nZXIgPSBFdmVudCgpXG4gICAgICBAb25FdmFsT3JSZXN1bHQgPSBAX2NoYW5nZXIubGlzdGVuXG5cbiAgICBpbml0OiAtPlxuICAgICAgc2VsZiA9IHRoaXNcbiAgICAgIEBlZGl0b3JWaWV3ID0gbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICBAZWRpdG9yID0gQGVkaXRvclZpZXcuZ2V0TW9kZWwoKVxuICAgICAgQGhpc3RvcnlUcmFja2VyID0gbmV3IENvbW1hbmRIaXN0b3J5KEBlZGl0b3IpXG5cbiAgICAgIEBlZGl0b3JWaWV3Lm9uICdrZXl1cCcsIChldikgLT5cbiAgICAgICAge2tleUNvZGV9ID0gZXZcbiAgICAgICAgc3dpdGNoIGtleUNvZGVcbiAgICAgICAgICB3aGVuIDEzXG4gICAgICAgICAgICB0ZXh0ID0gc2VsZi5lZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgICAgICBzZWxmLl9jaGFuZ2VyLmJyb2FkY2FzdCh0ZXh0KVxuICAgICAgICAgICAgc2VsZi5lZGl0b3Iuc2V0VGV4dCgnJylcbiAgICAgICAgICAgIHNlbGYuaGlzdG9yeVRyYWNrZXIuc2F2ZUlmTmV3KHRleHQpXG4gICAgICAgICAgICBzZWxmXG4gICAgICAgICAgICAgIC5kZWJ1Z2dlclxuICAgICAgICAgICAgICAuZXZhbCh0ZXh0KVxuICAgICAgICAgICAgICAudGhlbiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgIHNlbGYuX2NoYW5nZXIuYnJvYWRjYXN0KHJlc3VsdC50ZXh0KVxuICAgICAgICAgICAgICAuY2F0Y2ggKGUpIC0+XG4gICAgICAgICAgICAgICAgaWYgZS5tZXNzYWdlP1xuICAgICAgICAgICAgICAgICAgc2VsZi5fY2hhbmdlci5icm9hZGNhc3QoZS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2NoYW5nZXIuYnJvYWRjYXN0KGUpXG4gICAgICAgICAgd2hlbiAzOFxuICAgICAgICAgICAgc2VsZi5oaXN0b3J5VHJhY2tlci5tb3ZlVXAoKVxuICAgICAgICAgIHdoZW4gNDBcbiAgICAgICAgICAgIHNlbGYuaGlzdG9yeVRyYWNrZXIubW92ZURvd24oKVxuXG4gICAgICByZXR1cm4gQGVkaXRvclZpZXcuZ2V0KDApXG5cbiAgICB1cGRhdGU6IChwcmV2LCBlbCkgLT5cbiAgICAgIHJldHVybiBlbFxuXG4gIGlucHV0ID0gbmV3IENvbnNvbGVJbnB1dChfZGVidWdnZXIpXG5cbiAgQ29uc29sZVBhbmUgPSAoKSA9PlxuICAgIHN0YXRlID0gaGcuc3RhdGUoe1xuICAgICAgbGluZXM6IGhnLmFycmF5KFtdKVxuICAgICAgY2hhbm5lbHM6IHtcbiAgICAgICAgY2xlYXI6IChzdGF0ZSkgLT4gc3RhdGUubGluZXMuc2V0KFtdKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpbnB1dC5vbkV2YWxPclJlc3VsdCAodGV4dCkgLT5cbiAgICAgIHN0YXRlLmxpbmVzLnB1c2godGV4dClcblxuICAgIG5ld1dyaXRlciA9ICgpIC0+XG4gICAgICBuZXcgc3RyZWFtLldyaXRhYmxlKHtcbiAgICAgICAgd3JpdGU6IChjaHVuaywgZW5jb2RpbmcsIG5leHQpIC0+XG4gICAgICAgICAgc3RhdGUubGluZXMucHVzaChjaHVuay50b1N0cmluZygpKVxuICAgICAgICAgIG5leHQoKVxuICAgICAgfSlcblxuICAgIHNlbGYgPSB0aGlzXG4gICAgc2VsZi51bnN1YnNjcmliZVByb2Nlc3NDcmVhdGVkID0gX2RlYnVnZ2VyLnByb2Nlc3NNYW5hZ2VyLnN1YnNjcmliZSAncHJvY2Vzc0NyZWF0ZWQnLCAtPlxuICAgICAge3N0ZG91dCwgc3RkZXJyfSA9IF9kZWJ1Z2dlci5wcm9jZXNzTWFuYWdlci5wcm9jZXNzXG5cbiAgICAgIHNlbGYudW5zdWJzY3JpYmVMb2dEYXRhID0gc3Rkb3V0LnN1YnNjcmliZSAnZGF0YScsIChkKSAtPiBjb25zb2xlLmxvZyhkLnRvU3RyaW5nKCkpXG4gICAgICBzZWxmLnVuc3Vic2NyaWJlTG9nRXJyb3IgPSBzdGRlcnIuc3Vic2NyaWJlICdkYXRhJywgKGQpIC0+IGNvbnNvbGUubG9nKGQudG9TdHJpbmcoKSlcblxuICAgICAgc3Rkb3V0XG4gICAgICAgIC5waXBlKHNwbGl0KCkpXG4gICAgICAgIC5waXBlKG5ld1dyaXRlcigpKVxuXG4gICAgICBzdGRlcnJcbiAgICAgICAgLnBpcGUoc3BsaXQoKSlcbiAgICAgICAgLnBpcGUobmV3V3JpdGVyKCkpXG5cbiAgICBzZWxmLnVuc3Vic2NyaWJlUmVjb25uZWN0ID0gX2RlYnVnZ2VyLnN1YnNjcmliZSAncmVjb25uZWN0JywgKHtjb3VudCxob3N0LHBvcnQsdGltZW91dH0pIC0+XG4gICAgICBtZXNzYWdlID0gXCJDb25uZWN0aW9uIGF0dGVtcHQgI3tjb3VudH0gdG8gbm9kZSBwcm9jZXNzIG9uICN7aG9zdH06I3twb3J0fSBmYWlsZWQuIFdpbGwgdHJ5IGFnYWluIGluICN7dGltZW91dH0uXCJcbiAgICAgIHN0YXRlLmxpbmVzLnB1c2gobWVzc2FnZSlcblxuICAgIHJldHVybiBzdGF0ZVxuXG4gIENvbnNvbGVQYW5lLnJlbmRlciA9IChzdGF0ZSkgLT5cbiAgICBoKCdkaXYuaW5zZXQtcGFuZWwnLCB7XG4gICAgICBzdHlsZToge1xuICAgICAgICBmbGV4OiAnMSAxIDAnXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4J1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJ1xuICAgICAgfVxuICAgIH0sIFtcbiAgICAgIGgoJ2Rpdi5kZWJ1Z2dlci1wYW5lbC1oZWFkaW5nJywge1xuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICBkaXNwbGF5OiAnZmxleCdcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnXG4gICAgICAgICAgICAnYWxpZ24taXRlbXMnOiAnY2VudGVyJ1xuICAgICAgICAgICAgJ2p1c3RpZnktY29udGVudCc6ICdjZW50ZXInXG4gICAgICAgICAgICBmbGV4OiAnMCAwIGF1dG8nXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFtcbiAgICAgICAgICBoKCdkaXYnLCB7fSwgJ3N0ZG91dC9zdGRlcnInKVxuICAgICAgICAgIGgoJ2RpdicsIHtcbiAgICAgICAgICAgIHN0eWxlOiB7ICdtYXJnaW4tbGVmdCc6ICdhdXRvJyB9LFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnaWNvbi10cmFzaGNhbiBidG4gYnRuLXByaW1hcnknXG4gICAgICAgICAgICAnZXYtY2xpY2snOiBoZy5zZW5kIHN0YXRlLmNoYW5uZWxzLmNsZWFyXG4gICAgICAgICAgICAndGl0bGUnOiAnY2xlYXIgY29uc29sZSdcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgaCgnZGl2LnBhbmVsLWJvZHkucGFkZGVkLm5hdGl2ZS1rZXktYmluZGluZ3MnLCB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICB0YWJpbmRleDogJy0xJ1xuICAgICAgICB9XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgZmxleDogJzEnXG4gICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJ1xuICAgICAgICAgIFwiZm9udC1mYW1pbHlcIjogXCJNZW5sbywgQ29uc29sYXMsICdEZWphVnUgU2FucyBNb25vJywgbW9ub3NwYWNlXCJcbiAgICAgICAgfVxuICAgICAgfSwgc3RhdGUubGluZXMubWFwKHRva2VuaXplTGluZSkpXG4gICAgICBoKCdkaXYuZGVidWdnZXItZWRpdG9yJywgc3R5bGU6IHtcbiAgICAgICAgaGVpZ2h0OiAnMzNweCdcbiAgICAgICAgZmxleEJhc2lzOiAnMzNweCdcbiAgICAgIH0sIFtcbiAgICAgICAgaW5wdXRcbiAgICAgIF0pXG4gICAgXSlcblxuICBDb25zb2xlUGFuZS5jbGVhbnVwID0gKCkgPT5cbiAgICBAdW5zdWJzY3JpYmVQcm9jZXNzQ3JlYXRlZCgpIGlmIEB1bnN1YnNjcmliZVByb2Nlc3NDcmVhdGVkXG4gICAgQHVuc3Vic2NyaWJlTG9nRGF0YSgpIGlmIEB1bnN1YnNjcmliZUxvZ0RhdGFcbiAgICBAdW5zdWJzY3JpYmVMb2dFcnJvcigpIGlmIEB1bnN1YnNjcmliZUxvZ0Vycm9yXG4gICAgQHVuc3Vic2NyaWJlUmVjb25uZWN0KCkgaWYgQHVuc3Vic2NyaWJlUmVjb25uZWN0XG4gICAgQHVuc3Vic2NyaWJlUHJvY2Vzc0NyZWF0ZWQgPSBudWxsXG4gICAgQHVuc3Vic2NyaWJlTG9nRGF0YSA9IG51bGxcbiAgICBAdW5zdWJzY3JpYmVMb2dFcnJvciA9IG51bGxcbiAgICBAdW5zdWJzY3JpYmVSZWNvbm5lY3QgPSBudWxsXG5cbiAgcmV0dXJuIENvbnNvbGVQYW5lXG4iXX0=
