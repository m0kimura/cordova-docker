(function() {
  var CompositeDisposable, Mocha, ResultView, context, currentContext, mocha, os, path, resultView;

  path = require('path');

  os = require('os');

  context = require('./context');

  Mocha = require('./mocha');

  ResultView = require('./result-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  mocha = null;

  resultView = null;

  currentContext = null;

  module.exports = {
    config: {
      nodeBinaryPath: {
        type: 'string',
        "default": os.platform() === 'win32' ? 'C:\\Program Files\\nodejs\\node.exe' : '/usr/local/bin/node',
        description: 'Path to the node executable'
      },
      textOnlyOutput: {
        type: 'boolean',
        "default": false,
        description: 'Remove any colors from the Mocha output'
      },
      showContextInformation: {
        type: 'boolean',
        "default": false,
        description: 'Display extra information for troubleshooting'
      },
      options: {
        type: 'string',
        "default": '',
        description: 'Append given options always to Mocha binary'
      },
      optionsForDebug: {
        type: 'string',
        "default": '--debug --debug-brk',
        description: 'Append given options to Mocha binary to enable debugging'
      },
      env: {
        type: 'string',
        "default": '',
        description: 'Append environment variables'
      }
    },
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      resultView = new ResultView(state);
      this.subscriptions.add(atom.commands.add(resultView, 'result-view:close', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'core:cancel', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'core:close', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'mocha-test-runner:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'mocha-test-runner:debug': (function(_this) {
          return function() {
            return _this.run(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'mocha-test-runner:run-previous', (function(_this) {
        return function() {
          return _this.runPrevious();
        };
      })(this)));
      return this.subscriptions.add(atom.commands.add('atom-workspace', 'mocha-test-runner:debug-previous', (function(_this) {
        return function() {
          return _this.runPrevious(true);
        };
      })(this)));
    },
    deactivate: function() {
      this.close();
      this.subscriptions.dispose();
      return resultView = null;
    },
    serialize: function() {
      return resultView.serialize();
    },
    close: function() {
      var ref;
      if (mocha) {
        mocha.stop();
      }
      resultView.detach();
      return (ref = this.resultViewPanel) != null ? ref.destroy() : void 0;
    },
    run: function(inDebugMode) {
      var editor;
      if (inDebugMode == null) {
        inDebugMode = false;
      }
      editor = atom.workspace.getActivePaneItem();
      currentContext = context.find(editor);
      return this.execute(inDebugMode);
    },
    runPrevious: function(inDebugMode) {
      if (inDebugMode == null) {
        inDebugMode = false;
      }
      if (currentContext) {
        return this.execute(inDebugMode);
      } else {
        return this.displayError('No previous test run');
      }
    },
    execute: function(inDebugMode) {
      var editor, nodeBinary;
      if (inDebugMode == null) {
        inDebugMode = false;
      }
      resultView.reset();
      if (!resultView.hasParent()) {
        this.resultViewPanel = atom.workspace.addBottomPanel({
          item: resultView
        });
      }
      if (atom.config.get('mocha-test-runner.showContextInformation')) {
        nodeBinary = atom.config.get('mocha-test-runner.nodeBinaryPath');
        resultView.addLine("Node binary:    " + nodeBinary + "\n");
        resultView.addLine("Root folder:    " + currentContext.root + "\n");
        resultView.addLine("Path to mocha:  " + currentContext.mocha + "\n");
        resultView.addLine("Debug-Mode:     " + inDebugMode + "\n");
        resultView.addLine("Test file:      " + currentContext.test + "\n");
        resultView.addLine("Selected test:  " + currentContext.grep + "\n\n");
      }
      editor = atom.workspace.getActivePaneItem();
      mocha = new Mocha(currentContext, inDebugMode);
      mocha.on('success', function() {
        return resultView.success();
      });
      mocha.on('failure', function() {
        return resultView.failure();
      });
      mocha.on('updateSummary', function(stats) {
        return resultView.updateSummary(stats);
      });
      mocha.on('output', function(text) {
        return resultView.addLine(text);
      });
      mocha.on('error', function(err) {
        resultView.addLine('Failed to run Mocha\n' + err.message);
        return resultView.failure();
      });
      return mocha.run();
    },
    displayError: function(message) {
      resultView.reset();
      resultView.addLine(message);
      resultView.failure();
      if (!resultView.hasParent()) {
        return atom.workspace.addBottomPanel({
          item: resultView
        });
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL2xpYi9tb2NoYS10ZXN0LXJ1bm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBYyxPQUFBLENBQVEsTUFBUjs7RUFDZCxFQUFBLEdBQWMsT0FBQSxDQUFRLElBQVI7O0VBQ2QsT0FBQSxHQUFjLE9BQUEsQ0FBUSxXQUFSOztFQUNkLEtBQUEsR0FBYyxPQUFBLENBQVEsU0FBUjs7RUFDZCxVQUFBLEdBQWMsT0FBQSxDQUFRLGVBQVI7O0VBRWIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixLQUFBLEdBQVE7O0VBQ1IsVUFBQSxHQUFhOztFQUNiLGNBQUEsR0FBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVksRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtBQWlCLE9BQXBCLEdBQWlDLHFDQUFqQyxHQUE0RSxxQkFEckY7UUFFQSxXQUFBLEVBQWEsNkJBRmI7T0FERjtNQUlBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHlDQUZiO09BTEY7TUFRQSxzQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsK0NBRmI7T0FURjtNQVlBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLDZDQUZiO09BYkY7TUFnQkEsZUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47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QVUsQ0FBQyxPQUFYLENBQUE7TUFDQSxJQUFHLENBQUksVUFBVSxDQUFDLFNBQVgsQ0FBQSxDQUFQO2VBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO1VBQUEsSUFBQSxFQUFLLFVBQUw7U0FBOUIsRUFERjs7SUFKWSxDQS9GZDs7QUFiRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggICAgICAgID0gcmVxdWlyZSAncGF0aCdcbm9zICAgICAgICAgID0gcmVxdWlyZSAnb3MnXG5jb250ZXh0ICAgICA9IHJlcXVpcmUgJy4vY29udGV4dCdcbk1vY2hhICAgICAgID0gcmVxdWlyZSAnLi9tb2NoYSdcblJlc3VsdFZpZXcgID0gcmVxdWlyZSAnLi9yZXN1bHQtdmlldydcblxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9jaGEgPSBudWxsXG5yZXN1bHRWaWV3ID0gbnVsbFxuY3VycmVudENvbnRleHQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiAjIFRoZXkgYXJlIG9ubHkgcmVhZCB1cG9uIGFjdGl2YXRpb24gKGF0b20gYnVnPyksIHRodXMgdGhlIGFjdGl2YXRpb25Db21tYW5kcyBmb3IgXCJzZXR0aW5ncy12aWV3Om9wZW5cIiBpbiBwYWNrYWdlLmpzb25cbiAgICBub2RlQmluYXJ5UGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBpZiBvcy5wbGF0Zm9ybSgpIGlzICd3aW4zMicgdGhlbiAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxub2RlanNcXFxcbm9kZS5leGUnIGVsc2UgJy91c3IvbG9jYWwvYmluL25vZGUnXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGggdG8gdGhlIG5vZGUgZXhlY3V0YWJsZSdcbiAgICB0ZXh0T25seU91dHB1dDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlIGFueSBjb2xvcnMgZnJvbSB0aGUgTW9jaGEgb3V0cHV0J1xuICAgIHNob3dDb250ZXh0SW5mb3JtYXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXkgZXh0cmEgaW5mb3JtYXRpb24gZm9yIHRyb3VibGVzaG9vdGluZydcbiAgICBvcHRpb25zOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBkZXNjcmlwdGlvbjogJ0FwcGVuZCBnaXZlbiBvcHRpb25zIGFsd2F5cyB0byBNb2NoYSBiaW5hcnknXG4gICAgb3B0aW9uc0ZvckRlYnVnOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICctLWRlYnVnIC0tZGVidWctYnJrJ1xuICAgICAgZGVzY3JpcHRpb246ICdBcHBlbmQgZ2l2ZW4gb3B0aW9ucyB0byBNb2NoYSBiaW5hcnkgdG8gZW5hYmxlIGRlYnVnZ2luZydcbiAgICBlbnY6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXBwZW5kIGVudmlyb25tZW50IHZhcmlhYmxlcydcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICByZXN1bHRWaWV3ID0gbmV3IFJlc3VsdFZpZXcoc3RhdGUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgcmVzdWx0VmlldywgJ3Jlc3VsdC12aWV3OmNsb3NlJywgPT4gQGNsb3NlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnY29yZTpjYW5jZWwnLCA9PiBAY2xvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnY29yZTpjbG9zZScsID0+IEBjbG9zZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ21vY2hhLXRlc3QtcnVubmVyOnJ1bic6ID0+IEBydW4oKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbW9jaGEtdGVzdC1ydW5uZXI6ZGVidWcnOiA9PiBAcnVuKHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdtb2NoYS10ZXN0LXJ1bm5lcjpydW4tcHJldmlvdXMnLCA9PiBAcnVuUHJldmlvdXMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbW9jaGEtdGVzdC1ydW5uZXI6ZGVidWctcHJldmlvdXMnLCA9PiBAcnVuUHJldmlvdXModHJ1ZSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBjbG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgcmVzdWx0VmlldyA9IG51bGxcblxuICBzZXJpYWxpemU6IC0+XG4gICAgcmVzdWx0Vmlldy5zZXJpYWxpemUoKVxuXG4gIGNsb3NlOiAtPlxuICAgIGlmIG1vY2hhIHRoZW4gbW9jaGEuc3RvcCgpXG4gICAgcmVzdWx0Vmlldy5kZXRhY2goKVxuICAgIEByZXN1bHRWaWV3UGFuZWw/LmRlc3Ryb3koKVxuXG4gIHJ1bjogKGluRGVidWdNb2RlID0gZmFsc2UpIC0+XG4gICAgZWRpdG9yICAgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgY3VycmVudENvbnRleHQgPSBjb250ZXh0LmZpbmQgZWRpdG9yXG4gICAgQGV4ZWN1dGUoaW5EZWJ1Z01vZGUpXG5cbiAgcnVuUHJldmlvdXM6IChpbkRlYnVnTW9kZSA9IGZhbHNlKSAtPlxuICAgIGlmIGN1cnJlbnRDb250ZXh0XG4gICAgICBAZXhlY3V0ZShpbkRlYnVnTW9kZSlcbiAgICBlbHNlXG4gICAgICBAZGlzcGxheUVycm9yICdObyBwcmV2aW91cyB0ZXN0IHJ1bidcblxuICBleGVjdXRlOiAoaW5EZWJ1Z01vZGUgPSBmYWxzZSkgLT5cblxuICAgIHJlc3VsdFZpZXcucmVzZXQoKVxuICAgIGlmIG5vdCByZXN1bHRWaWV3Lmhhc1BhcmVudCgpXG4gICAgICBAcmVzdWx0Vmlld1BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwgaXRlbTpyZXN1bHRWaWV3XG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ21vY2hhLXRlc3QtcnVubmVyLnNob3dDb250ZXh0SW5mb3JtYXRpb24nXG4gICAgICBub2RlQmluYXJ5ID0gYXRvbS5jb25maWcuZ2V0ICdtb2NoYS10ZXN0LXJ1bm5lci5ub2RlQmluYXJ5UGF0aCdcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIk5vZGUgYmluYXJ5OiAgICAje25vZGVCaW5hcnl9XFxuXCJcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIlJvb3QgZm9sZGVyOiAgICAje2N1cnJlbnRDb250ZXh0LnJvb3R9XFxuXCJcbiAgICAgIHJlc3VsdFZpZXcuYWRkTGluZSBcIlBhdGggdG8gbW9jaGE6ICAje2N1cnJlbnRDb250ZXh0Lm1vY2hhfVxcblwiXG4gICAgICByZXN1bHRWaWV3LmFkZExpbmUgXCJEZWJ1Zy1Nb2RlOiAgICAgI3tpbkRlYnVnTW9kZX1cXG5cIlxuICAgICAgcmVzdWx0Vmlldy5hZGRMaW5lIFwiVGVzdCBmaWxlOiAgICAgICN7Y3VycmVudENvbnRleHQudGVzdH1cXG5cIlxuICAgICAgcmVzdWx0Vmlldy5hZGRMaW5lIFwiU2VsZWN0ZWQgdGVzdDogICN7Y3VycmVudENvbnRleHQuZ3JlcH1cXG5cXG5cIlxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIG1vY2hhICA9IG5ldyBNb2NoYSBjdXJyZW50Q29udGV4dCwgaW5EZWJ1Z01vZGVcblxuICAgIG1vY2hhLm9uICdzdWNjZXNzJywgLT4gcmVzdWx0Vmlldy5zdWNjZXNzKClcbiAgICBtb2NoYS5vbiAnZmFpbHVyZScsIC0+IHJlc3VsdFZpZXcuZmFpbHVyZSgpXG4gICAgbW9jaGEub24gJ3VwZGF0ZVN1bW1hcnknLCAoc3RhdHMpIC0+IHJlc3VsdFZpZXcudXBkYXRlU3VtbWFyeShzdGF0cylcbiAgICBtb2NoYS5vbiAnb3V0cHV0JywgKHRleHQpIC0+IHJlc3VsdFZpZXcuYWRkTGluZSh0ZXh0KVxuICAgIG1vY2hhLm9uICdlcnJvcicsIChlcnIpIC0+XG4gICAgICByZXN1bHRWaWV3LmFkZExpbmUoJ0ZhaWxlZCB0byBydW4gTW9jaGFcXG4nICsgZXJyLm1lc3NhZ2UpXG4gICAgICByZXN1bHRWaWV3LmZhaWx1cmUoKVxuXG4gICAgbW9jaGEucnVuKClcblxuXG4gIGRpc3BsYXlFcnJvcjogKG1lc3NhZ2UpIC0+XG4gICAgcmVzdWx0Vmlldy5yZXNldCgpXG4gICAgcmVzdWx0Vmlldy5hZGRMaW5lIG1lc3NhZ2VcbiAgICByZXN1bHRWaWV3LmZhaWx1cmUoKVxuICAgIGlmIG5vdCByZXN1bHRWaWV3Lmhhc1BhcmVudCgpXG4gICAgICBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCBpdGVtOnJlc3VsdFZpZXdcbiJdfQ==
