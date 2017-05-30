(function() {
  var extractMatch, getTestName, localeval, path;

  path = require('path');

  localeval = require('localeval');

  exports.fromEditor = function(editor) {
    var line, row, test;
    row = editor.getCursorScreenPosition().row;
    line = editor.lineTextForBufferRow(row);
    test = getTestName(line);
    return test;
  };

  getTestName = function(line) {
    var describe, it, suite, test;
    describe = extractMatch(line, /describe\s*\(?\s*['"](.*)['"]/);
    suite = extractMatch(line, /suite\s*\(?\s*['"](.*)['"]/);
    it = extractMatch(line, /it\s*\(?\s*['"](.*)['"]/);
    test = extractMatch(line, /test\s*\(?\s*['"](.*)['"]/);
    return describe || suite || it || test || null;
  };

  extractMatch = function(line, regex) {
    var matches;
    matches = regex.exec(line);
    if (matches && matches.length >= 2) {
      return localeval("'" + matches[1] + "'");
    } else {
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL2xpYi9zZWxlY3RlZC10ZXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFZLE9BQUEsQ0FBUSxNQUFSOztFQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjs7RUFFWixPQUFPLENBQUMsVUFBUixHQUFxQixTQUFDLE1BQUQ7QUFDbkIsUUFBQTtJQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFnQyxDQUFDO0lBQ3ZDLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUI7SUFDUCxJQUFBLEdBQU8sV0FBQSxDQUFZLElBQVo7QUFDUCxXQUFPO0VBSlk7O0VBTXJCLFdBQUEsR0FBYyxTQUFDLElBQUQ7QUFDWixRQUFBO0lBQUEsUUFBQSxHQUFhLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLCtCQUFuQjtJQUNiLEtBQUEsR0FBYSxZQUFBLENBQWEsSUFBYixFQUFtQiw0QkFBbkI7SUFDYixFQUFBLEdBQWEsWUFBQSxDQUFhLElBQWIsRUFBbUIseUJBQW5CO0lBQ2IsSUFBQSxHQUFhLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLDJCQUFuQjtXQUNiLFFBQUEsSUFBWSxLQUFaLElBQXFCLEVBQXJCLElBQTJCLElBQTNCLElBQW1DO0VBTHZCOztFQU9kLFlBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxLQUFQO0FBQ2IsUUFBQTtJQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7SUFDVixJQUFHLE9BQUEsSUFBWSxPQUFPLENBQUMsTUFBUixJQUFrQixDQUFqQzthQUNFLFNBQUEsQ0FBVSxHQUFBLEdBQUksT0FBUSxDQUFBLENBQUEsQ0FBWixHQUFlLEdBQXpCLEVBREY7S0FBQSxNQUFBO2FBR0UsS0FIRjs7RUFGYTtBQWhCZiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggICAgICA9IHJlcXVpcmUgJ3BhdGgnXG5sb2NhbGV2YWwgPSByZXF1aXJlICdsb2NhbGV2YWwnXG5cbmV4cG9ydHMuZnJvbUVkaXRvciA9IChlZGl0b3IpIC0+XG4gIHJvdyA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnJvd1xuICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICB0ZXN0ID0gZ2V0VGVzdE5hbWUgbGluZVxuICByZXR1cm4gdGVzdFxuXG5nZXRUZXN0TmFtZSA9IChsaW5lKSAtPlxuICBkZXNjcmliZSAgID0gZXh0cmFjdE1hdGNoIGxpbmUsIC9kZXNjcmliZVxccypcXCg/XFxzKlsnXCJdKC4qKVsnXCJdL1xuICBzdWl0ZSAgICAgID0gZXh0cmFjdE1hdGNoIGxpbmUsIC9zdWl0ZVxccypcXCg/XFxzKlsnXCJdKC4qKVsnXCJdL1xuICBpdCAgICAgICAgID0gZXh0cmFjdE1hdGNoIGxpbmUsIC9pdFxccypcXCg/XFxzKlsnXCJdKC4qKVsnXCJdL1xuICB0ZXN0ICAgICAgID0gZXh0cmFjdE1hdGNoIGxpbmUsIC90ZXN0XFxzKlxcKD9cXHMqWydcIl0oLiopWydcIl0vXG4gIGRlc2NyaWJlIG9yIHN1aXRlIG9yIGl0IG9yIHRlc3Qgb3IgbnVsbFxuXG5leHRyYWN0TWF0Y2ggPSAobGluZSwgcmVnZXgpIC0+XG4gIG1hdGNoZXMgPSByZWdleC5leGVjIGxpbmVcbiAgaWYgbWF0Y2hlcyBhbmQgbWF0Y2hlcy5sZW5ndGggPj0gMlxuICAgIGxvY2FsZXZhbCBcIicje21hdGNoZXNbMV19J1wiXG4gIGVsc2VcbiAgICBudWxsXG4iXX0=
