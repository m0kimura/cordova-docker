'use babel';

/* eslint-disable no-use-before-define, quote-props */
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.render = render;
var CONTENT_BUILDERS = {
  'function': renderFuncContent,
  'classMethod': renderFuncContent,
  'class': renderClassContent
};
/* eslint-enable */
var OPEN = '/**';
var SPACER = ' *';
var CLOSE = ' */';
var LINE_PADDER = ' ';

/**
 * padString - Increase length of string to the defined length padding the right
 * side.
 *
 * @param {String} str    String to pad
 * @param {Number} length Length to increase it to
 *
 * @return {String} String padded to the correct length
 */
function padString(str, length) {
  var padding = ' '.repeat(length - str.length);
  return '' + str + padding;
}

/**
 * renderNameLine - description
 *
 * @param  {Object} structure Object describing the JS Doc
 * @return {String}           Name line for the JSDoc
 */
function renderNameLine(structure) {
  var name = structure.name;
  var type = structure.type;
  var _structure$description = structure.description;
  var description = _structure$description === undefined ? 'Description' : _structure$description;
  var isStatic = structure.isStatic;

  var nameLine = ' * ' + name + ' - ' + description;
  if (type === 'classMethod' && isStatic) {
    nameLine = ' * @static ' + name + ' - ' + description;
  }
  return nameLine;
}

/**
 * renderParam - Render a function parameter as a param property.
 *
 * @param {Number} nameLength     Max name length of the parameters
 * @param {Number} typeLength     Max type length of the parameters
 * @param {Object} Parameter      Object representing the parameters
 * @param {String} Parameter.name Name of the parameter
 * @param {String} Parameter.type Type of the parameter
 *
 * @return {type} Description
 */
function renderParam(nameLength, typeLength, _ref) {
  var name = _ref.name;
  var type = _ref.type;

  var paddedName = padString(name, nameLength);
  var paddedType = padString('' + type, typeLength);
  return ' * @param ' + paddedType + ' ' + paddedName + ' Description';
}

/**
 * sortNum - Comparison of numbers for sorting.
 *
 * @param {int} a First number
 * @param {int} b Second number
 *
 * @returns {int} A negative value if a less than b, a positive if b is less
 * than a and 0 if they are the same.
 */
function sortNum(a, b) {
  return a - b;
}

/**
 * maxPropertyLength - Get the max length of a property from a list of objects.
 *
 * @param {Array}  arr      List of objects
 * @param {String} propName Property name in each of the objects
 *
 * @return {Number} Max length of the property in the array of objects.
 */
function maxPropertyLength(arr, propName) {
  return arr.map(function (obj) {
    return (obj[propName] || '').length;
  }).sort(sortNum).reverse()[0];
}

/**
 * jsdocifyParams - Simplify the param object structure. JS Doc uses param name
 * to hold default value and parent values.
 *
 * @param {Array} params List of parameters
 *
 * @return {Array} Simple parameter objects with name and type.
 */
function jsdocifyParams(params) {
  return params.map(function (_ref2) {
    var _ref2$type = _ref2.type;
    var type = _ref2$type === undefined ? 'type' : _ref2$type;
    var name = _ref2.name;
    var defaultValue = _ref2.defaultValue;
    var parent = _ref2.parent;

    var tidiedName = name;
    if (parent) {
      tidiedName = parent + '.' + tidiedName;
    }
    if (typeof defaultValue !== 'undefined') {
      tidiedName = '[' + tidiedName + '=' + defaultValue + ']';
    }

    return {
      type: '{' + type + '}',
      name: tidiedName
    };
  });
}

/**
 * renderParams - Render the params array as JS Doc params
 *
 * @param {Array} funcParams List of function parameters
 *
 * @return {Array} List of string lines representing function parameters
 */
function renderParams(funcParams) {
  var jsdocParams = jsdocifyParams(funcParams);

  var maxNameLength = maxPropertyLength(jsdocParams, 'name');
  var maxTypeLength = maxPropertyLength(jsdocParams, 'type');

  return jsdocParams.map(renderParam.bind(null, maxNameLength, maxTypeLength));
}

/**
 * renderFuncContent - Take the JS Doc description and extract the function
 * specific properties to add to the JS Doc.
 *
 * @param {object} structure              Object describing the JS Doc
 * @param {array}  [structure.params=[]]  The function parameters
 * @param {object} [structure.returns={}] The function return properties
 *
 * @return {array} List of lines to make up the function content of the JS Doc.
 */
function renderFuncContent(_ref3) {
  var _ref3$params = _ref3.params;
  var params = _ref3$params === undefined ? [] : _ref3$params;
  var _ref3$returns = _ref3.returns;
  var returns = _ref3$returns === undefined ? {} : _ref3$returns;

  var content = [];
  content.push(SPACER);

  var renderedParams = renderParams(params);
  for (var i = 0; i < renderedParams.length; i++) {
    content.push(renderedParams[i]);
  }
  if (renderedParams.length > 0) {
    content.push(SPACER);
  }
  var returnKeyword = returns.returns ? 'returns' : 'return';
  var returnLine = ' * @' + returnKeyword + ' {type} Description';

  content.push(returnLine);
  return content;
}

/**
 * renderClassContent - Take the JS Doc description and extract the class
 * specific properties to add to the JS Doc.
 *
 * @param {object} structure Object describing the JS Doc
 *
 * @return {array} List of lines to make up the class content of the JS Doc.
 */
function renderClassContent(structure) {
  var content = [];

  var ext = structure['extends'];
  if (ext) {
    content.push(' * @extends ' + ext);
  }
  return content;
}

/**
 * render - Take a structure describing a function and render the JS Doc to
 * represent it.
 *
 * @param {Object} structure Complete structure
 *
 * @return {String} JS Doc comment
 */

function render(structure) {
  var type = structure.type;
  var _structure$location = structure.location;
  var location = _structure$location === undefined ? {} : _structure$location;

  var nameLine = renderNameLine(structure);
  var header = [OPEN];
  var footer = [CLOSE];

  var contentBuilder = CONTENT_BUILDERS[type];
  if (!contentBuilder) {
    throw new Error('Unknown JS Doc type: ' + type);
  }
  var content = [nameLine].concat(contentBuilder(structure));

  var lines = header.concat(content).concat(footer);

  var _location$column = location.column;
  var column = _location$column === undefined ? 0 : _location$column;

  var indentation = LINE_PADDER.repeat(column);

  return lines.map(function (line) {
    return '' + indentation + line;
  }).join('\n');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2pzZG9jL3JlbmRlcmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7OztBQUdaLElBQU0sZ0JBQWdCLEdBQUc7QUFDdkIsWUFBVSxFQUFFLGlCQUFpQjtBQUM3QixlQUFhLEVBQUUsaUJBQWlCO0FBQ2hDLFNBQU8sRUFBRSxrQkFBa0I7Q0FDNUIsQ0FBQzs7QUFFRixJQUFNLElBQUksR0FBRyxLQUFLLENBQUM7QUFDbkIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNwQixJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUM7Ozs7Ozs7Ozs7O0FBWXhCLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDOUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELGNBQVUsR0FBRyxHQUFHLE9BQU8sQ0FBRztDQUMzQjs7Ozs7Ozs7QUFRRCxTQUFTLGNBQWMsQ0FBQyxTQUFTLEVBQUU7TUFDekIsSUFBSSxHQUFrRCxTQUFTLENBQS9ELElBQUk7TUFBRSxJQUFJLEdBQTRDLFNBQVMsQ0FBekQsSUFBSTsrQkFBNEMsU0FBUyxDQUFuRCxXQUFXO01BQVgsV0FBVywwQ0FBRyxhQUFhO01BQUUsUUFBUSxHQUFLLFNBQVMsQ0FBdEIsUUFBUTs7QUFDekQsTUFBSSxRQUFRLFdBQVMsSUFBSSxXQUFNLFdBQVcsQUFBRSxDQUFDO0FBQzdDLE1BQUksSUFBSSxLQUFLLGFBQWEsSUFBSSxRQUFRLEVBQUU7QUFDdEMsWUFBUSxtQkFBaUIsSUFBSSxXQUFNLFdBQVcsQUFBRSxDQUFDO0dBQ2xEO0FBQ0QsU0FBTyxRQUFRLENBQUM7Q0FDakI7Ozs7Ozs7Ozs7Ozs7QUFhRCxTQUFTLFdBQVcsQ0FBQyxV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LENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O3lCQUU3QixRQUFRLENBQXZCLE1BQU07TUFBTixNQUFNLG9DQUFHLENBQUM7O0FBQ2xCLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRS9DLFNBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUk7Z0JBQVEsV0FBVyxHQUFHLElBQUk7R0FBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2hFIiwiZmlsZSI6Ii9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2pzZG9jL3JlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZS1iZWZvcmUtZGVmaW5lLCBxdW90ZS1wcm9wcyAqL1xuY29uc3QgQ09OVEVOVF9CVUlMREVSUyA9IHtcbiAgJ2Z1bmN0aW9uJzogcmVuZGVyRnVuY0NvbnRlbnQsXG4gICdjbGFzc01ldGhvZCc6IHJlbmRlckZ1bmNDb250ZW50LFxuICAnY2xhc3MnOiByZW5kZXJDbGFzc0NvbnRlbnQsXG59O1xuLyogZXNsaW50LWVuYWJsZSAqL1xuY29uc3QgT1BFTiA9ICcvKionO1xuY29uc3QgU1BBQ0VSID0gJyAqJztcbmNvbnN0IENMT1NFID0gJyAqLyc7XG5jb25zdCBMSU5FX1BBRERFUiA9ICcgJztcblxuXG4vKipcbiAqIHBhZFN0cmluZyAtIEluY3JlYXNlIGxlbmd0aCBvZiBzdHJpbmcgdG8gdGhlIGRlZmluZWQgbGVuZ3RoIHBhZGRpbmcgdGhlIHJpZ2h0XG4gKiBzaWRlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgICAgU3RyaW5nIHRvIHBhZFxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCBMZW5ndGggdG8gaW5jcmVhc2UgaXQgdG9cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFN0cmluZyBwYWRkZWQgdG8gdGhlIGNvcnJlY3QgbGVuZ3RoXG4gKi9cbmZ1bmN0aW9uIHBhZFN0cmluZyhzdHIsIGxlbmd0aCkge1xuICBjb25zdCBwYWRkaW5nID0gJyAnLnJlcGVhdChsZW5ndGggLSBzdHIubGVuZ3RoKTtcbiAgcmV0dXJuIGAke3N0cn0ke3BhZGRpbmd9YDtcbn1cblxuLyoqXG4gKiByZW5kZXJOYW1lTGluZSAtIGRlc2NyaXB0aW9uXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBzdHJ1Y3R1cmUgT2JqZWN0IGRlc2NyaWJpbmcgdGhlIEpTIERvY1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgTmFtZSBsaW5lIGZvciB0aGUgSlNEb2NcbiAqL1xuZnVuY3Rpb24gcmVuZGVyTmFtZUxpbmUoc3RydWN0dXJlKSB7XG4gIGNvbnN0IHsgbmFtZSwgdHlwZSwgZGVzY3JpcHRpb24gPSAnRGVzY3JpcHRpb24nLCBpc1N0YXRpYyB9ID0gc3RydWN0dXJlO1xuICBsZXQgbmFtZUxpbmUgPSBgICogJHtuYW1lfSAtICR7ZGVzY3JpcHRpb259YDtcbiAgaWYgKHR5cGUgPT09ICdjbGFzc01ldGhvZCcgJiYgaXNTdGF0aWMpIHtcbiAgICBuYW1lTGluZSA9IGAgKiBAc3RhdGljICR7bmFtZX0gLSAke2Rlc2NyaXB0aW9ufWA7XG4gIH1cbiAgcmV0dXJuIG5hbWVMaW5lO1xufVxuXG4vKipcbiAqIHJlbmRlclBhcmFtIC0gUmVuZGVyIGEgZnVuY3Rpb24gcGFyYW1ldGVyIGFzIGEgcGFyYW0gcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5hbWVMZW5ndGggICAgIE1heCBuYW1lIGxlbmd0aCBvZiB0aGUgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtOdW1iZXJ9IHR5cGVMZW5ndGggICAgIE1heCB0eXBlIGxlbmd0aCBvZiB0aGUgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtPYmplY3R9IFBhcmFtZXRlciAgICAgIE9iamVjdCByZXByZXNlbnRpbmcgdGhlIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBQYXJhbWV0ZXIubmFtZSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBQYXJhbWV0ZXIudHlwZSBUeXBlIG9mIHRoZSBwYXJhbWV0ZXJcbiAqXG4gKiBAcmV0dXJuIHt0eXBlfSBEZXNjcmlwdGlvblxuICovXG5mdW5jdGlvbiByZW5kZXJQYXJhbShuYW1lTGVuZ3RoLCB0eXBlTGVuZ3RoLCB7IG5hbWUsIHR5cGUgfSkge1xuICBjb25zdCBwYWRkZWROYW1lID0gcGFkU3RyaW5nKG5hbWUsIG5hbWVMZW5ndGgpO1xuICBjb25zdCBwYWRkZWRUeXBlID0gcGFkU3RyaW5nKGAke3R5cGV9YCwgdHlwZUxlbmd0aCk7XG4gIHJldHVybiBgICogQHBhcmFtICR7cGFkZGVkVHlwZX0gJHtwYWRkZWROYW1lfSBEZXNjcmlwdGlvbmA7XG59XG5cbi8qKlxuICogc29ydE51bSAtIENvbXBhcmlzb24gb2YgbnVtYmVycyBmb3Igc29ydGluZy5cbiAqXG4gKiBAcGFyYW0ge2ludH0gYSBGaXJzdCBudW1iZXJcbiAqIEBwYXJhbSB7aW50fSBiIFNlY29uZCBudW1iZXJcbiAqXG4gKiBAcmV0dXJucyB7aW50fSBBIG5lZ2F0aXZlIHZhbHVlIGlmIGEgbGVzcyB0aGFuIGIsIGEgcG9zaXRpdmUgaWYgYiBpcyBsZXNzXG4gKiB0aGFuIGEgYW5kIDAgaWYgdGhleSBhcmUgdGhlIHNhbWUuXG4gKi9cbmZ1bmN0aW9uIHNvcnROdW0oYSwgYikge1xuICByZXR1cm4gYSAtIGI7XG59XG5cbi8qKlxuICogbWF4UHJvcGVydHlMZW5ndGggLSBHZXQgdGhlIG1heCBsZW5ndGggb2YgYSBwcm9wZXJ0eSBmcm9tIGEgbGlzdCBvZiBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9ICBhcnIgICAgICBMaXN0IG9mIG9iamVjdHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wTmFtZSBQcm9wZXJ0eSBuYW1lIGluIGVhY2ggb2YgdGhlIG9iamVjdHNcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE1heCBsZW5ndGggb2YgdGhlIHByb3BlcnR5IGluIHRoZSBhcnJheSBvZiBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBtYXhQcm9wZXJ0eUxlbmd0aChhcnIsIHByb3BOYW1lKSB7XG4gIHJldHVybiBhcnJcbiAgICAubWFwKG9iaiA9PiAob2JqW3Byb3BOYW1lXSB8fCAnJykubGVuZ3RoKVxuICAgIC5zb3J0KHNvcnROdW0pXG4gICAgLnJldmVyc2UoKVswXTtcbn1cblxuLyoqXG4gKiBqc2RvY2lmeVBhcmFtcyAtIFNpbXBsaWZ5IHRoZSBwYXJhbSBvYmplY3Qgc3RydWN0dXJlLiBKUyBEb2MgdXNlcyBwYXJhbSBuYW1lXG4gKiB0byBob2xkIGRlZmF1bHQgdmFsdWUgYW5kIHBhcmVudCB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGFyYW1zIExpc3Qgb2YgcGFyYW1ldGVyc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBTaW1wbGUgcGFyYW1ldGVyIG9iamVjdHMgd2l0aCBuYW1lIGFuZCB0eXBlLlxuICovXG5mdW5jdGlvbiBqc2RvY2lmeVBhcmFtcyhwYXJhbXMpIHtcbiAgcmV0dXJuIHBhcmFtcy5tYXAoKHsgdHlwZSA9ICd0eXBlJywgbmFtZSwgZGVmYXVsdFZhbHVlLCBwYXJlbnQgfSkgPT4ge1xuICAgIGxldCB0aWRpZWROYW1lID0gbmFtZTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB0aWRpZWROYW1lID0gYCR7cGFyZW50fS4ke3RpZGllZE5hbWV9YDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBkZWZhdWx0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aWRpZWROYW1lID0gYFske3RpZGllZE5hbWV9PSR7ZGVmYXVsdFZhbHVlfV1gO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBgeyR7dHlwZX19YCxcbiAgICAgIG5hbWU6IHRpZGllZE5hbWUsXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogcmVuZGVyUGFyYW1zIC0gUmVuZGVyIHRoZSBwYXJhbXMgYXJyYXkgYXMgSlMgRG9jIHBhcmFtc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGZ1bmNQYXJhbXMgTGlzdCBvZiBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gKlxuICogQHJldHVybiB7QXJyYXl9IExpc3Qgb2Ygc3RyaW5nIGxpbmVzIHJlcHJlc2VudGluZyBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gKi9cbmZ1bmN0aW9uIHJlbmRlclBhcmFtcyhmdW5jUGFyYW1zKSB7XG4gIGNvbnN0IGpzZG9jUGFyYW1zID0ganNkb2NpZnlQYXJhbXMoZnVuY1BhcmFtcyk7XG5cbiAgY29uc3QgbWF4TmFtZUxlbmd0aCA9IG1heFByb3BlcnR5TGVuZ3RoKGpzZG9jUGFyYW1zLCAnbmFtZScpO1xuICBjb25zdCBtYXhUeXBlTGVuZ3RoID0gbWF4UHJvcGVydHlMZW5ndGgoanNkb2NQYXJhbXMsICd0eXBlJyk7XG5cbiAgcmV0dXJuIGpzZG9jUGFyYW1zLm1hcChyZW5kZXJQYXJhbS5iaW5kKG51bGwsIG1heE5hbWVMZW5ndGgsIG1heFR5cGVMZW5ndGgpKTtcbn1cblxuLyoqXG4gKiByZW5kZXJGdW5jQ29udGVudCAtIFRha2UgdGhlIEpTIERvYyBkZXNjcmlwdGlvbiBhbmQgZXh0cmFjdCB0aGUgZnVuY3Rpb25cbiAqIHNwZWNpZmljIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSBKUyBEb2MuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHN0cnVjdHVyZSAgICAgICAgICAgICAgT2JqZWN0IGRlc2NyaWJpbmcgdGhlIEpTIERvY1xuICogQHBhcmFtIHthcnJheX0gIFtzdHJ1Y3R1cmUucGFyYW1zPVtdXSAgVGhlIGZ1bmN0aW9uIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBbc3RydWN0dXJlLnJldHVybnM9e31dIFRoZSBmdW5jdGlvbiByZXR1cm4gcHJvcGVydGllc1xuICpcbiAqIEByZXR1cm4ge2FycmF5fSBMaXN0IG9mIGxpbmVzIHRvIG1ha2UgdXAgdGhlIGZ1bmN0aW9uIGNvbnRlbnQgb2YgdGhlIEpTIERvYy5cbiAqL1xuZnVuY3Rpb24gcmVuZGVyRnVuY0NvbnRlbnQoeyBwYXJhbXMgPSBbXSwgcmV0dXJucyA9IHt9IH0pIHtcbiAgY29uc3QgY29udGVudCA9IFtdO1xuICBjb250ZW50LnB1c2goU1BBQ0VSKTtcblxuICBjb25zdCByZW5kZXJlZFBhcmFtcyA9IHJlbmRlclBhcmFtcyhwYXJhbXMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcmVkUGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29udGVudC5wdXNoKHJlbmRlcmVkUGFyYW1zW2ldKTtcbiAgfVxuICBpZiAocmVuZGVyZWRQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnRlbnQucHVzaChTUEFDRVIpO1xuICB9XG4gIGNvbnN0IHJldHVybktleXdvcmQgPSByZXR1cm5zLnJldHVybnMgPyAncmV0dXJucycgOiAncmV0dXJuJztcbiAgY29uc3QgcmV0dXJuTGluZSA9IGAgKiBAJHtyZXR1cm5LZXl3b3JkfSB7dHlwZX0gRGVzY3JpcHRpb25gO1xuXG4gIGNvbnRlbnQucHVzaChyZXR1cm5MaW5lKTtcbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuICogcmVuZGVyQ2xhc3NDb250ZW50IC0gVGFrZSB0aGUgSlMgRG9jIGRlc2NyaXB0aW9uIGFuZCBleHRyYWN0IHRoZSBjbGFzc1xuICogc3BlY2lmaWMgcHJvcGVydGllcyB0byBhZGQgdG8gdGhlIEpTIERvYy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc3RydWN0dXJlIE9iamVjdCBkZXNjcmliaW5nIHRoZSBKUyBEb2NcbiAqXG4gKiBAcmV0dXJuIHthcnJheX0gTGlzdCBvZiBsaW5lcyB0byBtYWtlIHVwIHRoZSBjbGFzcyBjb250ZW50IG9mIHRoZSBKUyBEb2MuXG4gKi9cbmZ1bmN0aW9uIHJlbmRlckNsYXNzQ29udGVudChzdHJ1Y3R1cmUpIHtcbiAgY29uc3QgY29udGVudCA9IFtdO1xuXG4gIGNvbnN0IGV4dCA9IHN0cnVjdHVyZS5leHRlbmRzO1xuICBpZiAoZXh0KSB7XG4gICAgY29udGVudC5wdXNoKGAgKiBAZXh0ZW5kcyAke2V4dH1gKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxuLyoqXG4gKiByZW5kZXIgLSBUYWtlIGEgc3RydWN0dXJlIGRlc2NyaWJpbmcgYSBmdW5jdGlvbiBhbmQgcmVuZGVyIHRoZSBKUyBEb2MgdG9cbiAqIHJlcHJlc2VudCBpdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3RydWN0dXJlIENvbXBsZXRlIHN0cnVjdHVyZVxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gSlMgRG9jIGNvbW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihzdHJ1Y3R1cmUpIHtcbiAgY29uc3QgeyB0eXBlLCBsb2NhdGlvbiA9IHt9IH0gPSBzdHJ1Y3R1cmU7XG5cbiAgY29uc3QgbmFtZUxpbmUgPSByZW5kZXJOYW1lTGluZShzdHJ1Y3R1cmUpO1xuICBjb25zdCBoZWFkZXIgPSBbT1BFTl07XG4gIGNvbnN0IGZvb3RlciA9IFtDTE9TRV07XG5cbiAgY29uc3QgY29udGVudEJ1aWxkZXIgPSBDT05URU5UX0JVSUxERVJTW3R5cGVdO1xuICBpZiAoIWNvbnRlbnRCdWlsZGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIEpTIERvYyB0eXBlOiAke3R5cGV9YCk7XG4gIH1cbiAgY29uc3QgY29udGVudCA9IFtuYW1lTGluZV0uY29uY2F0KGNvbnRlbnRCdWlsZGVyKHN0cnVjdHVyZSkpO1xuXG4gIGNvbnN0IGxpbmVzID0gaGVhZGVyLmNvbmNhdChjb250ZW50KS5jb25jYXQoZm9vdGVyKTtcblxuICBjb25zdCB7IGNvbHVtbiA9IDAgfSA9IGxvY2F0aW9uO1xuICBjb25zdCBpbmRlbnRhdGlvbiA9IExJTkVfUEFEREVSLnJlcGVhdChjb2x1bW4pO1xuXG4gIHJldHVybiBsaW5lcy5tYXAoKGxpbmUpID0+IGAke2luZGVudGF0aW9ufSR7bGluZX1gKS5qb2luKCdcXG4nKTtcbn1cbiJdfQ==