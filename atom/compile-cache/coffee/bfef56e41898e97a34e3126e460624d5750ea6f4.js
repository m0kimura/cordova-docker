(function() {
  var $, PATH_REGEX, Point, fs, path;

  fs = require('fs');

  path = require('path');

  Point = require('atom').Point;

  $ = require('atom-space-pen-views').$;

  PATH_REGEX = /((?:\w:)?[^:\s\(\)]+):(\d+):(\d+)/g;

  module.exports.link = function(line) {
    if (line == null) {
      return null;
    }
    return line.replace(PATH_REGEX, '<a class="flink">$&</a>');
  };

  module.exports.attachClickHandler = function() {
    return $(document).on('click', '.flink', module.exports.clicked);
  };

  module.exports.removeClickHandler = function() {
    return $(document).off('click', '.flink', module.exports.clicked);
  };

  module.exports.clicked = function() {
    var extendedPath;
    extendedPath = this.innerHTML;
    return module.exports.open(extendedPath);
  };

  module.exports.open = function(extendedPath) {
    var col, filename, parts, ref, row;
    parts = PATH_REGEX.exec(extendedPath);
    if (parts == null) {
      return;
    }
    ref = parts.slice(1), filename = ref[0], row = ref[1], col = ref[2];
    if (filename == null) {
      return;
    }
    if (!fs.existsSync(filename)) {
      alert("File not found: " + filename);
      return;
    }
    return atom.workspace.open(filename).then(function() {
      var editor, position;
      if (row == null) {
        return;
      }
      row = Math.max(row - 1, 0);
      col = Math.max(~~col - 1, 0);
      position = new Point(row, col);
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      editor.scrollToBufferPosition(position, {
        center: true
      });
      return editor.setCursorBufferPosition(position);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL2xpYi9jbGlja2FibGUtcGF0aHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQVUsT0FBQSxDQUFRLElBQVI7O0VBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxNQUFSOztFQUNULFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1QsSUFBUyxPQUFBLENBQVEsc0JBQVI7O0VBRVYsVUFBQSxHQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixTQUFDLElBQUQ7SUFDcEIsSUFBbUIsWUFBbkI7QUFBQSxhQUFPLEtBQVA7O1dBQ0EsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLEVBQXdCLHlCQUF4QjtFQUZvQjs7RUFLdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBZixHQUFvQyxTQUFBO1dBQ2xDLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsT0FBZixFQUF3QixRQUF4QixFQUFrQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWpEO0VBRGtDOztFQUdwQyxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFmLEdBQW9DLFNBQUE7V0FDbEMsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsT0FBaEIsRUFBeUIsUUFBekIsRUFBbUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFsRDtFQURrQzs7RUFHcEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFmLEdBQXlCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLFlBQUEsR0FBZSxJQUFJLENBQUM7V0FDcEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLENBQW9CLFlBQXBCO0VBRnVCOztFQUt6QixNQUFNLENBQUMsT0FBTyxDQUFDLElBQWYsR0FBc0IsU0FBQyxZQUFEO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsWUFBaEI7SUFDUixJQUFjLGFBQWQ7QUFBQSxhQUFBOztJQUVBLE1BQXFCLEtBQUssQ0FBQyxLQUFOLENBQVksQ0FBWixDQUFyQixFQUFDLGlCQUFELEVBQVUsWUFBVixFQUFjO0lBQ2QsSUFBYyxnQkFBZDtBQUFBLGFBQUE7O0lBRUEsSUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxDQUFQO01BQ0UsS0FBQSxDQUFNLGtCQUFBLEdBQW1CLFFBQXpCO0FBQ0EsYUFGRjs7V0FJQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFBO0FBQ0osVUFBQTtNQUFBLElBQWMsV0FBZDtBQUFBLGVBQUE7O01BR0EsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBQSxHQUFNLENBQWYsRUFBa0IsQ0FBbEI7TUFDTixHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLENBQUMsR0FBRixHQUFRLENBQWpCLEVBQW9CLENBQXBCO01BQ04sUUFBQSxHQUFlLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxHQUFYO01BRWYsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQWMsY0FBZDtBQUFBLGVBQUE7O01BRUEsTUFBTSxDQUFDLHNCQUFQLENBQThCLFFBQTlCLEVBQXdDO1FBQUEsTUFBQSxFQUFPLElBQVA7T0FBeEM7YUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsUUFBL0I7SUFaSSxDQUROO0VBWG9CO0FBdkJ0QiIsInNvdXJjZXNDb250ZW50IjpbImZzICAgICAgPSByZXF1aXJlICdmcydcbnBhdGggICAgPSByZXF1aXJlICdwYXRoJ1xue1BvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG57JH0gICAgID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblBBVEhfUkVHRVggPSAvKCg/OlxcdzopP1teOlxcc1xcKFxcKV0rKTooXFxkKyk6KFxcZCspL2dcblxubW9kdWxlLmV4cG9ydHMubGluayA9IChsaW5lKSAtPlxuICByZXR1cm4gbnVsbCB1bmxlc3MgbGluZT9cbiAgbGluZS5yZXBsYWNlKFBBVEhfUkVHRVgsJzxhIGNsYXNzPVwiZmxpbmtcIj4kJjwvYT4nKVxuXG5cbm1vZHVsZS5leHBvcnRzLmF0dGFjaENsaWNrSGFuZGxlciA9IC0+XG4gICQoZG9jdW1lbnQpLm9uICdjbGljaycsICcuZmxpbmsnLCBtb2R1bGUuZXhwb3J0cy5jbGlja2VkXG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZUNsaWNrSGFuZGxlciA9IC0+XG4gICQoZG9jdW1lbnQpLm9mZiAnY2xpY2snLCAnLmZsaW5rJywgbW9kdWxlLmV4cG9ydHMuY2xpY2tlZFxuXG5tb2R1bGUuZXhwb3J0cy5jbGlja2VkID0gLT5cbiAgZXh0ZW5kZWRQYXRoID0gdGhpcy5pbm5lckhUTUxcbiAgbW9kdWxlLmV4cG9ydHMub3BlbihleHRlbmRlZFBhdGgpXG5cblxubW9kdWxlLmV4cG9ydHMub3BlbiA9IChleHRlbmRlZFBhdGgpIC0+XG4gIHBhcnRzID0gUEFUSF9SRUdFWC5leGVjKGV4dGVuZGVkUGF0aClcbiAgcmV0dXJuIHVubGVzcyBwYXJ0cz9cblxuICBbZmlsZW5hbWUscm93LGNvbF0gPSBwYXJ0cy5zbGljZSgxKVxuICByZXR1cm4gdW5sZXNzIGZpbGVuYW1lP1xuXG4gIHVubGVzcyBmcy5leGlzdHNTeW5jKGZpbGVuYW1lKVxuICAgIGFsZXJ0IFwiRmlsZSBub3QgZm91bmQ6ICN7ZmlsZW5hbWV9XCJcbiAgICByZXR1cm5cblxuICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVuYW1lKVxuICAudGhlbiAtPlxuICAgIHJldHVybiB1bmxlc3Mgcm93P1xuXG4gICAgIyBhbGlnbiBjb29yZGluYXRlcyAwLWluZGV4LWJhc2VkXG4gICAgcm93ID0gTWF0aC5tYXgocm93IC0gMSwgMClcbiAgICBjb2wgPSBNYXRoLm1heCh+fmNvbCAtIDEsIDApXG4gICAgcG9zaXRpb24gPSBuZXcgUG9pbnQocm93LCBjb2wpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cblxuICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvc2l0aW9uLCBjZW50ZXI6dHJ1ZSlcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zaXRpb24pXG4iXX0=
