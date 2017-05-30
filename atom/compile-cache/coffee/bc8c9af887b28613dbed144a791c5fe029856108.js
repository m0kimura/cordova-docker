(function() {
  var $, Module, NonEditableEditorView, TextEditorView, View, path, ref, removeModuleWrapper,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  Module = require('module');

  path = require('path');

  removeModuleWrapper = function(str) {
    var lines, popItem;
    lines = str.split('\n');
    lines = lines.filter(function(line) {
      if (line === Module.wrapper[0]) {
        return false;
      }
      return true;
    });
    lines = lines.map(function(line) {
      if (line.indexOf(Module.wrapper[0]) >= 0) {
        return line.replace(Module.wrapper[0], '');
      }
      return line;
    });
    popItem = null;
    lines.pop();
    return lines.join('\n');
  };

  module.exports = NonEditableEditorView = (function(superClass) {
    extend(NonEditableEditorView, superClass);

    function NonEditableEditorView() {
      return NonEditableEditorView.__super__.constructor.apply(this, arguments);
    }

    NonEditableEditorView.content = TextEditorView.content;

    NonEditableEditorView.prototype.initialize = function(opts) {
      this.uri = opts.uri, this._debugger = opts._debugger;
      if (opts.script) {
        this.id = opts.script.id;
        this.onDone();
        return this.setText(removeModuleWrapper(script.source));
      }
      if (opts.id) {
        this.id = opts.id;
        this._debugger.getScriptById(this.id).then((function(_this) {
          return function(script) {
            _this.script = script;
            _this.setText(removeModuleWrapper(script.source));
            return _this.onDone();
          };
        })(this)).then((function(_this) {
          return function() {};
        })(this));
      }
      return this.title = opts.query.name;
    };

    NonEditableEditorView.prototype.onDone = function() {
      var extname, grammar;
      extname = path.extname(this.script.name);
      if (extname === '.js') {
        grammar = atom.grammars.grammarForScopeName('source.js');
      } else if (extname === '.coffee') {
        grammar = atom.grammars.grammarForScopeName('source.coffee');
      } else {
        return;
      }
      return this.getModel().setGrammar(grammar);
    };

    NonEditableEditorView.prototype.setCursorBufferPosition = function(opts) {
      return this.getModel().setCursorBufferPosition(opts, {
        autoscroll: true
      });
    };

    NonEditableEditorView.prototype.markBufferPosition = function(opts) {
      return this.getModel().markBufferPosition(opts);
    };

    NonEditableEditorView.prototype.decorateMarker = function(marker, opts) {
      return this.getModel().decorateMarker(marker, opts);
    };

    NonEditableEditorView.prototype.serialize = function() {
      return {
        uri: this.uri,
        id: this.id,
        script: this.script
      };
    };

    NonEditableEditorView.prototype.deserialize = function(state) {
      return new NonEditableEditorView(state);
    };

    NonEditableEditorView.prototype.getTitle = function() {
      return this.title || 'NativeScript';
    };

    NonEditableEditorView.prototype.getUri = function() {
      return this.uri;
    };

    return NonEditableEditorView;

  })(TextEditorView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL25vbi1lZGl0YWJsZS1lZGl0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzRkFBQTtJQUFBOzs7RUFBQSxNQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFELEVBQUksZUFBSixFQUFVOztFQUNWLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsbUJBQUEsR0FBc0IsU0FBQyxHQUFEO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVEsR0FBRyxDQUFDLEtBQUosQ0FBVSxJQUFWO0lBRVIsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBQyxJQUFEO01BQ25CLElBQWdCLElBQUEsS0FBUSxNQUFNLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBdkM7QUFBQSxlQUFPLE1BQVA7O0FBQ0EsYUFBTztJQUZZLENBQWI7SUFJUixLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLElBQUQ7TUFDaEIsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUE1QixDQUFBLElBQW1DLENBQXRDO0FBQ0UsZUFBTyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUE1QixFQUFnQyxFQUFoQyxFQURUOztBQUVBLGFBQU87SUFIUyxDQUFWO0lBS1IsT0FBQSxHQUFVO0lBQ1YsS0FBSyxDQUFDLEdBQU4sQ0FBQTtXQUNBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtFQWRvQjs7RUFnQnRCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixxQkFBQyxDQUFBLE9BQUQsR0FBVSxjQUFjLENBQUM7O29DQUV6QixVQUFBLEdBQVksU0FBQyxJQUFEO01BRVIsSUFBQyxDQUFBLFdBQUEsR0FESCxFQUVFLElBQUMsQ0FBQSxpQkFBQTtNQUdILElBQUksSUFBSSxDQUFDLE1BQVQ7UUFDRSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDbEIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtBQUNBLGVBQU8sSUFBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBQSxDQUFvQixNQUFNLENBQUMsTUFBM0IsQ0FBVCxFQUhUOztNQUtBLElBQUksSUFBSSxDQUFDLEVBQVQ7UUFDRSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUksQ0FBQztRQUNYLElBQUMsQ0FBQSxTQUNDLENBQUMsYUFESCxDQUNpQixJQUFDLENBQUEsRUFEbEIsQ0FFRSxDQUFDLElBRkgsQ0FFUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQ7WUFDSixLQUFDLENBQUEsTUFBRCxHQUFVO1lBQ1YsS0FBQyxDQUFBLE9BQUQsQ0FBUyxtQkFBQSxDQUFvQixNQUFNLENBQUMsTUFBM0IsQ0FBVDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFBO1VBSEk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRlIsQ0FNRSxDQUFDLElBTkgsQ0FNUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBLEdBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlIsRUFGRjs7YUFVQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxLQUFLLENBQUM7SUFyQlY7O29DQXVCWixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQXJCO01BQ1YsSUFBRyxPQUFBLEtBQVcsS0FBZDtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLFdBQWxDLEVBRFo7T0FBQSxNQUVLLElBQUcsT0FBQSxLQUFXLFNBQWQ7UUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxlQUFsQyxFQURQO09BQUEsTUFBQTtBQUdILGVBSEc7O2FBS0wsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsVUFBWixDQUF1QixPQUF2QjtJQVRNOztvQ0FXUix1QkFBQSxHQUF5QixTQUFDLElBQUQ7YUFDdkIsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsdUJBQVosQ0FBb0MsSUFBcEMsRUFBMEM7UUFBQSxVQUFBLEVBQVksSUFBWjtPQUExQztJQUR1Qjs7b0NBR3pCLGtCQUFBLEdBQW9CLFNBQUMsSUFBRDthQUNsQixJQUFDLENBQUEsUUFBRCxDQUFBLENBQVcsQ0FBQyxrQkFBWixDQUErQixJQUEvQjtJQURrQjs7b0NBR3BCLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEVBQVMsSUFBVDthQUNkLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBVyxDQUFDLGNBQVosQ0FBMkIsTUFBM0IsRUFBbUMsSUFBbkM7SUFEYzs7b0NBR2hCLFNBQUEsR0FBVyxTQUFBO2FBQ1Q7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLEdBQU47UUFDQSxFQUFBLEVBQUksSUFBQyxDQUFBLEVBREw7UUFFQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BRlQ7O0lBRFM7O29DQUtYLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxhQUFXLElBQUEscUJBQUEsQ0FBc0IsS0FBdEI7SUFEQTs7b0NBR2IsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsS0FBRCxJQUFVO0lBREY7O29DQUdWLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBO0lBREs7Ozs7S0F6RDBCO0FBckJwQyIsInNvdXJjZXNDb250ZW50IjpbInskLCBWaWV3LCBUZXh0RWRpdG9yVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbk1vZHVsZSA9IHJlcXVpcmUgJ21vZHVsZSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5yZW1vdmVNb2R1bGVXcmFwcGVyID0gKHN0cikgLT5cbiAgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpO1xuXG4gIGxpbmVzID0gbGluZXMuZmlsdGVyIChsaW5lKSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBsaW5lIGlzIE1vZHVsZS53cmFwcGVyWzBdXG4gICAgcmV0dXJuIHRydWVcblxuICBsaW5lcyA9IGxpbmVzLm1hcCAobGluZSkgLT5cbiAgICBpZiBsaW5lLmluZGV4T2YoTW9kdWxlLndyYXBwZXJbMF0pID49IDBcbiAgICAgIHJldHVybiBsaW5lLnJlcGxhY2UoTW9kdWxlLndyYXBwZXJbMF0sICcnKVxuICAgIHJldHVybiBsaW5lXG5cbiAgcG9wSXRlbSA9IG51bGxcbiAgbGluZXMucG9wKClcbiAgbGluZXMuam9pbignXFxuJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTm9uRWRpdGFibGVFZGl0b3JWaWV3IGV4dGVuZHMgVGV4dEVkaXRvclZpZXdcbiAgQGNvbnRlbnQ6IFRleHRFZGl0b3JWaWV3LmNvbnRlbnRcblxuICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICB7XG4gICAgICBAdXJpLFxuICAgICAgQF9kZWJ1Z2dlcixcbiAgICB9ID0gb3B0c1xuXG4gICAgaWYgKG9wdHMuc2NyaXB0KVxuICAgICAgQGlkID0gb3B0cy5zY3JpcHQuaWRcbiAgICAgIEBvbkRvbmUoKVxuICAgICAgcmV0dXJuIEBzZXRUZXh0IHJlbW92ZU1vZHVsZVdyYXBwZXIoc2NyaXB0LnNvdXJjZSlcblxuICAgIGlmIChvcHRzLmlkKVxuICAgICAgQGlkID0gb3B0cy5pZFxuICAgICAgQF9kZWJ1Z2dlclxuICAgICAgICAuZ2V0U2NyaXB0QnlJZChAaWQpXG4gICAgICAgIC50aGVuIChzY3JpcHQpID0+XG4gICAgICAgICAgQHNjcmlwdCA9IHNjcmlwdFxuICAgICAgICAgIEBzZXRUZXh0IHJlbW92ZU1vZHVsZVdyYXBwZXIoc2NyaXB0LnNvdXJjZSlcbiAgICAgICAgICBAb25Eb25lKClcbiAgICAgICAgLnRoZW4gPT5cblxuICAgIEB0aXRsZSA9IG9wdHMucXVlcnkubmFtZVxuXG4gIG9uRG9uZTogLT5cbiAgICBleHRuYW1lID0gcGF0aC5leHRuYW1lKEBzY3JpcHQubmFtZSlcbiAgICBpZiBleHRuYW1lIGlzICcuanMnXG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKCdzb3VyY2UuanMnKVxuICAgIGVsc2UgaWYgZXh0bmFtZSBpcyAnLmNvZmZlZSdcbiAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5jb2ZmZWUnKVxuICAgIGVsc2VcbiAgICAgIHJldHVyblxuXG4gICAgQGdldE1vZGVsKCkuc2V0R3JhbW1hcihncmFtbWFyKVxuXG4gIHNldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAob3B0cyktPlxuICAgIEBnZXRNb2RlbCgpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIG9wdHMsIGF1dG9zY3JvbGw6IHRydWVcblxuICBtYXJrQnVmZmVyUG9zaXRpb246IChvcHRzKSAtPlxuICAgIEBnZXRNb2RlbCgpLm1hcmtCdWZmZXJQb3NpdGlvbihvcHRzKVxuXG4gIGRlY29yYXRlTWFya2VyOiAobWFya2VyLCBvcHRzKSAtPlxuICAgIEBnZXRNb2RlbCgpLmRlY29yYXRlTWFya2VyKG1hcmtlciwgb3B0cylcblxuICBzZXJpYWxpemU6IC0+XG4gICAgdXJpOiBAdXJpXG4gICAgaWQ6IEBpZFxuICAgIHNjcmlwdDogQHNjcmlwdFxuXG4gIGRlc2VyaWFsaXplOiAoc3RhdGUpIC0+XG4gICAgcmV0dXJuIG5ldyBOb25FZGl0YWJsZUVkaXRvclZpZXcoc3RhdGUpXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgQHRpdGxlIG9yICdOYXRpdmVTY3JpcHQnXG5cbiAgZ2V0VXJpOiAtPlxuICAgIEB1cmlcbiJdfQ==
