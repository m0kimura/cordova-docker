(function() {
  var closestPackage, fs, isWindows, path, selectedTest, util;

  fs = require('fs');

  path = require('path');

  util = require('util');

  selectedTest = require('./selected-test');

  isWindows = /^win/.test(process.platform);

  exports.find = function(editor) {
    var mochaBinary, mochaCommand, root;
    root = closestPackage(editor.getPath());
    if (root) {
      mochaCommand = isWindows ? 'mocha.cmd' : 'mocha';
      mochaBinary = path.join(root, 'node_modules', '.bin', mochaCommand);
      if (!fs.existsSync(mochaBinary)) {
        mochaBinary = 'mocha';
      }
      return {
        root: root,
        test: path.relative(root, editor.getPath()),
        grep: selectedTest.fromEditor(editor),
        mocha: mochaBinary
      };
    } else {
      return {
        root: path.dirname(editor.getPath()),
        test: path.basename(editor.getPath()),
        grep: selectedTest.fromEditor(editor),
        mocha: 'mocha'
      };
    }
  };

  closestPackage = function(folder) {
    var pkg;
    pkg = path.join(folder, 'package.json');
    if (fs.existsSync(pkg)) {
      return folder;
    } else if (folder === '/') {
      return null;
    } else {
      return closestPackage(path.dirname(folder));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL2xpYi9jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSOztFQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixTQUFBLEdBQVksTUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBTyxDQUFDLFFBQXhCOztFQUVaLE9BQU8sQ0FBQyxJQUFSLEdBQWUsU0FBQyxNQUFEO0FBQ2IsUUFBQTtJQUFBLElBQUEsR0FBTyxjQUFBLENBQWUsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFmO0lBQ1AsSUFBRyxJQUFIO01BQ0UsWUFBQSxHQUFrQixTQUFILEdBQWtCLFdBQWxCLEdBQW1DO01BQ2xELFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBZ0IsY0FBaEIsRUFBZ0MsTUFBaEMsRUFBd0MsWUFBeEM7TUFDZCxJQUFHLENBQUksRUFBRSxDQUFDLFVBQUgsQ0FBYyxXQUFkLENBQVA7UUFDRSxXQUFBLEdBQWMsUUFEaEI7O2FBRUE7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLElBQUEsRUFBTSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsRUFBb0IsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFwQixDQUROO1FBRUEsSUFBQSxFQUFNLFlBQVksQ0FBQyxVQUFiLENBQXdCLE1BQXhCLENBRk47UUFHQSxLQUFBLEVBQU8sV0FIUDtRQUxGO0tBQUEsTUFBQTthQVVFO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFiLENBQU47UUFDQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWQsQ0FETjtRQUVBLElBQUEsRUFBTSxZQUFZLENBQUMsVUFBYixDQUF3QixNQUF4QixDQUZOO1FBR0EsS0FBQSxFQUFPLE9BSFA7UUFWRjs7RUFGYTs7RUFpQmYsY0FBQSxHQUFpQixTQUFDLE1BQUQ7QUFDZixRQUFBO0lBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFrQixjQUFsQjtJQUNOLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxHQUFkLENBQUg7YUFDRSxPQURGO0tBQUEsTUFFSyxJQUFHLE1BQUEsS0FBVSxHQUFiO2FBQ0gsS0FERztLQUFBLE1BQUE7YUFHSCxjQUFBLENBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQWYsRUFIRzs7RUFKVTtBQXZCakIiLCJzb3VyY2VzQ29udGVudCI6WyJmcyAgID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnV0aWwgPSByZXF1aXJlICd1dGlsJ1xuc2VsZWN0ZWRUZXN0ID0gcmVxdWlyZSAnLi9zZWxlY3RlZC10ZXN0J1xuaXNXaW5kb3dzID0gLy8vXndpbi8vLy50ZXN0IHByb2Nlc3MucGxhdGZvcm1cblxuZXhwb3J0cy5maW5kID0gKGVkaXRvcikgLT5cbiAgcm9vdCA9IGNsb3Nlc3RQYWNrYWdlIGVkaXRvci5nZXRQYXRoKClcbiAgaWYgcm9vdFxuICAgIG1vY2hhQ29tbWFuZCA9IGlmIGlzV2luZG93cyB0aGVuICdtb2NoYS5jbWQnIGVsc2UgJ21vY2hhJ1xuICAgIG1vY2hhQmluYXJ5ID0gcGF0aC5qb2luIHJvb3QsICdub2RlX21vZHVsZXMnLCAnLmJpbicsIG1vY2hhQ29tbWFuZFxuICAgIGlmIG5vdCBmcy5leGlzdHNTeW5jIG1vY2hhQmluYXJ5XG4gICAgICBtb2NoYUJpbmFyeSA9ICdtb2NoYSdcbiAgICByb290OiByb290XG4gICAgdGVzdDogcGF0aC5yZWxhdGl2ZSByb290LCBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgZ3JlcDogc2VsZWN0ZWRUZXN0LmZyb21FZGl0b3IgZWRpdG9yXG4gICAgbW9jaGE6IG1vY2hhQmluYXJ5XG4gIGVsc2VcbiAgICByb290OiBwYXRoLmRpcm5hbWUgZWRpdG9yLmdldFBhdGgoKVxuICAgIHRlc3Q6IHBhdGguYmFzZW5hbWUgZWRpdG9yLmdldFBhdGgoKVxuICAgIGdyZXA6IHNlbGVjdGVkVGVzdC5mcm9tRWRpdG9yIGVkaXRvclxuICAgIG1vY2hhOiAnbW9jaGEnXG5cbmNsb3Nlc3RQYWNrYWdlID0gKGZvbGRlcikgLT5cbiAgcGtnID0gcGF0aC5qb2luIGZvbGRlciwgJ3BhY2thZ2UuanNvbidcbiAgaWYgZnMuZXhpc3RzU3luYyBwa2dcbiAgICBmb2xkZXJcbiAgZWxzZSBpZiBmb2xkZXIgaXMgJy8nXG4gICAgbnVsbFxuICBlbHNlXG4gICAgY2xvc2VzdFBhY2thZ2UgcGF0aC5kaXJuYW1lKGZvbGRlcilcbiJdfQ==
