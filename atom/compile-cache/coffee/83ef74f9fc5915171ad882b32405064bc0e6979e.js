(function() {
  var Module, NonEditableEditorView, PROTOCOL, Promise, cleanupListener, currentMarker, exists, fs, url;

  Promise = require('bluebird');

  fs = require('fs');

  url = require('url');

  Module = require('module');

  NonEditableEditorView = require('./non-editable-editor');

  PROTOCOL = 'atom-node-debugger://';

  currentMarker = null;

  cleanupListener = null;

  exists = function(path) {
    return new Promise(function(resolve) {
      return fs.exists(path, function(isExisted) {
        return resolve(isExisted);
      });
    });
  };

  module.exports = function(_debugger) {
    atom.workspace.addOpener(function(filename, opts) {
      var parsed;
      parsed = url.parse(filename, true);
      if (parsed.protocol === 'atom-node-debugger:') {
        return new NonEditableEditorView({
          uri: filename,
          id: parsed.host,
          _debugger: _debugger,
          query: opts
        });
      }
    });
    return cleanupListener = _debugger.onBreak(function(breakpoint) {
      var id, ref, script, sourceColumn, sourceLine;
      if (currentMarker != null) {
        currentMarker.destroy();
      }
      sourceLine = breakpoint.sourceLine, sourceColumn = breakpoint.sourceColumn;
      script = breakpoint.script && breakpoint.script.name;
      id = (ref = breakpoint.script) != null ? ref.id : void 0;
      return exists(script).then(function(isExisted) {
        var newSourceName, promise;
        if (isExisted) {
          promise = atom.workspace.open(script, {
            initialLine: sourceLine,
            initialColumn: sourceColumn,
            activatePane: true,
            searchAllPanes: true
          });
        } else {
          if (id == null) {
            return;
          }
          newSourceName = "" + PROTOCOL + id;
          promise = atom.workspace.open(newSourceName, {
            initialColumn: sourceColumn,
            initialLine: sourceLine,
            name: script,
            searchAllPanes: true
          });
        }
        return promise;
      }).then(function(editor) {
        if (editor == null) {
          return;
        }
        currentMarker = editor.markBufferPosition([sourceLine, sourceColumn]);
        return editor.decorateMarker(currentMarker, {
          type: 'line-number',
          "class": 'node-debugger-stop-line'
        });
      });
    });
  };

  module.exports.cleanup = function() {
    if (currentMarker != null) {
      return currentMarker.destroy();
    }
  };

  module.exports.destroy = function() {
    module.exports.cleanup();
    if (cleanupListener != null) {
      return cleanupListener();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL2p1bXAtdG8tYnJlYWtwb2ludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxxQkFBQSxHQUF3QixPQUFBLENBQVEsdUJBQVI7O0VBR3hCLFFBQUEsR0FBVzs7RUFFWCxhQUFBLEdBQWdCOztFQUNoQixlQUFBLEdBQWtCOztFQUVsQixNQUFBLEdBQVMsU0FBQyxJQUFEO1dBQ0gsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFEO2FBQ1YsRUFBRSxDQUFDLE1BQUgsQ0FBVSxJQUFWLEVBQWdCLFNBQUMsU0FBRDtlQUNkLE9BQUEsQ0FBUSxTQUFSO01BRGMsQ0FBaEI7SUFEVSxDQUFSO0VBREc7O0VBS1QsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxTQUFEO0lBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFmLENBQXlCLFNBQUMsUUFBRCxFQUFXLElBQVg7QUFDdkIsVUFBQTtNQUFBLE1BQUEsR0FBUyxHQUFHLENBQUMsS0FBSixDQUFVLFFBQVYsRUFBb0IsSUFBcEI7TUFDVCxJQUFHLE1BQU0sQ0FBQyxRQUFQLEtBQW1CLHFCQUF0QjtBQUNFLGVBQVcsSUFBQSxxQkFBQSxDQUFzQjtVQUMvQixHQUFBLEVBQUssUUFEMEI7VUFFL0IsRUFBQSxFQUFJLE1BQU0sQ0FBQyxJQUZvQjtVQUcvQixTQUFBLEVBQVcsU0FIb0I7VUFJL0IsS0FBQSxFQUFPLElBSndCO1NBQXRCLEVBRGI7O0lBRnVCLENBQXpCO1dBVUEsZUFBQSxHQUFrQixTQUFTLENBQUMsT0FBVixDQUFrQixTQUFDLFVBQUQ7QUFDbEMsVUFBQTtNQUFBLElBQTJCLHFCQUEzQjtRQUFBLGFBQWEsQ0FBQyxPQUFkLENBQUEsRUFBQTs7TUFDQyxrQ0FBRCxFQUFhO01BQ2IsTUFBQSxHQUFTLFVBQVUsQ0FBQyxNQUFYLElBQXNCLFVBQVUsQ0FBQyxNQUFNLENBQUM7TUFDakQsRUFBQSwwQ0FBc0IsQ0FBRTthQUN4QixNQUFBLENBQU8sTUFBUCxDQUNFLENBQUMsSUFESCxDQUNRLFNBQUMsU0FBRDtBQUNKLFlBQUE7UUFBQSxJQUFHLFNBQUg7VUFDRSxPQUFBLEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLE1BQXBCLEVBQTRCO1lBQ3BDLFdBQUEsRUFBYSxVQUR1QjtZQUVwQyxhQUFBLEVBQWUsWUFGcUI7WUFHcEMsWUFBQSxFQUFjLElBSHNCO1lBSXBDLGNBQUEsRUFBZ0IsSUFKb0I7V0FBNUIsRUFEWjtTQUFBLE1BQUE7VUFRRSxJQUFjLFVBQWQ7QUFBQSxtQkFBQTs7VUFDQSxhQUFBLEdBQWdCLEVBQUEsR0FBRyxRQUFILEdBQWM7VUFDOUIsT0FBQSxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixhQUFwQixFQUFtQztZQUMzQyxhQUFBLEVBQWUsWUFENEI7WUFFM0MsV0FBQSxFQUFhLFVBRjhCO1lBRzNDLElBQUEsRUFBTSxNQUhxQztZQUkzQyxjQUFBLEVBQWdCLElBSjJCO1dBQW5DLEVBVlo7O0FBaUJBLGVBQU87TUFsQkgsQ0FEUixDQXFCRSxDQUFDLElBckJILENBcUJRLFNBQUMsTUFBRDtRQUNKLElBQWMsY0FBZDtBQUFBLGlCQUFBOztRQUNBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLGtCQUFQLENBQTBCLENBQ3hDLFVBRHdDLEVBQzVCLFlBRDRCLENBQTFCO2VBR2hCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGFBQXRCLEVBQXFDO1VBQ25DLElBQUEsRUFBTSxhQUQ2QjtVQUVuQyxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlCQUY0QjtTQUFyQztNQUxJLENBckJSO0lBTGtDLENBQWxCO0VBWEg7O0VBK0NqQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWYsR0FBeUIsU0FBQTtJQUN2QixJQUEyQixxQkFBM0I7YUFBQSxhQUFhLENBQUMsT0FBZCxDQUFBLEVBQUE7O0VBRHVCOztFQUd6QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWYsR0FBeUIsU0FBQTtJQUN2QixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWYsQ0FBQTtJQUNBLElBQXFCLHVCQUFyQjthQUFBLGVBQUEsQ0FBQSxFQUFBOztFQUZ1QjtBQW5FekIiLCJzb3VyY2VzQ29udGVudCI6WyJQcm9taXNlID0gcmVxdWlyZSAnYmx1ZWJpcmQnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xudXJsID0gcmVxdWlyZSAndXJsJ1xuTW9kdWxlID0gcmVxdWlyZSAnbW9kdWxlJ1xuTm9uRWRpdGFibGVFZGl0b3JWaWV3ID0gcmVxdWlyZSAnLi9ub24tZWRpdGFibGUtZWRpdG9yJ1xuXG5cblBST1RPQ09MID0gJ2F0b20tbm9kZS1kZWJ1Z2dlcjovLydcblxuY3VycmVudE1hcmtlciA9IG51bGxcbmNsZWFudXBMaXN0ZW5lciA9IG51bGxcblxuZXhpc3RzID0gKHBhdGgpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgIGZzLmV4aXN0cyBwYXRoLCAoaXNFeGlzdGVkKSAtPlxuICAgICAgcmVzb2x2ZShpc0V4aXN0ZWQpXG5cbm1vZHVsZS5leHBvcnRzID0gKF9kZWJ1Z2dlcikgLT5cbiAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyIChmaWxlbmFtZSwgb3B0cykgLT5cbiAgICBwYXJzZWQgPSB1cmwucGFyc2UoZmlsZW5hbWUsIHRydWUpXG4gICAgaWYgcGFyc2VkLnByb3RvY29sIGlzICdhdG9tLW5vZGUtZGVidWdnZXI6J1xuICAgICAgcmV0dXJuIG5ldyBOb25FZGl0YWJsZUVkaXRvclZpZXcoe1xuICAgICAgICB1cmk6IGZpbGVuYW1lXG4gICAgICAgIGlkOiBwYXJzZWQuaG9zdFxuICAgICAgICBfZGVidWdnZXI6IF9kZWJ1Z2dlclxuICAgICAgICBxdWVyeTogb3B0c1xuICAgICAgfSlcblxuICBjbGVhbnVwTGlzdGVuZXIgPSBfZGVidWdnZXIub25CcmVhayAoYnJlYWtwb2ludCkgLT5cbiAgICBjdXJyZW50TWFya2VyLmRlc3Ryb3koKSBpZiBjdXJyZW50TWFya2VyP1xuICAgIHtzb3VyY2VMaW5lLCBzb3VyY2VDb2x1bW59ID0gYnJlYWtwb2ludFxuICAgIHNjcmlwdCA9IGJyZWFrcG9pbnQuc2NyaXB0IGFuZCBicmVha3BvaW50LnNjcmlwdC5uYW1lXG4gICAgaWQgPSBicmVha3BvaW50LnNjcmlwdD8uaWRcbiAgICBleGlzdHMoc2NyaXB0KVxuICAgICAgLnRoZW4gKGlzRXhpc3RlZCktPlxuICAgICAgICBpZiBpc0V4aXN0ZWRcbiAgICAgICAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbihzY3JpcHQsIHtcbiAgICAgICAgICAgIGluaXRpYWxMaW5lOiBzb3VyY2VMaW5lXG4gICAgICAgICAgICBpbml0aWFsQ29sdW1uOiBzb3VyY2VDb2x1bW5cbiAgICAgICAgICAgIGFjdGl2YXRlUGFuZTogdHJ1ZVxuICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIGlmIG5vdCBpZD9cbiAgICAgICAgICBuZXdTb3VyY2VOYW1lID0gXCIje1BST1RPQ09MfSN7aWR9XCJcbiAgICAgICAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbihuZXdTb3VyY2VOYW1lLCB7XG4gICAgICAgICAgICBpbml0aWFsQ29sdW1uOiBzb3VyY2VDb2x1bW5cbiAgICAgICAgICAgIGluaXRpYWxMaW5lOiBzb3VyY2VMaW5lXG4gICAgICAgICAgICBuYW1lOiBzY3JpcHRcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gcHJvbWlzZVxuXG4gICAgICAudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgICByZXR1cm4gaWYgbm90IGVkaXRvcj9cbiAgICAgICAgY3VycmVudE1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW1xuICAgICAgICAgIHNvdXJjZUxpbmUsIHNvdXJjZUNvbHVtblxuICAgICAgICBdKVxuICAgICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoY3VycmVudE1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdsaW5lLW51bWJlcidcbiAgICAgICAgICBjbGFzczogJ25vZGUtZGVidWdnZXItc3RvcC1saW5lJ1xuICAgICAgICB9KVxuXG5tb2R1bGUuZXhwb3J0cy5jbGVhbnVwID0gLT5cbiAgY3VycmVudE1hcmtlci5kZXN0cm95KCkgaWYgY3VycmVudE1hcmtlcj9cblxubW9kdWxlLmV4cG9ydHMuZGVzdHJveSA9IC0+XG4gIG1vZHVsZS5leHBvcnRzLmNsZWFudXAoKVxuICBjbGVhbnVwTGlzdGVuZXIoKSBpZiBjbGVhbnVwTGlzdGVuZXI/XG4iXX0=
