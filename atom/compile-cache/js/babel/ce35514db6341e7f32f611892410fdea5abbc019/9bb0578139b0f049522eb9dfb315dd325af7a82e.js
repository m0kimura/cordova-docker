Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;

/* global atom */

var _jsdocer = require('./jsdocer');

var _commentContinuer = require('./commentContinuer');

'use babel';

var BETA_KEY = 'atom-easy-jsdoc.beta';
var USE_RETURNS_KEY = 'atom-easy-jsdoc.useReturns';

var regexJsDoc = require('./regex/jsdoc');

/**
 * createComment - Create and insert a JS Doc comment for the comment next to
 * the cursor.
 *
 * @returns {void}
 */
function createComment() {
  var editor = atom.workspace.getActiveTextEditor();
  var code = editor.getText();

  var _editor$getCursorBufferPosition = editor.getCursorBufferPosition();

  var row = _editor$getCursorBufferPosition.row;

  var lineNum = row + 1;

  var _comment = (0, _jsdocer.comment)(code, lineNum, atom.config.get(USE_RETURNS_KEY));

  var content = _comment.content;
  var line = _comment.line;

  if (content && line) {
    editor.setCursorBufferPosition([line - 1, 0]);
    editor.insertText('\n' + content);
  }
}

/**
 * continueComment - Continue comments when entering a new line.
 *
 * @returns {void}
 */
function continueComment() {
  var editor = atom.workspace.getActiveTextEditor();

  var _editor$getCursorBufferPosition2 = editor.getCursorBufferPosition();

  var row = _editor$getCursorBufferPosition2.row;

  var previousLine = editor.lineTextForBufferRow(row - 1);
  var nextLine = (0, _commentContinuer.parse)(previousLine);
  if (nextLine.length > 0) {
    editor.insertText(nextLine);
  }
}

/**
 * activate - Attach the event listeners.
 *
 * @returns {void}
 */

function activate() {
  atom.commands.add('atom-text-editor', {
    'jsdoc:block': function jsdocBlock() {
      if (atom.config.get(BETA_KEY)) {
        createComment();
      } else {
        regexJsDoc.block(atom.config.get(USE_RETURNS_KEY));
      }
    },
    'editor:newline': function editorNewline() {
      if (atom.config.get(BETA_KEY)) {
        continueComment();
      } else {
        regexJsDoc.newline();
      }
    }
  });
}

var betaDescription = ['This is a complete rewrite and uses an abstract syntax tree instead of regular expressions.', 'It adds support for ES 2015 function parameters and exports.', 'More features are coming...'];

var returnsDescription = ['JSDoc could not make a decision as to which to use, @return or @returns so allow both.', 'Eslint valid JSDoc expects @returns so you can enable this here.', 'This will default to true after version 5.'];

var config = {
  useReturns: {
    type: 'boolean',
    'default': false,
    title: 'Use @returns instead of @return',
    description: returnsDescription.join(' ')
  },
  beta: {
    type: 'boolean',
    'default': false,
    title: 'Enable Beta',
    description: betaDescription.join(' ')
  }
};
exports.config = config;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7dUJBR3dCLFdBQVc7O2dDQUNiLG9CQUFvQjs7QUFKMUMsV0FBVyxDQUFDOztBQU1aLElBQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFDO0FBQ3hDLElBQU0sZUFBZSxHQUFHLDRCQUE0QixDQUFDOztBQUVyRCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7Ozs7Ozs7O0FBUTVDLFNBQVMsYUFBYSxHQUFHO0FBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O3dDQUNkLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRTs7TUFBeEMsR0FBRyxtQ0FBSCxHQUFHOztBQUNYLE1BQU0sT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7O2lCQUNFLHNCQUFRLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7O01BQTFFLE9BQU8sWUFBUCxPQUFPO01BQUUsSUFBSSxZQUFKLElBQUk7O0FBQ3JCLE1BQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixVQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBRSxJQUFJLEdBQUcsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsVUFBTSxDQUFDLFVBQVUsUUFBTSxPQUFPLENBQUcsQ0FBQztHQUNuQztDQUNGOzs7Ozs7O0FBT0QsU0FBUyxlQUFlLEdBQUc7QUFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOzt5Q0FDcEMsTUFBTSxDQUFDLHVCQUF1QixFQUFFOztNQUF4QyxHQUFHLG9DQUFILEdBQUc7O0FBQ1gsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxNQUFNLFFBQVEsR0FBRyw2QkFBTSxZQUFZLENBQUMsQ0FBQztBQUNyQyxNQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLFVBQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDN0I7Q0FDRjs7Ozs7Ozs7QUFPTSxTQUFTLFFBQVEsR0FBRztBQUN6QixNQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTtBQUNwQyxpQkFBYSxFQUFFLHNCQUFNO0FBQ25CLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDN0IscUJBQWEsRUFBRSxDQUFDO09BQ2pCLE1BQU07QUFDTCxrQkFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO09BQ3BEO0tBQ0Y7QUFDRCxvQkFBZ0IsRUFBRSx5QkFBTTtBQUN0QixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzdCLHVCQUFlLEVBQUUsQ0FBQztPQUNuQixNQUFNO0FBQ0wsa0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtLQUNGO0dBQ0YsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsSUFBTSxlQUFlLEdBQUcsQ0FDdEIsNkZBQTZGLEVBQzdGLDhEQUE4RCxFQUM5RCw2QkFBNkIsQ0FDOUIsQ0FBQzs7QUFFRixJQUFNLGtCQUFrQixHQUFHLENBQ3pCLHdGQUF3RixFQUN4RixrRUFBa0UsRUFDbEUsNENBQTRDLENBQzdDLENBQUM7O0FBRUssSUFBTSxNQUFNLEdBQUc7QUFDcEIsWUFBVSxFQUFFO0FBQ1YsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsaUNBQWlDO0FBQ3hDLGVBQVcsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0dBQzFDO0FBQ0QsTUFBSSxFQUFFO0FBQ0osUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsYUFBYTtBQUNwQixlQUFXLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7R0FDdkM7Q0FDRixDQUFDIiwiZmlsZSI6Ii9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBnbG9iYWwgYXRvbSAqL1xuXG5pbXBvcnQgeyBjb21tZW50IH0gZnJvbSAnLi9qc2RvY2VyJztcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAnLi9jb21tZW50Q29udGludWVyJztcblxuY29uc3QgQkVUQV9LRVkgPSAnYXRvbS1lYXN5LWpzZG9jLmJldGEnO1xuY29uc3QgVVNFX1JFVFVSTlNfS0VZID0gJ2F0b20tZWFzeS1qc2RvYy51c2VSZXR1cm5zJztcblxuY29uc3QgcmVnZXhKc0RvYyA9IHJlcXVpcmUoJy4vcmVnZXgvanNkb2MnKTtcblxuLyoqXG4gKiBjcmVhdGVDb21tZW50IC0gQ3JlYXRlIGFuZCBpbnNlcnQgYSBKUyBEb2MgY29tbWVudCBmb3IgdGhlIGNvbW1lbnQgbmV4dCB0b1xuICogdGhlIGN1cnNvci5cbiAqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29tbWVudCgpIHtcbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBjb25zdCBjb2RlID0gZWRpdG9yLmdldFRleHQoKTtcbiAgY29uc3QgeyByb3cgfSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICBjb25zdCBsaW5lTnVtID0gcm93ICsgMTtcbiAgY29uc3QgeyBjb250ZW50LCBsaW5lIH0gPSBjb21tZW50KGNvZGUsIGxpbmVOdW0sIGF0b20uY29uZmlnLmdldChVU0VfUkVUVVJOU19LRVkpKTtcbiAgaWYgKGNvbnRlbnQgJiYgbGluZSkge1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbKGxpbmUgLSAxKSwgMF0pO1xuICAgIGVkaXRvci5pbnNlcnRUZXh0KGBcXG4ke2NvbnRlbnR9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBjb250aW51ZUNvbW1lbnQgLSBDb250aW51ZSBjb21tZW50cyB3aGVuIGVudGVyaW5nIGEgbmV3IGxpbmUuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGNvbnRpbnVlQ29tbWVudCgpIHtcbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBjb25zdCB7IHJvdyB9ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gIGNvbnN0IHByZXZpb3VzTGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cgLSAxKTtcbiAgY29uc3QgbmV4dExpbmUgPSBwYXJzZShwcmV2aW91c0xpbmUpO1xuICBpZiAobmV4dExpbmUubGVuZ3RoID4gMCkge1xuICAgIGVkaXRvci5pbnNlcnRUZXh0KG5leHRMaW5lKTtcbiAgfVxufVxuXG4vKipcbiAqIGFjdGl2YXRlIC0gQXR0YWNoIHRoZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgJ2pzZG9jOmJsb2NrJzogKCkgPT4ge1xuICAgICAgaWYgKGF0b20uY29uZmlnLmdldChCRVRBX0tFWSkpIHtcbiAgICAgICAgY3JlYXRlQ29tbWVudCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnZXhKc0RvYy5ibG9jayhhdG9tLmNvbmZpZy5nZXQoVVNFX1JFVFVSTlNfS0VZKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAnZWRpdG9yOm5ld2xpbmUnOiAoKSA9PiB7XG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KEJFVEFfS0VZKSkge1xuICAgICAgICBjb250aW51ZUNvbW1lbnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4SnNEb2MubmV3bGluZSgpO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xufVxuXG5jb25zdCBiZXRhRGVzY3JpcHRpb24gPSBbXG4gICdUaGlzIGlzIGEgY29tcGxldGUgcmV3cml0ZSBhbmQgdXNlcyBhbiBhYnN0cmFjdCBzeW50YXggdHJlZSBpbnN0ZWFkIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMuJyxcbiAgJ0l0IGFkZHMgc3VwcG9ydCBmb3IgRVMgMjAxNSBmdW5jdGlvbiBwYXJhbWV0ZXJzIGFuZCBleHBvcnRzLicsXG4gICdNb3JlIGZlYXR1cmVzIGFyZSBjb21pbmcuLi4nLFxuXTtcblxuY29uc3QgcmV0dXJuc0Rlc2NyaXB0aW9uID0gW1xuICAnSlNEb2MgY291bGQgbm90IG1ha2UgYSBkZWNpc2lvbiBhcyB0byB3aGljaCB0byB1c2UsIEByZXR1cm4gb3IgQHJldHVybnMgc28gYWxsb3cgYm90aC4nLFxuICAnRXNsaW50IHZhbGlkIEpTRG9jIGV4cGVjdHMgQHJldHVybnMgc28geW91IGNhbiBlbmFibGUgdGhpcyBoZXJlLicsXG4gICdUaGlzIHdpbGwgZGVmYXVsdCB0byB0cnVlIGFmdGVyIHZlcnNpb24gNS4nLFxuXTtcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgdXNlUmV0dXJuczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0aXRsZTogJ1VzZSBAcmV0dXJucyBpbnN0ZWFkIG9mIEByZXR1cm4nLFxuICAgIGRlc2NyaXB0aW9uOiByZXR1cm5zRGVzY3JpcHRpb24uam9pbignICcpLFxuICB9LFxuICBiZXRhOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRpdGxlOiAnRW5hYmxlIEJldGEnLFxuICAgIGRlc2NyaXB0aW9uOiBiZXRhRGVzY3JpcHRpb24uam9pbignICcpLFxuICB9LFxufTtcbiJdfQ==