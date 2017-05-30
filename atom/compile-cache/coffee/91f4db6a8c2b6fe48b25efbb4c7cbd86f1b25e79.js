(function() {
  var FocusHook, Promise, TreeView, TreeViewItem, TreeViewUtils, fs, h, hg, listeners, log, openScript, ref1;

  Promise = require('bluebird');

  ref1 = require('./TreeView'), TreeView = ref1.TreeView, TreeViewItem = ref1.TreeViewItem, TreeViewUtils = ref1.TreeViewUtils;

  hg = require('mercury');

  fs = require('fs');

  h = hg.h;

  FocusHook = require('./focus-hook');

  listeners = [];

  log = function(msg) {};

  openScript = function(scriptId, script, line) {
    var PROTOCOL, scriptExists;
    PROTOCOL = 'atom-node-debugger://';
    scriptExists = new Promise(function(resolve) {
      return fs.exists(script, function(result) {
        return resolve(result);
      });
    });
    return scriptExists.then(function(exists) {
      if (exists) {
        return atom.workspace.open(script, {
          initialLine: line,
          initialColumn: 0,
          activatePane: true,
          searchAllPanes: true
        });
      } else {
        if (scriptId == null) {
          return;
        }
        return atom.workspace.open("" + PROTOCOL + scriptId, {
          initialColumn: 0,
          initialLine: line,
          name: script,
          searchAllPanes: true
        });
      }
    });
  };

  exports.create = function(_debugger) {
    var CallStackPane, LocalsPane, TreeViewWatchItem, WatchPane, builder, builder2, builder3;
    builder = {
      loadProperties: function(ref) {
        log("builder.loadProperties " + ref);
        return _debugger.lookup(ref).then(function(instance) {
          log("builder.loadProperties: instance loaded");
          if (instance.className === "Date") {
            return [
              {
                name: "value",
                value: {
                  type: "string",
                  className: "string",
                  value: instance.value
                }
              }
            ];
          } else {
            return Promise.map(instance.properties, function(prop) {
              return _debugger.lookup(prop.ref);
            }).then(function(values) {
              log("builder.loadProperties: property values loaded");
              values.forEach(function(value, idx) {
                return instance.properties[idx].value = value;
              });
              return instance.properties;
            });
          }
        });
      },
      loadArrayLength: function(ref) {
        return _debugger.lookup(ref).then(function(instance) {
          return _debugger.lookup(instance.properties[0].ref);
        }).then(function(result) {
          return result.value;
        });
      },
      loadFrames: function() {
        log("builder.loadFrames");
        return _debugger.fullTrace().then(function(traces) {
          log("builder.loadFrames: frames loaded " + traces.frames.length);
          return traces.frames;
        });
      },
      property: function(property) {
        log("builder.property");
        return builder.value({
          name: property.name,
          value: {
            ref: property.ref,
            type: property.value.type,
            className: property.value.className,
            value: property.value.value
          }
        });
      },
      value: function(value, handlers) {
        var className, isArray, name, ref, title, type;
        log("builder.value");
        name = value.name;
        type = value.value.type;
        className = value.value.className;
        switch (type) {
          case 'string':
          case 'boolean':
          case 'number':
          case 'undefined':
          case 'null':
            value = value.value.value;
            title = type === 'string' ? name + " : \"" + value + "\"" : name + " : " + value;
            return TreeViewItem(title, {
              handlers: handlers
            });
          case 'function':
            return TreeViewItem(name + " : function() { ... }", {
              handlers: handlers
            });
          case 'object':
            ref = value.value.ref || value.value.handle;
            isArray = className === "Array";
            return (isArray ? builder.loadArrayLength(ref) : Promise.resolve(0)).then(function(len) {
              var decorate;
              decorate = function(title) {
                return function(state) {
                  if (state.isOpen) {
                    return title;
                  } else {
                    if (isArray) {
                      return h('span', {}, [title + " [ " + len + " ]", h('span.subtle-text', {}, " #" + ref)]);
                    } else {
                      return h('span', {}, [title + " { ... }", h('span.subtle-text', {}, " #" + ref)]);
                    }
                  }
                };
              };
              return TreeView(decorate(name + " : " + className), ((function(_this) {
                return function() {
                  return builder.loadProperties(ref).map(builder.property);
                };
              })(this)), {
                handlers: handlers
              });
            });
        }
      },
      frame: function(frame, index) {
        log("builder.frame " + frame.script.name + ", " + frame.script.line);
        return TreeView(TreeViewUtils.createFileRefHeader(frame.script.name, frame.line + 1), ((function(_this) {
          return function() {
            return Promise.resolve([
              TreeView("arguments", (function() {
                return Promise.resolve(frame["arguments"]).map(builder.value);
              })), TreeView("variables", (function() {
                return Promise.resolve(frame.locals).map(builder.value);
              }))
            ]);
          };
        })(this)), {
          handlers: {
            click: function() {
              openScript(frame.script.id, frame.script.name, frame.line);
              return _debugger.setSelectedFrame(frame, index);
            }
          }
        });
      },
      root: function() {
        log("builder.root");
        return TreeView("Call stack", (function() {
          return builder.loadFrames().map(builder.frame);
        }), {
          isRoot: true
        });
      }
    };
    CallStackPane = function() {
      var state;
      state = builder.root();
      listeners.push(_debugger.onBreak(function() {
        log("Debugger.break");
        return TreeView.reset(state);
      }));
      listeners.push(_debugger.onSelectedFrame(function(arg) {
        var index;
        index = arg.index;
        return state.items.forEach(function(item, i) {
          if (i !== index) {
            return item.isOpen.set(false);
          }
        });
      }));
      return state;
    };
    CallStackPane.render = function(state) {
      return TreeView.render(state);
    };
    builder2 = {
      selectedFrame: null,
      loadThis: function() {
        return _debugger["eval"]("this").then(function(result) {
          return [
            {
              name: "___this___",
              value: result
            }
          ];
        })["catch"](function() {
          return [];
        });
      },
      loadLocals: function() {
        var framePromise, thisPromise;
        framePromise = builder2.selectedFrame ? Promise.resolve(builder2.selectedFrame) : builder.loadFrames().then(function(frames) {
          return frames[0];
        });
        thisPromise = builder2.loadThis();
        return Promise.all([framePromise, thisPromise]).then(function(result) {
          var _this, frame;
          frame = result[0];
          _this = result[1];
          return _this.concat(frame["arguments"].concat(frame.locals));
        });
      },
      root: function() {
        var sortLocals;
        sortLocals = function(locals) {
          locals.sort(function(a, b) {
            return a.name.localeCompare(b.name);
          });
          return locals;
        };
        return TreeView("Locals", (function() {
          return builder2.loadLocals().then(sortLocals).map(builder.value);
        }), {
          isRoot: true
        });
      }
    };
    LocalsPane = function() {
      var refresh, state;
      state = builder2.root();
      refresh = function() {
        return TreeView.populate(state);
      };
      listeners.push(_debugger.onSelectedFrame(function(arg) {
        var frame;
        frame = arg.frame;
        builder2.selectedFrame = frame;
        return refresh();
      }));
      return state;
    };
    LocalsPane.render = function(state) {
      return TreeView.render(state);
    };
    TreeViewWatchItem = function(expression) {
      return hg.state({
        expression: hg.value(expression),
        value: hg.array([]),
        editMode: hg.value(false),
        deleted: hg.value(false),
        channels: {
          startEdit: function(state) {
            log("TreeViewWatchItem.dblclick");
            return state.editMode.set(true);
          },
          cancelEdit: function(state) {
            return state.editMode.set(false);
          },
          finishEdit: function(state, data) {
            if (!state.editMode()) {
              return;
            }
            state.expression.set(data.expression);
            TreeViewWatchItem.load(state);
            state.editMode.set(false);
            if (data.expression === "") {
              return state.deleted.set(true);
            }
          }
        },
        functors: {
          render: TreeViewWatchItem.render
        }
      });
    };
    TreeViewWatchItem.load = function(state) {
      log("TreeViewWatchItem.load " + (state.expression()));
      if (state.expression() === "") {
        return new Promise(function(resolve) {
          var t;
          state.editMode.set(true);
          t = TreeViewItem("<expression not set - double click to edit>", {
            handlers: {
              dblclick: (function(_this) {
                return function() {
                  return state.editMode.set(true);
                };
              })(this)
            }
          });
          state.value.set([t]);
          return resolve(state);
        });
      }
      return _debugger["eval"](state.expression()).then((function(_this) {
        return function(result) {
          var ref;
          ref = {
            name: state.expression(),
            value: result
          };
          return builder.value(ref, {
            dblclick: function() {
              return state.editMode.set(true);
            }
          });
        };
      })(this)).then((function(_this) {
        return function(t) {
          state.value.set([t]);
          return state;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          var t;
          t = TreeViewItem((state.expression()) + " : " + error, {
            handlers: {
              dblclick: function() {
                return state.editMode.set(true);
              }
            }
          });
          state.value.set([t]);
          return state;
        };
      })(this));
    };
    TreeViewWatchItem.render = function(state) {
      var ESCAPE, content, input;
      if (state.deleted) {
        return h('div', {}, []);
      }
      ESCAPE = 27;
      content = state.editMode ? (input = h("input.watch-input-box.input-sm.native-key-bindings", {
        value: state.expression,
        name: "expression",
        placeholder: state.expression === "" ? "clear content to delete slot" : void 0,
        'ev-focus': state.editMode ? FocusHook() : void 0,
        'ev-keydown': hg.sendKey(state.channels.cancelEdit, null, {
          key: ESCAPE
        }),
        'ev-event': hg.sendSubmit(state.channels.finishEdit),
        'ev-blur': hg.sendValue(state.channels.finishEdit),
        style: {
          display: 'inline'
        }
      }, []), h('li.list-item.entry', {
        'ev-dblclick': hg.send(state.channels.startEdit)
      }, [input])) : state.value.map(TreeView.render)[0];
      return content;
    };
    builder3 = {
      root: function() {
        var evalExpressions, title;
        evalExpressions = function(state) {
          var filtered, newstate, result;
          filtered = state.items.filter(function(x) {
            return !(x.deleted());
          });
          newstate = filtered.map(TreeViewWatchItem.load);
          result = [];
          newstate.forEach(function(x) {
            return result.push(x);
          });
          return Promise.all(result);
        };
        title = function(state) {
          return h("span", {}, [
            "Watch", h("input.btn.btn-xs", {
              type: "button",
              value: "+",
              style: {
                'margin': '1px 1px 2px 5px'
              },
              'ev-click': hg.send(state.channels.customEvent)
            }, [])
          ]);
        };
        return TreeView(title, evalExpressions, {
          isRoot: true,
          handlers: {
            customEvent: function(state) {
              log("TreeViewWatch custom event handler invoked");
              state.isOpen.set(true);
              return TreeViewWatchItem.load(TreeViewWatchItem("")).then(function(i) {
                return state.items.push(i);
              });
            }
          }
        });
      }
    };
    WatchPane = function() {
      var refresh, state;
      state = builder3.root();
      refresh = function() {
        return TreeView.populate(state);
      };
      listeners.push(_debugger.onBreak(function() {
        return refresh();
      }));
      listeners.push(_debugger.onSelectedFrame(function() {
        return refresh();
      }));
      return state;
    };
    WatchPane.render = function(state) {
      return TreeView.render(state);
    };
    return {
      CallStackPane: CallStackPane,
      LocalsPane: LocalsPane,
      WatchPane: WatchPane
    };
  };

  exports.cleanup = function() {
    var j, len1, remove, results;
    results = [];
    for (j = 0, len1 = listeners.length; j < len1; j++) {
      remove = listeners[j];
      results.push(remove());
    }
    return results;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvQ2FsbFN0YWNrUGFuZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixPQUEwQyxPQUFBLENBQVEsWUFBUixDQUExQyxFQUFDLHdCQUFELEVBQVcsZ0NBQVgsRUFBeUI7O0VBQ3pCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0osSUFBSzs7RUFDTixTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBSVosU0FBQSxHQUFZOztFQUVaLEdBQUEsR0FBTSxTQUFDLEdBQUQsR0FBQTs7RUFFTixVQUFBLEdBQWEsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixJQUFuQjtBQUVYLFFBQUE7SUFBQSxRQUFBLEdBQVc7SUFDWCxZQUFBLEdBQW1CLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRDthQUN6QixFQUFFLENBQUMsTUFBSCxDQUFVLE1BQVYsRUFBa0IsU0FBQyxNQUFEO2VBQ2hCLE9BQUEsQ0FBUSxNQUFSO01BRGdCLENBQWxCO0lBRHlCLENBQVI7V0FJbkIsWUFDRSxDQUFDLElBREgsQ0FDUSxTQUFDLE1BQUQ7TUFDSixJQUFHLE1BQUg7ZUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsTUFBcEIsRUFBNEI7VUFDMUIsV0FBQSxFQUFhLElBRGE7VUFFMUIsYUFBQSxFQUFlLENBRlc7VUFHMUIsWUFBQSxFQUFjLElBSFk7VUFJMUIsY0FBQSxFQUFnQixJQUpVO1NBQTVCLEVBREY7T0FBQSxNQUFBO1FBUUUsSUFBYyxnQkFBZDtBQUFBLGlCQUFBOztlQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixFQUFBLEdBQUcsUUFB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Vmlld0l0ZW0sIFRyZWVWaWV3VXRpbHN9ID0gcmVxdWlyZSAnLi9UcmVlVmlldydcbmhnID0gcmVxdWlyZSAnbWVyY3VyeSdcbmZzID0gcmVxdWlyZSAnZnMnXG57aH0gPSBoZ1xuRm9jdXNIb29rID0gcmVxdWlyZSgnLi9mb2N1cy1ob29rJyk7XG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5saXN0ZW5lcnMgPSBbXVxuXG5sb2cgPSAobXNnKSAtPiAjY29uc29sZS5sb2cobXNnKVxuXG5vcGVuU2NyaXB0ID0gKHNjcmlwdElkLCBzY3JpcHQsIGxpbmUpIC0+XG5cbiAgUFJPVE9DT0wgPSAnYXRvbS1ub2RlLWRlYnVnZ2VyOi8vJ1xuICBzY3JpcHRFeGlzdHMgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICBmcy5leGlzdHMgc2NyaXB0LCAocmVzdWx0KSAtPlxuICAgICAgcmVzb2x2ZShyZXN1bHQpXG5cbiAgc2NyaXB0RXhpc3RzXG4gICAgLnRoZW4gKGV4aXN0cykgLT5cbiAgICAgIGlmIGV4aXN0c1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHNjcmlwdCwge1xuICAgICAgICAgIGluaXRpYWxMaW5lOiBsaW5lXG4gICAgICAgICAgaW5pdGlhbENvbHVtbjogMFxuICAgICAgICAgIGFjdGl2YXRlUGFuZTogdHJ1ZVxuICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBpZiBub3Qgc2NyaXB0SWQ/XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oXCIje1BST1RPQ09MfSN7c2NyaXB0SWR9XCIsIHtcbiAgICAgICAgICBpbml0aWFsQ29sdW1uOiAwXG4gICAgICAgICAgaW5pdGlhbExpbmU6IGxpbmVcbiAgICAgICAgICBuYW1lOiBzY3JpcHRcbiAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZVxuICAgICAgICB9KVxuXG5leHBvcnRzLmNyZWF0ZSA9IChfZGVidWdnZXIpIC0+XG5cbiAgYnVpbGRlciA9XG4gICAgbG9hZFByb3BlcnRpZXM6IChyZWYpIC0+XG4gICAgICBsb2cgXCJidWlsZGVyLmxvYWRQcm9wZXJ0aWVzICN7cmVmfVwiXG4gICAgICBfZGVidWdnZXJcbiAgICAgIC5sb29rdXAocmVmKVxuICAgICAgLnRoZW4gKGluc3RhbmNlKSAtPlxuICAgICAgICBsb2cgXCJidWlsZGVyLmxvYWRQcm9wZXJ0aWVzOiBpbnN0YW5jZSBsb2FkZWRcIlxuICAgICAgICBpZiBpbnN0YW5jZS5jbGFzc05hbWUgaXMgXCJEYXRlXCJcbiAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgbmFtZTogXCJ2YWx1ZVwiXG4gICAgICAgICAgICAgIHZhbHVlOlxuICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICB2YWx1ZTogaW5zdGFuY2UudmFsdWVcbiAgICAgICAgICAgIH1dXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBQcm9taXNlXG4gICAgICAgICAgLm1hcCBpbnN0YW5jZS5wcm9wZXJ0aWVzLCAocHJvcCkgLT5cbiAgICAgICAgICAgIF9kZWJ1Z2dlci5sb29rdXAocHJvcC5yZWYpXG4gICAgICAgICAgLnRoZW4gKHZhbHVlcykgLT5cbiAgICAgICAgICAgIGxvZyBcImJ1aWxkZXIubG9hZFByb3BlcnRpZXM6IHByb3BlcnR5IHZhbHVlcyBsb2FkZWRcIlxuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2ggKHZhbHVlLCBpZHgpIC0+XG4gICAgICAgICAgICAgIGluc3RhbmNlLnByb3BlcnRpZXNbaWR4XS52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJvcGVydGllc1xuXG4gICAgbG9hZEFycmF5TGVuZ3RoOiAocmVmKSAtPlxuICAgICAgX2RlYnVnZ2VyXG4gICAgICAubG9va3VwKHJlZilcbiAgICAgIC50aGVuIChpbnN0YW5jZSkgLT5cbiAgICAgICAgX2RlYnVnZ2VyLmxvb2t1cChpbnN0YW5jZS5wcm9wZXJ0aWVzWzBdLnJlZilcbiAgICAgIC50aGVuIChyZXN1bHQpIC0+XG4gICAgICAgIHJlc3VsdC52YWx1ZVxuXG4gICAgbG9hZEZyYW1lczogKCkgLT5cbiAgICAgIGxvZyBcImJ1aWxkZXIubG9hZEZyYW1lc1wiXG4gICAgICBfZGVidWdnZXIuZnVsbFRyYWNlKClcbiAgICAgIC50aGVuICh0cmFjZXMpIC0+XG4gICAgICAgIGxvZyBcImJ1aWxkZXIubG9hZEZyYW1lczogZnJhbWVzIGxvYWRlZCAje3RyYWNlcy5mcmFtZXMubGVuZ3RofVwiXG4gICAgICAgIHJldHVybiB0cmFjZXMuZnJhbWVzXG5cbiAgICBwcm9wZXJ0eTogKHByb3BlcnR5KSAtPlxuICAgICAgbG9nIFwiYnVpbGRlci5wcm9wZXJ0eVwiXG4gICAgICBidWlsZGVyLnZhbHVlKHtcbiAgICAgICAgbmFtZTogcHJvcGVydHkubmFtZVxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIHJlZjogcHJvcGVydHkucmVmXG4gICAgICAgICAgdHlwZTogcHJvcGVydHkudmFsdWUudHlwZVxuICAgICAgICAgIGNsYXNzTmFtZTogcHJvcGVydHkudmFsdWUuY2xhc3NOYW1lXG4gICAgICAgICAgdmFsdWU6IHByb3BlcnR5LnZhbHVlLnZhbHVlXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICB2YWx1ZTogKHZhbHVlLCBoYW5kbGVycykgLT5cbiAgICAgIGxvZyBcImJ1aWxkZXIudmFsdWVcIlxuICAgICAgbmFtZSA9IHZhbHVlLm5hbWVcbiAgICAgIHR5cGUgPSB2YWx1ZS52YWx1ZS50eXBlXG4gICAgICBjbGFzc05hbWUgPSB2YWx1ZS52YWx1ZS5jbGFzc05hbWVcbiAgICAgIHN3aXRjaCh0eXBlKVxuICAgICAgICB3aGVuICdzdHJpbmcnLCAnYm9vbGVhbicsICdudW1iZXInLCAndW5kZWZpbmVkJywgJ251bGwnXG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS52YWx1ZS52YWx1ZVxuICAgICAgICAgIHRpdGxlID0gaWYgdHlwZSBpcyAnc3RyaW5nJyB0aGVuIFwiI3tuYW1lfSA6IFxcXCIje3ZhbHVlfVxcXCJcIiBlbHNlIFwiI3tuYW1lfSA6ICN7dmFsdWV9XCJcbiAgICAgICAgICBUcmVlVmlld0l0ZW0odGl0bGUsIGhhbmRsZXJzOiBoYW5kbGVycylcbiAgICAgICAgd2hlbiAnZnVuY3Rpb24nXG4gICAgICAgICAgVHJlZVZpZXdJdGVtKFwiI3tuYW1lfSA6IGZ1bmN0aW9uKCkgeyAuLi4gfVwiLCBoYW5kbGVyczogaGFuZGxlcnMpXG4gICAgICAgIHdoZW4gJ29iamVjdCdcbiAgICAgICAgICByZWYgPSB2YWx1ZS52YWx1ZS5yZWYgfHwgdmFsdWUudmFsdWUuaGFuZGxlXG4gICAgICAgICAgaXNBcnJheSA9IGNsYXNzTmFtZSBpcyBcIkFycmF5XCJcbiAgICAgICAgICAoaWYgaXNBcnJheSB0aGVuIGJ1aWxkZXIubG9hZEFycmF5TGVuZ3RoKHJlZikgZWxzZSBQcm9taXNlLnJlc29sdmUoMCkpLnRoZW4gKGxlbikgLT5cbiAgICAgICAgICAgIGRlY29yYXRlID1cbiAgICAgICAgICAgICAgKHRpdGxlKSAtPlxuICAgICAgICAgICAgICAgIChzdGF0ZSkgLT5cbiAgICAgICAgICAgICAgICAgIGlmIHN0YXRlLmlzT3BlblxuICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBpc0FycmF5XG4gICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHt9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiN7dGl0bGV9IFsgI3tsZW59IF1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3Bhbi5zdWJ0bGUtdGV4dCcsIHt9LCBcIiAjI3tyZWZ9XCIpXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7fSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIje3RpdGxlfSB7IC4uLiB9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4uc3VidGxlLXRleHQnLCB7fSwgXCIgIyN7cmVmfVwiKVxuICAgICAgICAgICAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIFRyZWVWaWV3KGRlY29yYXRlKFwiI3tuYW1lfSA6ICN7Y2xhc3NOYW1lfVwiKSwgKCgpID0+IGJ1aWxkZXIubG9hZFByb3BlcnRpZXMocmVmKS5tYXAoYnVpbGRlci5wcm9wZXJ0eSkpLCBoYW5kbGVyczogaGFuZGxlcnMpXG5cbiAgICBmcmFtZTogKGZyYW1lLCBpbmRleCkgLT5cbiAgICAgIGxvZyBcImJ1aWxkZXIuZnJhbWUgI3tmcmFtZS5zY3JpcHQubmFtZX0sICN7ZnJhbWUuc2NyaXB0LmxpbmV9XCJcbiAgICAgIHJldHVybiBUcmVlVmlldyhcbiAgICAgICAgICBUcmVlVmlld1V0aWxzLmNyZWF0ZUZpbGVSZWZIZWFkZXIgZnJhbWUuc2NyaXB0Lm5hbWUsIGZyYW1lLmxpbmUgKyAxXG4gICAgICAgICAgKCgpID0+XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoW1xuICAgICAgICAgICAgICBUcmVlVmlldyhcImFyZ3VtZW50c1wiLCAoKCkgPT4gUHJvbWlzZS5yZXNvbHZlKGZyYW1lLmFyZ3VtZW50cykubWFwKGJ1aWxkZXIudmFsdWUpKSlcbiAgICAgICAgICAgICAgVHJlZVZpZXcoXCJ2YXJpYWJsZXNcIiwgKCgpID0+IFByb21pc2UucmVzb2x2ZShmcmFtZS5sb2NhbHMpLm1hcChidWlsZGVyLnZhbHVlKSkpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICksXG4gICAgICAgICAgaGFuZGxlcnM6IHtcbiAgICAgICAgICAgICAgY2xpY2s6ICgpIC0+XG4gICAgICAgICAgICAgICAgb3BlblNjcmlwdChmcmFtZS5zY3JpcHQuaWQsIGZyYW1lLnNjcmlwdC5uYW1lLCBmcmFtZS5saW5lKVxuICAgICAgICAgICAgICAgIF9kZWJ1Z2dlci5zZXRTZWxlY3RlZEZyYW1lIGZyYW1lLCBpbmRleFxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgcm9vdDogKCkgLT5cbiAgICAgIGxvZyBcImJ1aWxkZXIucm9vdFwiXG4gICAgICBUcmVlVmlldyhcIkNhbGwgc3RhY2tcIiwgKCgpIC0+IGJ1aWxkZXIubG9hZEZyYW1lcygpLm1hcChidWlsZGVyLmZyYW1lKSksIGlzUm9vdDogdHJ1ZSlcblxuICBDYWxsU3RhY2tQYW5lID0gKCkgLT5cbiAgICBzdGF0ZSA9IGJ1aWxkZXIucm9vdCgpXG4gICAgbGlzdGVuZXJzLnB1c2ggX2RlYnVnZ2VyLm9uQnJlYWsgKCkgLT5cbiAgICAgIGxvZyBcIkRlYnVnZ2VyLmJyZWFrXCJcbiAgICAgIFRyZWVWaWV3LnJlc2V0KHN0YXRlKVxuICAgIGxpc3RlbmVycy5wdXNoIF9kZWJ1Z2dlci5vblNlbGVjdGVkRnJhbWUgKHtpbmRleH0pIC0+XG4gICAgICBzdGF0ZS5pdGVtcy5mb3JFYWNoKChpdGVtLGkpIC0+IGlmIGkgaXNudCBpbmRleCB0aGVuIGl0ZW0uaXNPcGVuLnNldChmYWxzZSkpO1xuXG4gICAgcmV0dXJuIHN0YXRlXG5cbiAgQ2FsbFN0YWNrUGFuZS5yZW5kZXIgPSAoc3RhdGUpIC0+XG4gICAgVHJlZVZpZXcucmVuZGVyKHN0YXRlKVxuXG4gIGJ1aWxkZXIyID1cbiAgICBzZWxlY3RlZEZyYW1lOiBudWxsXG5cbiAgICBsb2FkVGhpczogKCkgLT5cbiAgICAgIF9kZWJ1Z2dlci5ldmFsKFwidGhpc1wiKVxuICAgICAgLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgbmFtZTogXCJfX190aGlzX19fXCJcbiAgICAgICAgICB2YWx1ZTogcmVzdWx0XG4gICAgICAgIH1dXG4gICAgICAuY2F0Y2ggLT5cbiAgICAgICAgcmV0dXJuIFtdXG5cbiAgICBsb2FkTG9jYWxzOiAoKSAtPlxuICAgICAgZnJhbWVQcm9taXNlID0gaWYgYnVpbGRlcjIuc2VsZWN0ZWRGcmFtZSB0aGVuIFByb21pc2UucmVzb2x2ZShidWlsZGVyMi5zZWxlY3RlZEZyYW1lKVxuICAgICAgZWxzZSBidWlsZGVyLmxvYWRGcmFtZXMoKS50aGVuIChmcmFtZXMpIC0+IHJldHVybiBmcmFtZXNbMF1cbiAgICAgIHRoaXNQcm9taXNlID0gYnVpbGRlcjIubG9hZFRoaXMoKVxuXG4gICAgICBQcm9taXNlLmFsbCBbZnJhbWVQcm9taXNlLCB0aGlzUHJvbWlzZV1cbiAgICAgIC50aGVuIChyZXN1bHQpIC0+XG4gICAgICAgIGZyYW1lID0gcmVzdWx0WzBdXG4gICAgICAgIF90aGlzID0gcmVzdWx0WzFdXG4gICAgICAgIHJldHVybiBfdGhpcy5jb25jYXQoZnJhbWUuYXJndW1lbnRzLmNvbmNhdChmcmFtZS5sb2NhbHMpKVxuXG4gICAgcm9vdDogKCkgLT5cbiAgICAgIHNvcnRMb2NhbHMgPSAobG9jYWxzKSAtPlxuICAgICAgICBsb2NhbHMuc29ydCgoYSxiKSAtPiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKTtcbiAgICAgICAgcmV0dXJuIGxvY2FscztcbiAgICAgIFRyZWVWaWV3KFwiTG9jYWxzXCIsICgoKSAtPiBidWlsZGVyMi5sb2FkTG9jYWxzKCkudGhlbihzb3J0TG9jYWxzKS5tYXAoYnVpbGRlci52YWx1ZSkpLCBpc1Jvb3Q6dHJ1ZSlcblxuICBMb2NhbHNQYW5lID0gKCkgLT5cbiAgICBzdGF0ZSA9IGJ1aWxkZXIyLnJvb3QoKVxuICAgIHJlZnJlc2ggPSAoKSAtPiBUcmVlVmlldy5wb3B1bGF0ZShzdGF0ZSlcbiAgICBsaXN0ZW5lcnMucHVzaCBfZGVidWdnZXIub25TZWxlY3RlZEZyYW1lICh7ZnJhbWV9KSAtPlxuICAgICAgYnVpbGRlcjIuc2VsZWN0ZWRGcmFtZSA9IGZyYW1lXG4gICAgICByZWZyZXNoKClcbiAgICByZXR1cm4gc3RhdGVcblxuICBMb2NhbHNQYW5lLnJlbmRlciA9IChzdGF0ZSkgLT5cbiAgICBUcmVlVmlldy5yZW5kZXIoc3RhdGUpXG5cbiAgVHJlZVZpZXdXYXRjaEl0ZW0gPSAoZXhwcmVzc2lvbikgLT4gaGcuc3RhdGUoe1xuICAgICAgZXhwcmVzc2lvbjogaGcudmFsdWUoZXhwcmVzc2lvbilcbiAgICAgIHZhbHVlOiBoZy5hcnJheShbXSkgIyBrZWVwaW5nIHRoZSBzdWIgY29tcG9uZW50IGluIGFuIGFycmF5IGlzIGEgd29ya2Fyb3VuZC4gaGcudmFsdWUgY2F1c2VzIHByb2JsZW0gb2Ygbm90IHJlLXJlbmRlcmluZyB3aGVuIGV4cGFuZGluZyBleHByZXNzaW9uc1xuICAgICAgZWRpdE1vZGU6IGhnLnZhbHVlKGZhbHNlKVxuICAgICAgZGVsZXRlZDogaGcudmFsdWUoZmFsc2UpXG4gICAgICBjaGFubmVsczoge1xuICAgICAgICBzdGFydEVkaXQ6XG4gICAgICAgICAgKHN0YXRlKSAtPlxuICAgICAgICAgICAgbG9nIFwiVHJlZVZpZXdXYXRjaEl0ZW0uZGJsY2xpY2tcIlxuICAgICAgICAgICAgc3RhdGUuZWRpdE1vZGUuc2V0KHRydWUpXG4gICAgICAgIGNhbmNlbEVkaXQ6XG4gICAgICAgICAgKHN0YXRlKSAtPlxuICAgICAgICAgICAgc3RhdGUuZWRpdE1vZGUuc2V0KGZhbHNlKVxuICAgICAgICBmaW5pc2hFZGl0OlxuICAgICAgICAgIChzdGF0ZSwgZGF0YSkgLT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3Mgc3RhdGUuZWRpdE1vZGUoKVxuICAgICAgICAgICAgc3RhdGUuZXhwcmVzc2lvbi5zZXQoZGF0YS5leHByZXNzaW9uKVxuICAgICAgICAgICAgVHJlZVZpZXdXYXRjaEl0ZW0ubG9hZChzdGF0ZSlcbiAgICAgICAgICAgIHN0YXRlLmVkaXRNb2RlLnNldChmYWxzZSlcbiAgICAgICAgICAgIHN0YXRlLmRlbGV0ZWQuc2V0KHRydWUpIGlmIGRhdGEuZXhwcmVzc2lvbiBpcyBcIlwiXG4gICAgICB9XG4gICAgICBmdW5jdG9yczoge1xuICAgICAgICByZW5kZXI6IFRyZWVWaWV3V2F0Y2hJdGVtLnJlbmRlclxuICAgICAgfVxuICAgIH0pXG5cbiAgVHJlZVZpZXdXYXRjaEl0ZW0ubG9hZCA9IChzdGF0ZSkgLT5cbiAgICAgIGxvZyBcIlRyZWVWaWV3V2F0Y2hJdGVtLmxvYWQgI3tzdGF0ZS5leHByZXNzaW9uKCl9XCJcbiAgICAgIGlmIHN0YXRlLmV4cHJlc3Npb24oKSBpcyBcIlwiXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICAgICAgICBzdGF0ZS5lZGl0TW9kZS5zZXQodHJ1ZSlcbiAgICAgICAgICB0ID0gVHJlZVZpZXdJdGVtKFwiPGV4cHJlc3Npb24gbm90IHNldCAtIGRvdWJsZSBjbGljayB0byBlZGl0PlwiLCBoYW5kbGVyczogeyBkYmxjbGljazogKCkgPT4gc3RhdGUuZWRpdE1vZGUuc2V0KHRydWUpIH0pXG4gICAgICAgICAgc3RhdGUudmFsdWUuc2V0KFt0XSlcbiAgICAgICAgICByZXNvbHZlKHN0YXRlKVxuXG4gICAgICBfZGVidWdnZXIuZXZhbChzdGF0ZS5leHByZXNzaW9uKCkpXG4gICAgICAudGhlbiAocmVzdWx0KSA9PlxuICAgICAgICByZWYgPSB7IG5hbWU6IHN0YXRlLmV4cHJlc3Npb24oKSwgdmFsdWU6IHJlc3VsdCB9XG4gICAgICAgIGJ1aWxkZXIudmFsdWUocmVmLCB7IGRibGNsaWNrOiAoKSA9PiBzdGF0ZS5lZGl0TW9kZS5zZXQodHJ1ZSkgfSlcbiAgICAgIC50aGVuICh0KSA9PlxuICAgICAgICBzdGF0ZS52YWx1ZS5zZXQoW3RdKVxuICAgICAgICByZXR1cm4gc3RhdGVcbiAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgIHQgPSBUcmVlVmlld0l0ZW0oXCIje3N0YXRlLmV4cHJlc3Npb24oKX0gOiAje2Vycm9yfVwiLCBoYW5kbGVyczogeyBkYmxjbGljazogKCkgPT4gc3RhdGUuZWRpdE1vZGUuc2V0KHRydWUpIH0pXG4gICAgICAgIHN0YXRlLnZhbHVlLnNldChbdF0pXG4gICAgICAgIHJldHVybiBzdGF0ZVxuXG4gIFRyZWVWaWV3V2F0Y2hJdGVtLnJlbmRlciA9IChzdGF0ZSkgLT5cbiAgICByZXR1cm4gaCgnZGl2Jywge30sIFtdKSBpZiBzdGF0ZS5kZWxldGVkXG4gICAgRVNDQVBFID0gMjdcbiAgICBjb250ZW50ID1cbiAgICAgIGlmIHN0YXRlLmVkaXRNb2RlXG4gICAgICAgIGlucHV0ID0gaChcImlucHV0LndhdGNoLWlucHV0LWJveC5pbnB1dC1zbS5uYXRpdmUta2V5LWJpbmRpbmdzXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiBzdGF0ZS5leHByZXNzaW9uXG4gICAgICAgICAgICBuYW1lOiBcImV4cHJlc3Npb25cIlxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiY2xlYXIgY29udGVudCB0byBkZWxldGUgc2xvdFwiIGlmIHN0YXRlLmV4cHJlc3Npb24gaXMgXCJcIlxuICAgICAgICAgICAgIyB3aGVuIHdlIG5lZWQgYW4gUlBDIGludm9jYXRpb24gd2UgYWRkIGFcbiAgICAgICAgICAgICMgY3VzdG9tIG11dGFibGUgb3BlcmF0aW9uIGludG8gdGhlIHRyZWUgdG8gYmVcbiAgICAgICAgICAgICMgaW52b2tlZCBhdCBwYXRjaCB0aW1lXG4gICAgICAgICAgICAnZXYtZm9jdXMnOiBGb2N1c0hvb2soKSBpZiBzdGF0ZS5lZGl0TW9kZSxcbiAgICAgICAgICAgICdldi1rZXlkb3duJzogaGcuc2VuZEtleShzdGF0ZS5jaGFubmVscy5jYW5jZWxFZGl0LCBudWxsLCB7a2V5OiBFU0NBUEV9KSxcbiAgICAgICAgICAgICdldi1ldmVudCc6IGhnLnNlbmRTdWJtaXQoc3RhdGUuY2hhbm5lbHMuZmluaXNoRWRpdClcbiAgICAgICAgICAgICdldi1ibHVyJzogaGcuc2VuZFZhbHVlKHN0YXRlLmNoYW5uZWxzLmZpbmlzaEVkaXQpXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIFtdKVxuICAgICAgICBoKCdsaS5saXN0LWl0ZW0uZW50cnknLCB7ICdldi1kYmxjbGljayc6IGhnLnNlbmQoc3RhdGUuY2hhbm5lbHMuc3RhcnRFZGl0KSB9LCBbaW5wdXRdKVxuICAgICAgZWxzZVxuICAgICAgICBzdGF0ZS52YWx1ZS5tYXAoVHJlZVZpZXcucmVuZGVyKVswXVxuICAgIGNvbnRlbnRcblxuICBidWlsZGVyMyA9XG4gICAgcm9vdDogKCkgLT5cbiAgICAgIGV2YWxFeHByZXNzaW9ucyA9IChzdGF0ZSkgLT5cbiAgICAgICAgZmlsdGVyZWQgPSBzdGF0ZS5pdGVtcy5maWx0ZXIgKHgpIC0+IG5vdCh4LmRlbGV0ZWQoKSlcbiAgICAgICAgbmV3c3RhdGUgPSBmaWx0ZXJlZC5tYXAgVHJlZVZpZXdXYXRjaEl0ZW0ubG9hZFxuICAgICAgICByZXN1bHQgPSBbXVxuICAgICAgICBuZXdzdGF0ZS5mb3JFYWNoICh4KSAtPiByZXN1bHQucHVzaCh4KVxuICAgICAgICBQcm9taXNlLmFsbChyZXN1bHQpXG5cbiAgICAgIHRpdGxlID0gKHN0YXRlKSAtPlxuICAgICAgICBoKFwic3BhblwiLCB7fSwgW1xuICAgICAgICAgIFwiV2F0Y2hcIlxuICAgICAgICAgIGgoXCJpbnB1dC5idG4uYnRuLXhzXCIsIHtcbiAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIlxuICAgICAgICAgICAgICB2YWx1ZTogXCIrXCJcbiAgICAgICAgICAgICAgc3R5bGU6XG4gICAgICAgICAgICAgICAgJ21hcmdpbic6ICcxcHggMXB4IDJweCA1cHgnXG4gICAgICAgICAgICAgICdldi1jbGljayc6XG4gICAgICAgICAgICAgICAgICBoZy5zZW5kIHN0YXRlLmNoYW5uZWxzLmN1c3RvbUV2ZW50XG4gICAgICAgICAgfSwgW10pXG4gICAgICAgIF0pXG5cbiAgICAgIHJldHVybiBUcmVlVmlldyh0aXRsZSwgZXZhbEV4cHJlc3Npb25zLCBpc1Jvb3Q6dHJ1ZSwgaGFuZGxlcnM6IHtcbiAgICAgICAgICBjdXN0b21FdmVudDogKHN0YXRlKSAtPlxuICAgICAgICAgICAgbG9nIFwiVHJlZVZpZXdXYXRjaCBjdXN0b20gZXZlbnQgaGFuZGxlciBpbnZva2VkXCJcbiAgICAgICAgICAgIHN0YXRlLmlzT3Blbi5zZXQodHJ1ZSlcbiAgICAgICAgICAgIFRyZWVWaWV3V2F0Y2hJdGVtLmxvYWQoVHJlZVZpZXdXYXRjaEl0ZW0oXCJcIikpLnRoZW4gKGkpIC0+XG4gICAgICAgICAgICAgIHN0YXRlLml0ZW1zLnB1c2goaSlcbiAgICAgICAgfSlcblxuICBXYXRjaFBhbmUgPSAoKSAtPlxuICAgIHN0YXRlID0gYnVpbGRlcjMucm9vdCgpXG4gICAgcmVmcmVzaCA9ICgpIC0+IFRyZWVWaWV3LnBvcHVsYXRlKHN0YXRlKVxuICAgIGxpc3RlbmVycy5wdXNoIF9kZWJ1Z2dlci5vbkJyZWFrICgpIC0+IHJlZnJlc2goKVxuICAgIGxpc3RlbmVycy5wdXNoIF9kZWJ1Z2dlci5vblNlbGVjdGVkRnJhbWUgKCkgLT4gcmVmcmVzaCgpXG4gICAgcmV0dXJuIHN0YXRlXG5cbiAgV2F0Y2hQYW5lLnJlbmRlciA9IChzdGF0ZSkgLT5cbiAgICBUcmVlVmlldy5yZW5kZXIoc3RhdGUpXG5cbiAgcmV0dXJuIHtcbiAgICBDYWxsU3RhY2tQYW5lOiBDYWxsU3RhY2tQYW5lXG4gICAgTG9jYWxzUGFuZTogTG9jYWxzUGFuZVxuICAgIFdhdGNoUGFuZTogV2F0Y2hQYW5lXG4gIH1cblxuZXhwb3J0cy5jbGVhbnVwID0gKCkgLT5cbiAgZm9yIHJlbW92ZSBpbiBsaXN0ZW5lcnNcbiAgICByZW1vdmUoKVxuIl19
