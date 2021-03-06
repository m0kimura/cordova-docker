(function() {
  var $, CompositeDisposable, InputView, OutputViewManager, TextEditorView, View, git, notifier, ref, runCommand,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  runCommand = function(repo, args) {
    var promise, view;
    view = OutputViewManager.create();
    promise = git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    });
    promise.then(function(data) {
      var msg;
      msg = "git " + (args.join(' ')) + " was successful";
      notifier.addSuccess(msg);
      if ((data != null ? data.length : void 0) > 0) {
        view.setContent(data);
      } else {
        view.reset();
      }
      view.finish();
      return git.refresh(repo);
    })["catch"]((function(_this) {
      return function(msg) {
        if ((msg != null ? msg.length : void 0) > 0) {
          view.setContent(msg);
        } else {
          view.reset();
        }
        view.finish();
        return git.refresh(repo);
      };
    })(this));
    return promise;
  };

  InputView = (function(superClass) {
    extend(InputView, superClass);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('commandEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Git command and arguments'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo1) {
      this.repo = repo1;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.commandEditor.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(e) {
            var ref1;
            if ((ref1 = _this.panel) != null) {
              ref1.destroy();
            }
            _this.currentPane.activate();
            return _this.disposables.dispose();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function(e) {
          var ref1;
          _this.disposables.dispose();
          if ((ref1 = _this.panel) != null) {
            ref1.destroy();
          }
          return runCommand(_this.repo, _this.commandEditor.getText().split(' ')).then(function() {
            _this.currentPane.activate();
            return git.refresh(_this.repo);
          });
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = function(repo, args) {
    if (args == null) {
      args = [];
    }
    if (args.length > 0) {
      return runCommand(repo, args.split(' '));
    } else {
      return new InputView(repo);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXJ1bi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBHQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLG1DQUFKLEVBQW9COztFQUVwQixHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFFcEIsVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7SUFDUCxPQUFBLEdBQVUsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7TUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLEVBQStDO01BQUMsS0FBQSxFQUFPLElBQVI7S0FBL0M7SUFDVixPQUFPLENBQUMsSUFBUixDQUFhLFNBQUMsSUFBRDtBQUNYLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBQSxHQUFNLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLENBQUQsQ0FBTixHQUFzQjtNQUM1QixRQUFRLENBQUMsVUFBVCxDQUFvQixHQUFwQjtNQUNBLG9CQUFHLElBQUksQ0FBRSxnQkFBTixHQUFlLENBQWxCO1FBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBSEY7O01BSUEsSUFBSSxDQUFDLE1BQUwsQ0FBQTthQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksSUFBWjtJQVJXLENBQWIsQ0FTQSxFQUFD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ICdhdG9tJ1xueyQsIFRleHRFZGl0b3JWaWV3LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5ydW5Db21tYW5kID0gKHJlcG8sIGFyZ3MpIC0+XG4gIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICBwcm9taXNlID0gZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICBwcm9taXNlLnRoZW4gKGRhdGEpIC0+XG4gICAgbXNnID0gXCJnaXQgI3thcmdzLmpvaW4oJyAnKX0gd2FzIHN1Y2Nlc3NmdWxcIlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MobXNnKVxuICAgIGlmIGRhdGE/Lmxlbmd0aCA+IDBcbiAgICAgIHZpZXcuc2V0Q29udGVudCBkYXRhXG4gICAgZWxzZVxuICAgICAgdmlldy5yZXNldCgpXG4gICAgdmlldy5maW5pc2goKVxuICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgLmNhdGNoIChtc2cpID0+XG4gICAgaWYgbXNnPy5sZW5ndGggPiAwXG4gICAgICB2aWV3LnNldENvbnRlbnQgbXNnXG4gICAgZWxzZVxuICAgICAgdmlldy5yZXNldCgpXG4gICAgdmlldy5maW5pc2goKVxuICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgcmV0dXJuIHByb21pc2VcblxuY2xhc3MgSW5wdXRWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2ID0+XG4gICAgICBAc3VidmlldyAnY29tbWFuZEVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICdHaXQgY29tbWFuZCBhbmQgYXJndW1lbnRzJylcblxuICBpbml0aWFsaXplOiAoQHJlcG8pIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAY29tbWFuZEVkaXRvci5mb2N1cygpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y2FuY2VsJzogKGUpID0+XG4gICAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgICAgQGN1cnJlbnRQYW5lLmFjdGl2YXRlKClcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnY29yZTpjb25maXJtJywgKGUpID0+XG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgICAgcnVuQ29tbWFuZChAcmVwbywgQGNvbW1hbmRFZGl0b3IuZ2V0VGV4dCgpLnNwbGl0KCcgJykpLnRoZW4gPT5cbiAgICAgICAgQGN1cnJlbnRQYW5lLmFjdGl2YXRlKClcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywgYXJncz1bXSkgLT5cbiAgaWYgYXJncy5sZW5ndGggPiAwXG4gICAgcnVuQ29tbWFuZCByZXBvLCBhcmdzLnNwbGl0KCcgJylcbiAgZWxzZVxuICAgIG5ldyBJbnB1dFZpZXcocmVwbylcbiJdfQ==
