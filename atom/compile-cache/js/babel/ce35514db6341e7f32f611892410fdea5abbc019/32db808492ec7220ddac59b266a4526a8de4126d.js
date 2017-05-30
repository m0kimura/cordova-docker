Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.comment = comment;

var _jsdocFuncParser = require('./jsdoc/funcParser');

var _jsdocRenderer = require('./jsdoc/renderer');

/**
 * comment - Return JS Doc or empty string for the comment on the node at or
 * one line above the line provided.
 *
 * @param {String} code     Code containing the function.
 * @param {int} [lineNum=1] Line number containing the
 * @param {boolean} [useReturns=false] Use returns style of JSDoc comment
 *
 * @returns {Object|String} Object containing the comment or an empty string.
 */
'use babel';

function comment(code) {
  var lineNum = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var useReturns = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  var desc = (0, _jsdocFuncParser.parse)(code, lineNum);
  if (!desc) {
    return '';
  }
  if (desc.returns) {
    desc.returns = Object.assign(desc.returns, { returns: useReturns });
  }
  var content = (0, _jsdocRenderer.render)(desc);
  var line = desc.location.line;
  return { content: content, line: line };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2pzZG9jZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7K0JBRXNCLG9CQUFvQjs7NkJBQ25CLGtCQUFrQjs7Ozs7Ozs7Ozs7O0FBSHpDLFdBQVcsQ0FBQzs7QUFlTCxTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQW1DO01BQWpDLE9BQU8seURBQUcsQ0FBQztNQUFFLFVBQVUseURBQUcsS0FBSzs7QUFDM0QsTUFBTSxJQUFJLEdBQUcsNEJBQU0sSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxXQUFPLEVBQUUsQ0FBQztHQUNYO0FBQ0QsTUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7R0FDckU7QUFDRCxNQUFNLE9BQU8sR0FBRywyQkFBTyxJQUFJLENBQUMsQ0FBQztBQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUNoQyxTQUFPLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLENBQUM7Q0FDMUIiLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tZWFzeS1qc2RvYy9saWIvanNkb2Nlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJy4vanNkb2MvZnVuY1BhcnNlcic7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL2pzZG9jL3JlbmRlcmVyJztcblxuLyoqXG4gKiBjb21tZW50IC0gUmV0dXJuIEpTIERvYyBvciBlbXB0eSBzdHJpbmcgZm9yIHRoZSBjb21tZW50IG9uIHRoZSBub2RlIGF0IG9yXG4gKiBvbmUgbGluZSBhYm92ZSB0aGUgbGluZSBwcm92aWRlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZSAgICAgQ29kZSBjb250YWluaW5nIHRoZSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7aW50fSBbbGluZU51bT0xXSBMaW5lIG51bWJlciBjb250YWluaW5nIHRoZVxuICogQHBhcmFtIHtib29sZWFufSBbdXNlUmV0dXJucz1mYWxzZV0gVXNlIHJldHVybnMgc3R5bGUgb2YgSlNEb2MgY29tbWVudFxuICpcbiAqIEByZXR1cm5zIHtPYmplY3R8U3RyaW5nfSBPYmplY3QgY29udGFpbmluZyB0aGUgY29tbWVudCBvciBhbiBlbXB0eSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21tZW50KGNvZGUsIGxpbmVOdW0gPSAxLCB1c2VSZXR1cm5zID0gZmFsc2UpIHtcbiAgY29uc3QgZGVzYyA9IHBhcnNlKGNvZGUsIGxpbmVOdW0pO1xuICBpZiAoIWRlc2MpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKGRlc2MucmV0dXJucykge1xuICAgIGRlc2MucmV0dXJucyA9IE9iamVjdC5hc3NpZ24oZGVzYy5yZXR1cm5zLCB7IHJldHVybnM6IHVzZVJldHVybnMgfSk7XG4gIH1cbiAgY29uc3QgY29udGVudCA9IHJlbmRlcihkZXNjKTtcbiAgY29uc3QgbGluZSA9IGRlc2MubG9jYXRpb24ubGluZTtcbiAgcmV0dXJuIHsgY29udGVudCwgbGluZSB9O1xufVxuIl19