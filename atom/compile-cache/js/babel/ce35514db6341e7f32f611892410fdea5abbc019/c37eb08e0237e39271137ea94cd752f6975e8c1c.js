Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.parse = parse;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _babylon = require('babylon');

var parser = _interopRequireWildcard(_babylon);

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

'use babel';

var DEFAULT_PARAM_NAME = 'Unknown';
var PARSE_OPTS = {
  locations: true, sourceType: 'module',
  plugins: ['*']
};

/* eslint-disable no-use-before-define */
var PARAM_PARSERS = {
  Identifier: parseIdentifierParam,
  AssignmentPattern: parseAssignmentParam,
  RestElement: parseRestParam,
  RestProperty: parseRestParam,
  ObjectPattern: parseDestructuredParam
};
/* eslint-enable */
/* eslint-disable quote-props, no-use-before-define */
var SIMPLIFIERS = {
  'class': simplifyClassNode,
  'function': simplifyFuncNode,
  'classMethod': simplifyClassMethodNode
};
/* eslint-enable */

/**
 * getAST - Turns the code to the ast.
 *
 * @param {string} code The file containing the code
 *
 * @return {object} AST
 */
function getAST(code) {
  try {
    var ast = parser.parse(code, PARSE_OPTS);
    return ast;
  } catch (e) {
    throw new Error('atom-easy-jsdoc expects valid JavaScript. Error parsing: ' + e.message);
  }
}

/**
 * onLine - Is the node on or one below the line?
 *
 * @param {object} node    AST node
 * @param {number} lineNum Line number to check the node against
 *
 * @return {boolean} Is the node on or below the line?
 */
function onLine(node, lineNum) {
  var startLine = node.loc.start.line;
  return startLine === lineNum || startLine - 1 === lineNum;
}

/**
 * getNode - Get the function node at the line number from the ast
 *
 * @param {object} ast     AST representing the file
 * @param {number} lineNum Line number to check the node against
 *
 * @return {object} AST function node
 */
function getNode(ast, lineNum) {
  var node = null;
  var exported = null;

  (0, _babelTraverse2['default'])(ast, {
    'FunctionDeclaration|ArrowFunctionExpression': function FunctionDeclarationArrowFunctionExpression(declaration) {
      if (node) {
        return;
      }
      var n = declaration.node;
      if (onLine(n, lineNum)) {
        node = n;
        node.jsDocType = 'function';
        if (exported && exported.declaration === node) {
          node.loc = exported.loc;
        }
      }
    },
    ObjectMethod: function ObjectMethod(declaration) {
      if (node) {
        return;
      }
      var n = declaration.node;
      if (onLine(n, lineNum)) {
        node = n;
        node.jsDocType = 'function';
        node.id = { name: node.key.name };
      }
    },
    ClassMethod: function ClassMethod(declaration) {
      if (node) {
        return;
      }
      var n = declaration.node;
      if (onLine(n, lineNum)) {
        node = n;
        node.jsDocType = 'classMethod';
        node.id = { name: node.key.name };
      }
    },
    VariableDeclaration: function VariableDeclaration(declaration) {
      if (node) {
        return;
      }
      var n = declaration.node;
      var declarator = n.declarations[0];
      if (onLine(n, lineNum) && declarator.type === 'VariableDeclarator') {
        var declaredNode = declarator.init;
        if (['FunctionExpression', 'ArrowFunctionExpression'].indexOf(declaredNode.type) > -1) {
          node = declaredNode;
          if (exported && exported.declaration === n) {
            node.loc = exported.loc;
          } else {
            node.loc = n.loc;
          }
          node.id = { name: declarator.id.name };
          node.jsDocType = 'function';
        }
      }
    },
    'ExportNamedDeclaration|ExportDefaultDeclaration': function ExportNamedDeclarationExportDefaultDeclaration(declaration) {
      exported = declaration.node;
    },
    AssignmentExpression: function AssignmentExpression(declaration) {
      if (node) {
        return;
      }
      var n = declaration.node;
      if (onLine(n, lineNum) && n.left.type === 'MemberExpression' && n.right.type === 'FunctionExpression') {
        node = n.right;
        node.loc = n.loc;
        node.id = { name: n.left.property.name };
        node.jsDocType = 'function';
      }
    },
    ClassDeclaration: function ClassDeclaration(declaration) {
      if (node) {
        return;
      }
      var n = declaration.node;
      if (onLine(n, lineNum)) {
        node = n;
        node.jsDocType = 'class';
      }
    }
  });
  return node;
}

/**
 * parseIdentifierParam - Parse an indentifier param to an array of parameters
 *
 * @param {object} param AST indentifier param
 *
 * @return {array} List of parameters
 */
function parseIdentifierParam(param) {
  return [{ name: param.name }];
}

/**
 * parseAssignmentParam - Parse an assignment parameter to an array of
 * parameters
 *
 * @param {object} param AST representation of an assignment parameter
 *
 * @return {array} Array of simple parameters
 */
function parseAssignmentParam(param) {
  var type = undefined;
  var defaultValue = param.right.value;

  var paramAssignmentType = param.right.type;

  if (paramAssignmentType === 'StringLiteral') {
    type = 'string';
  } else if (paramAssignmentType === 'NumericLiteral') {
    type = 'number';
  } else if (paramAssignmentType === 'BooleanLiteral') {
    type = 'boolean';
  } else if (paramAssignmentType === 'ArrayExpression') {
    type = 'array';
    defaultValue = '[]';
  } else if (['ObjectExpression', 'NewExpression'].indexOf(paramAssignmentType) >= 0) {
    type = 'object';
    defaultValue = '{}';
  } else if (paramAssignmentType === 'NullLiteral') {
    type = 'null';
    defaultValue = null;
  } else if (paramAssignmentType === 'CallExpression') {
    type = 'Unknown';
    defaultValue = 'Unknown';
  } else if (paramAssignmentType === 'Identifier') {
    type = 'Unknown';
    defaultValue = 'Unknown';
  } else {
    throw new Error('Unknown param type: ' + paramAssignmentType);
  }

  return [{ name: param.left.name, defaultValue: defaultValue, type: type }];
}

/**
 * parseRestParam - Turn a rest parameter to an array of simplified parameters
 *
 * @param {object} param AST representation of a rest parameter
 *
 * @return {array} Array of simplified parameters
 */
function parseRestParam(param) {
  return [{ name: param.argument.name, type: 'array' }];
}

/**
 * getParamParser - Get the parameter parser for the type
 *
 * @param {string} paramType AST parameter node type
 *
 * @return {function} Function that returns an array of simplified parameters
 * from that parameter node type.
 */
function getParamParser(paramType) {
  var pp = PARAM_PARSERS[paramType];
  if (!pp) {
    throw new Error('Unknown param type: ' + paramType);
  }
  return pp;
}

/**
 * parseDestructuredParam - Turn destrucutured parameters to a list of
 * simplified parameters
 *
 * @param {object} param AST representation of a destructured node parameter
 *
 * @return {array} List of simplified parameters
 */
function parseDestructuredParam(_ref) {
  var properties = _ref.properties;

  var props = properties;
  var parent = DEFAULT_PARAM_NAME;

  return props.reduce(function (params, param) {
    var value = param;
    if (param.type === 'ObjectProperty') {
      value = param.value;
    }
    var pp = getParamParser(value.type);
    var newParams = pp(value).map(function (p) {
      return Object.assign({}, p, { parent: parent });
    });
    return params.concat(newParams);
  }, [{ name: parent, type: 'object' }]);
}

/**
 * simplifyParams - Take a list of parameters and return a list of simplified
 * parameters to represent them for JS Doc.
 *
 * @param {array} params List of AST reperesentation of parameters.
 *
 * @return {array} List of simplified parameters representation the AST
 * parameters.
 */
function simplifyParams(params) {
  return params.reduce(function (col, param) {
    var pp = getParamParser(param.type);
    return col.concat(pp(param));
  }, []);
}

/**
 * simplifyLocation - Take the node location and return just a line and column.
 * This is intended to represent where the JSDoc will be output (i.e. one line
 * above the function)
 *
 * @param {object} location AST function node location
 *
 * @return {object} Location AST doc should be output.
 */
function simplifyLocation(location) {
  return {
    line: Math.max(location.start.line - 1, 1),
    column: location.start.column
  };
}

/**
 * simplifyNode - Take the AST representation of the node and simplify
 * it to get just the information we need for generating a JS Doc.
 *
 * @param {object} node AST representation of the node.
 *
 * @return {object} Simplified representation of the node.
 */
function simplifyNode(node) {
  var jsDocType = node.jsDocType;
  var simplifier = SIMPLIFIERS[jsDocType];
  if (!simplifier) {
    throw new Error('Unknown node type: ' + jsDocType);
  }

  var id = node.id || {};
  var name = id.name || 'Unknown';

  return Object.assign({
    name: name,
    location: simplifyLocation(node.loc),
    type: jsDocType
  }, simplifier(node));
}

/**
 * simplifyFuncNode - Extract function specific JS Doc properties.
 *
 * @param {object} node AST representation of the node.
 *
 * @return {object} Simplified representation of the node.
 */
function simplifyFuncNode(node) {
  return {
    params: simplifyParams(node.params),
    returns: { returns: false }
  };
}

/**
 * simplifyClassMethodNode - Extract classMethod specific JS Doc properties.
 *
 * @param  {object} node AST representation of the node.
 *
 * @return {type}      Simplified representation of the node.
 */
function simplifyClassMethodNode(node) {
  return {
    params: simplifyParams(node.params),
    isStatic: node['static'],
    returns: { returns: false }
  };
}

/**
 * simplifyClassNode - Extract the class specific JS Doc properties
 *
 * @param {object} node AST representation of the node.
 *
 * @return {object} Simplified representation of the node.
 */
function simplifyClassNode(node) {
  return {
    'extends': (node.superClass || {}).name
  };
}

/**
 * parse - Take code and a line number and return an object representing all
 * properties of the function or class.
 *
 * @param {string} code        Complete file
 * @param {number} [lineNum=1] Line number where the cursor is located and where
 * we will look for the function to create the object for.
 *
 * @return {object} Simplified object representing the function.
 */

function parse(code) {
  var lineNum = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  var ast = getAST(code);
  var node = getNode(ast, lineNum);
  if (!node) {
    return null;
  }

  var simplified = simplifyNode(node);

  return simplified;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2pzZG9jL2Z1bmNQYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3VCQUV3QixTQUFTOztJQUFyQixNQUFNOzs2QkFDRyxnQkFBZ0I7Ozs7QUFIckMsV0FBVyxDQUFDOztBQUtaLElBQU0sa0JBQWtCLEdBQUcsU0FBUyxDQUFDO0FBQ3JDLElBQU0sVUFBVSxHQUFHO0FBQ2pCLFdBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVE7QUFDckMsU0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0NBQ2YsQ0FBQzs7O0FBR0YsSUFBTSxhQUFhLEdBQUc7QUFDcEIsWUFBVSxFQUFFLG9CQUFvQjtBQUNoQyxtQkFBaUIsRUFBRSxvQkFBb0I7QUFDdkMsYUFBVyxFQUFFLGNBQWM7QUFDM0IsY0FBWSxFQUFFLGNBQWM7QUFDNUIsZUFBYSxFQUFFLHNCQUFzQjtDQUN0QyxDQUFDOzs7QUFHRixJQUFNLFdBQVcsR0FBRztBQUNsQixTQUFPLEVBQUUsaUJBQWlCO0FBQzFCLFlBQVUsRUFBRSxnQkFBZ0I7QUFDNUIsZUFBYSxFQUFFLHVCQUF1QjtDQUN2QyxDQUFDOzs7Ozs7Ozs7O0FBV0YsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ3BCLE1BQUk7QUFDRixRQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMzQyxXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixVQUFNLElBQUksS0FBSywrREFBNkQsQ0FBQyxDQUFDLE9BQU8sQ0FBRyxDQUFDO0dBQzFGO0NBQ0Y7Ozs7Ozs7Ozs7QUFVRCxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQzdCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN0QyxTQUFPLFNBQVMsS0FBSyxPQUFPLElBQUksU0FBUyxHQUFHLENBQUMsS0FBSyxPQUFPLENBQUM7Q0FDM0Q7Ozs7Ozs7Ozs7QUFVRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQzdCLE1BQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7O0FBRXBCLGtDQUFTLEdBQUcsRUFBRTtBQUNaLGlEQUE2QyxFQUFFLG9EQUFDLFdBQVcsRUFBSztBQUM5RCxVQUFJLElBQUksRUFBRTtBQUFFLGVBQU87T0FBRTtBQUNyQixVQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQzNCLFVBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUN0QixZQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ1QsWUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7QUFDNUIsWUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUU7QUFDN0MsY0FBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO1NBQ3pCO09BQ0Y7S0FDRjtBQUNELGdCQUFZLEVBQUUsc0JBQUMsV0FBVyxFQUFLO0FBQzdCLFVBQUksSUFBSSxFQUFFO0FBQUUsZUFBTztPQUFFO0FBQ3JCLFVBQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDM0IsVUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQ3RCLFlBQUksR0FBRyxDQUFDLENBQUM7QUFDVCxZQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztBQUM1QixZQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDbkM7S0FDRjtBQUNELGVBQVcsRUFBRSxxQkFBQyxXQUFXLEVBQUs7QUFDNUIsVUFBSSxJQUFJLEVBQUU7QUFBRSxlQUFPO09BQUU7QUFDckIsVUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztBQUMzQixVQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDdEIsWUFBSSxHQUFHLENBQUMsQ0FBQztBQUNULFlBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDO0FBQy9CLFlBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNuQztLQUNGO0FBQ0QsdUJBQW1CLEVBQUUsNkJBQUMsV0FBVyxFQUFLO0FBQ3BDLFVBQUksSUFBSSxFQUFFO0FBQUUsZUFBTztPQUFFO0FBQ3JCLFVBQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDM0IsVUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxVQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxvQkFBb0IsRUFBRTtBQUNsRSxZQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0FBQ3JDLFlBQUksQ0FBQyxvQkFBb0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDckYsY0FBSSxHQUFHLFlBQVksQ0FBQztBQUNwQixjQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsV0FBVyxLQUFLLENBQUMsRUFBRTtBQUMxQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO1dBQ3pCLE1BQU07QUFDTCxnQkFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1dBQ2xCO0FBQ0QsY0FBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZDLGNBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO1NBQzdCO09BQ0Y7S0FDRjtBQUNELHFEQUFpRCxFQUFFLHdEQUFDLFdBQVcsRUFBSztBQUNsRSxjQUFRLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztLQUM3QjtBQUNELHdCQUFvQixFQUFFLDhCQUFDLFdBQVcsRUFBSztBQUNyQyxVQUFJLElBQUksRUFBRTtBQUFFLGVBQU87T0FBRTtBQUNyQixVQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQzNCLFVBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxrQkFBa0IsSUFDdkQsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssb0JBQW9CLEVBQUU7QUFDMUMsWUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDZixZQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDakIsWUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QyxZQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztPQUM3QjtLQUNGO0FBQ0Qsb0JBQWdCLEVBQUUsMEJBQUMsV0FBVyxFQUFLO0FBQ2pDLFVBQUksSUFBSSxFQUFFO0FBQUUsZUFBTztPQUFFO0FBQ3JCLFVBQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDM0IsVUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQ3RCLFlBQUksR0FBRyxDQUFDLENBQUM7QUFDVCxZQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztPQUMxQjtLQUNGO0dBQ0YsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7Ozs7O0FBU0QsU0FBUyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUU7QUFDbkMsU0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQy9COzs7Ozs7Ozs7O0FBVUQsU0FBUyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUU7QUFDbkMsTUFBSSxJQUFJLFlBQUEsQ0FBQztBQUNULE1BQUksWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUVyQyxNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDOztBQUU3QyxNQUFJLG1CQUFtQixLQUFLLGVBQWUsRUFBRTtBQUMzQyxRQUFJLEdBQUcsUUFBUSxDQUFDO0dBQ2pCLE1BQU0sSUFBSSxtQkFBbUIsS0FBSyxnQkFBZ0IsRUFBRTtBQUNuRCxRQUFJLEdBQUcsUUFBUSxDQUFDO0dBQ2pCLE1BQU0sSUFBSSxtQkFBbUIsS0FBSyxnQkFBZ0IsRUFBRTtBQUNuRCxRQUFJLEdBQUcsU0FBUyxDQUFDO0dBQ2xCLE1BQU0sSUFBSSxtQkFBbUIsS0FBSyxpQkFBaUIsRUFBRTtBQUNwRCxRQUFJLEdBQUcsT0FBTyxDQUFDO0FBQ2YsZ0JBQVksR0FBRyxJQUFJLENBQUM7R0FDckIsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2xGLFFBQUksR0FBRyxRQUFRLENBQUM7QUFDaEIsZ0JBQVksR0FBRyxJQUFJLENBQUM7R0FDckIsTUFBTSxJQUFJLG1CQUFtQixLQUFLLGFBQWEsRUFBRTtBQUNoRCxRQUFJLEdBQUcsTUFBTSxDQUFDO0FBQ2QsZ0JBQVksR0FBRyxJQUFJLENBQUM7R0FDckIsTUFBTSxJQUFJLG1CQUFtQixLQUFLLGdCQUFnQixFQUFFO0FBQ25ELFFBQUksR0FBRyxTQUFTLENBQUM7QUFDakIsZ0JBQVksR0FBRyxTQUFTLENBQUM7R0FDMUIsTUFBTSxJQUFJLG1CQUFtQixLQUFLLFlBQVksRUFBRTtBQUMvQyxRQUFJLEdBQUcsU0FBUyxDQUFDO0FBQ2pCLGdCQUFZLEdBQUcsU0FBUyxDQUFDO0dBQzFCLE1BQU07QUFDTCxVQUFNLElBQUksS0FBSywwQkFBd0IsbUJBQW1CLENBQUcsQ0FBQztHQUMvRDs7QUFFRCxTQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFaLFlBQVksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLENBQUMsQ0FBQztDQUN4RDs7Ozs7Ozs7O0FBU0QsU0FBUyxjQUFjLENBQUMsS0FBSyxFQUFFO0FBQzdCLFNBQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztDQUN2RDs7Ozs7Ozs7OztBQVVELFNBQVMsY0FBYyxDQUFDLFNBQVMsRUFBRTtBQUNqQyxNQUFNLEVBQUUsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDcEMsTUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNQLFVBQU0sSUFBSSxLQUFLLDBCQUF3QixTQUFTLENBQUcsQ0FBQztHQUNyRDtBQUNELFNBQU8sRUFBRSxDQUFDO0NBQ1g7Ozs7Ozs7Ozs7QUFVRCxTQUFTLHNCQUFzQixDQUFDLElBQWMsRUFBRTtNQUFkLFVBQVUsR0FBWixJQUFjLENBQVosVUFBVTs7QUFDMUMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDO0FBQ3pCLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDOztBQUVsQyxTQUFPLEtBQUssQ0FDVCxNQUFNLENBQUMsVUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFLO0FBQ3pCLFFBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixRQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssZ0JBQWdCLEVBQUU7QUFDbkMsV0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDckI7QUFDRCxRQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RDLFFBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDO2FBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQ3pFLFdBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUNqQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUM7Ozs7Ozs7Ozs7O0FBV0QsU0FBUyxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQzlCLFNBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUs7QUFDbkMsUUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxXQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDOUIsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUNSOzs7Ozs7Ozs7OztBQVdELFNBQVMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO0FBQ2xDLFNBQU87QUFDTCxRQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLFVBQU0sRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU07R0FDOUIsQ0FBQztDQUNIOzs7Ozs7Ozs7O0FBVUQsU0FBUyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQzFCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDakMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixVQUFNLElBQUksS0FBSyx5QkFBdUIsU0FBUyxDQUFHLENBQUM7R0FDcEQ7O0FBRUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDekIsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUM7O0FBRWxDLFNBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNuQixRQUFJLEVBQUosSUFBSTtBQUNKLFlBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3BDLFFBQUksRUFBRSxTQUFTO0dBQ2hCLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDdEI7Ozs7Ozs7OztBQVNELFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO0FBQzlCLFNBQU87QUFDTCxVQUFNLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDbkMsV0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtHQUM1QixDQUFDO0NBQ0g7Ozs7Ozs7OztBQVVELFNBQVMsdUJBQXVCLENBQUMsSUFBSSxFQUFFO0FBQ3JDLFNBQU87QUFDTCxVQUFNLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDbkMsWUFBUSxFQUFFLElBQUksVUFBTztBQUNyQixXQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0dBQzVCLENBQUM7Q0FDSDs7Ozs7Ozs7O0FBU0QsU0FBUyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUU7QUFDL0IsU0FBTztBQUNMLGVBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQSxDQUFFLElBQUk7R0FDdEMsQ0FBQztDQUNIOzs7Ozs7Ozs7Ozs7O0FBWU0sU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFlO01BQWIsT0FBTyx5REFBRyxDQUFDOztBQUNyQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNuQyxNQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXRDLFNBQU8sVUFBVSxDQUFDO0NBQ25CIiwiZmlsZSI6Ii9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLWVhc3ktanNkb2MvbGliL2pzZG9jL2Z1bmNQYXJzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgcGFyc2VyIGZyb20gJ2JhYnlsb24nO1xuaW1wb3J0IHRyYXZlcnNlIGZyb20gJ2JhYmVsLXRyYXZlcnNlJztcblxuY29uc3QgREVGQVVMVF9QQVJBTV9OQU1FID0gJ1Vua25vd24nO1xuY29uc3QgUEFSU0VfT1BUUyA9IHtcbiAgbG9jYXRpb25zOiB0cnVlLCBzb3VyY2VUeXBlOiAnbW9kdWxlJyxcbiAgcGx1Z2luczogWycqJ10sXG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11c2UtYmVmb3JlLWRlZmluZSAqL1xuY29uc3QgUEFSQU1fUEFSU0VSUyA9IHtcbiAgSWRlbnRpZmllcjogcGFyc2VJZGVudGlmaWVyUGFyYW0sXG4gIEFzc2lnbm1lbnRQYXR0ZXJuOiBwYXJzZUFzc2lnbm1lbnRQYXJhbSxcbiAgUmVzdEVsZW1lbnQ6IHBhcnNlUmVzdFBhcmFtLFxuICBSZXN0UHJvcGVydHk6IHBhcnNlUmVzdFBhcmFtLFxuICBPYmplY3RQYXR0ZXJuOiBwYXJzZURlc3RydWN0dXJlZFBhcmFtLFxufTtcbi8qIGVzbGludC1lbmFibGUgKi9cbi8qIGVzbGludC1kaXNhYmxlIHF1b3RlLXByb3BzLCBuby11c2UtYmVmb3JlLWRlZmluZSAqL1xuY29uc3QgU0lNUExJRklFUlMgPSB7XG4gICdjbGFzcyc6IHNpbXBsaWZ5Q2xhc3NOb2RlLFxuICAnZnVuY3Rpb24nOiBzaW1wbGlmeUZ1bmNOb2RlLFxuICAnY2xhc3NNZXRob2QnOiBzaW1wbGlmeUNsYXNzTWV0aG9kTm9kZSxcbn07XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cblxuLyoqXG4gKiBnZXRBU1QgLSBUdXJucyB0aGUgY29kZSB0byB0aGUgYXN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIFRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIGNvZGVcbiAqXG4gKiBAcmV0dXJuIHtvYmplY3R9IEFTVFxuICovXG5mdW5jdGlvbiBnZXRBU1QoY29kZSkge1xuICB0cnkge1xuICAgIGNvbnN0IGFzdCA9IHBhcnNlci5wYXJzZShjb2RlLCBQQVJTRV9PUFRTKTtcbiAgICByZXR1cm4gYXN0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBhdG9tLWVhc3ktanNkb2MgZXhwZWN0cyB2YWxpZCBKYXZhU2NyaXB0LiBFcnJvciBwYXJzaW5nOiAke2UubWVzc2FnZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIG9uTGluZSAtIElzIHRoZSBub2RlIG9uIG9yIG9uZSBiZWxvdyB0aGUgbGluZT9cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbm9kZSAgICBBU1Qgbm9kZVxuICogQHBhcmFtIHtudW1iZXJ9IGxpbmVOdW0gTGluZSBudW1iZXIgdG8gY2hlY2sgdGhlIG5vZGUgYWdhaW5zdFxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IElzIHRoZSBub2RlIG9uIG9yIGJlbG93IHRoZSBsaW5lP1xuICovXG5mdW5jdGlvbiBvbkxpbmUobm9kZSwgbGluZU51bSkge1xuICBjb25zdCBzdGFydExpbmUgPSBub2RlLmxvYy5zdGFydC5saW5lO1xuICByZXR1cm4gc3RhcnRMaW5lID09PSBsaW5lTnVtIHx8IHN0YXJ0TGluZSAtIDEgPT09IGxpbmVOdW07XG59XG5cbi8qKlxuICogZ2V0Tm9kZSAtIEdldCB0aGUgZnVuY3Rpb24gbm9kZSBhdCB0aGUgbGluZSBudW1iZXIgZnJvbSB0aGUgYXN0XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGFzdCAgICAgQVNUIHJlcHJlc2VudGluZyB0aGUgZmlsZVxuICogQHBhcmFtIHtudW1iZXJ9IGxpbmVOdW0gTGluZSBudW1iZXIgdG8gY2hlY2sgdGhlIG5vZGUgYWdhaW5zdFxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gQVNUIGZ1bmN0aW9uIG5vZGVcbiAqL1xuZnVuY3Rpb24gZ2V0Tm9kZShhc3QsIGxpbmVOdW0pIHtcbiAgbGV0IG5vZGUgPSBudWxsO1xuICBsZXQgZXhwb3J0ZWQgPSBudWxsO1xuXG4gIHRyYXZlcnNlKGFzdCwge1xuICAgICdGdW5jdGlvbkRlY2xhcmF0aW9ufEFycm93RnVuY3Rpb25FeHByZXNzaW9uJzogKGRlY2xhcmF0aW9uKSA9PiB7XG4gICAgICBpZiAobm9kZSkgeyByZXR1cm47IH1cbiAgICAgIGNvbnN0IG4gPSBkZWNsYXJhdGlvbi5ub2RlO1xuICAgICAgaWYgKG9uTGluZShuLCBsaW5lTnVtKSkge1xuICAgICAgICBub2RlID0gbjtcbiAgICAgICAgbm9kZS5qc0RvY1R5cGUgPSAnZnVuY3Rpb24nO1xuICAgICAgICBpZiAoZXhwb3J0ZWQgJiYgZXhwb3J0ZWQuZGVjbGFyYXRpb24gPT09IG5vZGUpIHtcbiAgICAgICAgICBub2RlLmxvYyA9IGV4cG9ydGVkLmxvYztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgT2JqZWN0TWV0aG9kOiAoZGVjbGFyYXRpb24pID0+IHtcbiAgICAgIGlmIChub2RlKSB7IHJldHVybjsgfVxuICAgICAgY29uc3QgbiA9IGRlY2xhcmF0aW9uLm5vZGU7XG4gICAgICBpZiAob25MaW5lKG4sIGxpbmVOdW0pKSB7XG4gICAgICAgIG5vZGUgPSBuO1xuICAgICAgICBub2RlLmpzRG9jVHlwZSA9ICdmdW5jdGlvbic7XG4gICAgICAgIG5vZGUuaWQgPSB7IG5hbWU6IG5vZGUua2V5Lm5hbWUgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgIENsYXNzTWV0aG9kOiAoZGVjbGFyYXRpb24pID0+IHtcbiAgICAgIGlmIChub2RlKSB7IHJldHVybjsgfVxuICAgICAgY29uc3QgbiA9IGRlY2xhcmF0aW9uLm5vZGU7XG4gICAgICBpZiAob25MaW5lKG4sIGxpbmVOdW0pKSB7XG4gICAgICAgIG5vZGUgPSBuO1xuICAgICAgICBub2RlLmpzRG9jVHlwZSA9ICdjbGFzc01ldGhvZCc7XG4gICAgICAgIG5vZGUuaWQgPSB7IG5hbWU6IG5vZGUua2V5Lm5hbWUgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFZhcmlhYmxlRGVjbGFyYXRpb246IChkZWNsYXJhdGlvbikgPT4ge1xuICAgICAgaWYgKG5vZGUpIHsgcmV0dXJuOyB9XG4gICAgICBjb25zdCBuID0gZGVjbGFyYXRpb24ubm9kZTtcbiAgICAgIGNvbnN0IGRlY2xhcmF0b3IgPSBuLmRlY2xhcmF0aW9uc1swXTtcbiAgICAgIGlmIChvbkxpbmUobiwgbGluZU51bSkgJiYgZGVjbGFyYXRvci50eXBlID09PSAnVmFyaWFibGVEZWNsYXJhdG9yJykge1xuICAgICAgICBjb25zdCBkZWNsYXJlZE5vZGUgPSBkZWNsYXJhdG9yLmluaXQ7XG4gICAgICAgIGlmIChbJ0Z1bmN0aW9uRXhwcmVzc2lvbicsICdBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbiddLmluZGV4T2YoZGVjbGFyZWROb2RlLnR5cGUpID4gLTEpIHtcbiAgICAgICAgICBub2RlID0gZGVjbGFyZWROb2RlO1xuICAgICAgICAgIGlmIChleHBvcnRlZCAmJiBleHBvcnRlZC5kZWNsYXJhdGlvbiA9PT0gbikge1xuICAgICAgICAgICAgbm9kZS5sb2MgPSBleHBvcnRlZC5sb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUubG9jID0gbi5sb2M7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5vZGUuaWQgPSB7IG5hbWU6IGRlY2xhcmF0b3IuaWQubmFtZSB9O1xuICAgICAgICAgIG5vZGUuanNEb2NUeXBlID0gJ2Z1bmN0aW9uJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb258RXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJzogKGRlY2xhcmF0aW9uKSA9PiB7XG4gICAgICBleHBvcnRlZCA9IGRlY2xhcmF0aW9uLm5vZGU7XG4gICAgfSxcbiAgICBBc3NpZ25tZW50RXhwcmVzc2lvbjogKGRlY2xhcmF0aW9uKSA9PiB7XG4gICAgICBpZiAobm9kZSkgeyByZXR1cm47IH1cbiAgICAgIGNvbnN0IG4gPSBkZWNsYXJhdGlvbi5ub2RlO1xuICAgICAgaWYgKG9uTGluZShuLCBsaW5lTnVtKSAmJiBuLmxlZnQudHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nXG4gICAgICAgICYmIG4ucmlnaHQudHlwZSA9PT0gJ0Z1bmN0aW9uRXhwcmVzc2lvbicpIHtcbiAgICAgICAgbm9kZSA9IG4ucmlnaHQ7XG4gICAgICAgIG5vZGUubG9jID0gbi5sb2M7XG4gICAgICAgIG5vZGUuaWQgPSB7IG5hbWU6IG4ubGVmdC5wcm9wZXJ0eS5uYW1lIH07XG4gICAgICAgIG5vZGUuanNEb2NUeXBlID0gJ2Z1bmN0aW9uJztcbiAgICAgIH1cbiAgICB9LFxuICAgIENsYXNzRGVjbGFyYXRpb246IChkZWNsYXJhdGlvbikgPT4ge1xuICAgICAgaWYgKG5vZGUpIHsgcmV0dXJuOyB9XG4gICAgICBjb25zdCBuID0gZGVjbGFyYXRpb24ubm9kZTtcbiAgICAgIGlmIChvbkxpbmUobiwgbGluZU51bSkpIHtcbiAgICAgICAgbm9kZSA9IG47XG4gICAgICAgIG5vZGUuanNEb2NUeXBlID0gJ2NsYXNzJztcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcbiAgcmV0dXJuIG5vZGU7XG59XG5cbi8qKlxuICogcGFyc2VJZGVudGlmaWVyUGFyYW0gLSBQYXJzZSBhbiBpbmRlbnRpZmllciBwYXJhbSB0byBhbiBhcnJheSBvZiBwYXJhbWV0ZXJzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtIEFTVCBpbmRlbnRpZmllciBwYXJhbVxuICpcbiAqIEByZXR1cm4ge2FycmF5fSBMaXN0IG9mIHBhcmFtZXRlcnNcbiAqL1xuZnVuY3Rpb24gcGFyc2VJZGVudGlmaWVyUGFyYW0ocGFyYW0pIHtcbiAgcmV0dXJuIFt7IG5hbWU6IHBhcmFtLm5hbWUgfV07XG59XG5cbi8qKlxuICogcGFyc2VBc3NpZ25tZW50UGFyYW0gLSBQYXJzZSBhbiBhc3NpZ25tZW50IHBhcmFtZXRlciB0byBhbiBhcnJheSBvZlxuICogcGFyYW1ldGVyc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbSBBU1QgcmVwcmVzZW50YXRpb24gb2YgYW4gYXNzaWdubWVudCBwYXJhbWV0ZXJcbiAqXG4gKiBAcmV0dXJuIHthcnJheX0gQXJyYXkgb2Ygc2ltcGxlIHBhcmFtZXRlcnNcbiAqL1xuZnVuY3Rpb24gcGFyc2VBc3NpZ25tZW50UGFyYW0ocGFyYW0pIHtcbiAgbGV0IHR5cGU7XG4gIGxldCBkZWZhdWx0VmFsdWUgPSBwYXJhbS5yaWdodC52YWx1ZTtcblxuICBjb25zdCBwYXJhbUFzc2lnbm1lbnRUeXBlID0gcGFyYW0ucmlnaHQudHlwZTtcblxuICBpZiAocGFyYW1Bc3NpZ25tZW50VHlwZSA9PT0gJ1N0cmluZ0xpdGVyYWwnKSB7XG4gICAgdHlwZSA9ICdzdHJpbmcnO1xuICB9IGVsc2UgaWYgKHBhcmFtQXNzaWdubWVudFR5cGUgPT09ICdOdW1lcmljTGl0ZXJhbCcpIHtcbiAgICB0eXBlID0gJ251bWJlcic7XG4gIH0gZWxzZSBpZiAocGFyYW1Bc3NpZ25tZW50VHlwZSA9PT0gJ0Jvb2xlYW5MaXRlcmFsJykge1xuICAgIHR5cGUgPSAnYm9vbGVhbic7XG4gIH0gZWxzZSBpZiAocGFyYW1Bc3NpZ25tZW50VHlwZSA9PT0gJ0FycmF5RXhwcmVzc2lvbicpIHtcbiAgICB0eXBlID0gJ2FycmF5JztcbiAgICBkZWZhdWx0VmFsdWUgPSAnW10nO1xuICB9IGVsc2UgaWYgKFsnT2JqZWN0RXhwcmVzc2lvbicsICdOZXdFeHByZXNzaW9uJ10uaW5kZXhPZihwYXJhbUFzc2lnbm1lbnRUeXBlKSA+PSAwKSB7XG4gICAgdHlwZSA9ICdvYmplY3QnO1xuICAgIGRlZmF1bHRWYWx1ZSA9ICd7fSc7XG4gIH0gZWxzZSBpZiAocGFyYW1Bc3NpZ25tZW50VHlwZSA9PT0gJ051bGxMaXRlcmFsJykge1xuICAgIHR5cGUgPSAnbnVsbCc7XG4gICAgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgfSBlbHNlIGlmIChwYXJhbUFzc2lnbm1lbnRUeXBlID09PSAnQ2FsbEV4cHJlc3Npb24nKSB7XG4gICAgdHlwZSA9ICdVbmtub3duJztcbiAgICBkZWZhdWx0VmFsdWUgPSAnVW5rbm93bic7XG4gIH0gZWxzZSBpZiAocGFyYW1Bc3NpZ25tZW50VHlwZSA9PT0gJ0lkZW50aWZpZXInKSB7XG4gICAgdHlwZSA9ICdVbmtub3duJztcbiAgICBkZWZhdWx0VmFsdWUgPSAnVW5rbm93bic7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBhcmFtIHR5cGU6ICR7cGFyYW1Bc3NpZ25tZW50VHlwZX1gKTtcbiAgfVxuXG4gIHJldHVybiBbeyBuYW1lOiBwYXJhbS5sZWZ0Lm5hbWUsIGRlZmF1bHRWYWx1ZSwgdHlwZSB9XTtcbn1cblxuLyoqXG4gKiBwYXJzZVJlc3RQYXJhbSAtIFR1cm4gYSByZXN0IHBhcmFtZXRlciB0byBhbiBhcnJheSBvZiBzaW1wbGlmaWVkIHBhcmFtZXRlcnNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcGFyYW0gQVNUIHJlcHJlc2VudGF0aW9uIG9mIGEgcmVzdCBwYXJhbWV0ZXJcbiAqXG4gKiBAcmV0dXJuIHthcnJheX0gQXJyYXkgb2Ygc2ltcGxpZmllZCBwYXJhbWV0ZXJzXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUmVzdFBhcmFtKHBhcmFtKSB7XG4gIHJldHVybiBbeyBuYW1lOiBwYXJhbS5hcmd1bWVudC5uYW1lLCB0eXBlOiAnYXJyYXknIH1dO1xufVxuXG4vKipcbiAqIGdldFBhcmFtUGFyc2VyIC0gR2V0IHRoZSBwYXJhbWV0ZXIgcGFyc2VyIGZvciB0aGUgdHlwZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbVR5cGUgQVNUIHBhcmFtZXRlciBub2RlIHR5cGVcbiAqXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gRnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGFycmF5IG9mIHNpbXBsaWZpZWQgcGFyYW1ldGVyc1xuICogZnJvbSB0aGF0IHBhcmFtZXRlciBub2RlIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGdldFBhcmFtUGFyc2VyKHBhcmFtVHlwZSkge1xuICBjb25zdCBwcCA9IFBBUkFNX1BBUlNFUlNbcGFyYW1UeXBlXTtcbiAgaWYgKCFwcCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwYXJhbSB0eXBlOiAke3BhcmFtVHlwZX1gKTtcbiAgfVxuICByZXR1cm4gcHA7XG59XG5cbi8qKlxuICogcGFyc2VEZXN0cnVjdHVyZWRQYXJhbSAtIFR1cm4gZGVzdHJ1Y3V0dXJlZCBwYXJhbWV0ZXJzIHRvIGEgbGlzdCBvZlxuICogc2ltcGxpZmllZCBwYXJhbWV0ZXJzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtIEFTVCByZXByZXNlbnRhdGlvbiBvZiBhIGRlc3RydWN0dXJlZCBub2RlIHBhcmFtZXRlclxuICpcbiAqIEByZXR1cm4ge2FycmF5fSBMaXN0IG9mIHNpbXBsaWZpZWQgcGFyYW1ldGVyc1xuICovXG5mdW5jdGlvbiBwYXJzZURlc3RydWN0dXJlZFBhcmFtKHsgcHJvcGVydGllcyB9KSB7XG4gIGNvbnN0IHByb3BzID0gcHJvcGVydGllcztcbiAgY29uc3QgcGFyZW50ID0gREVGQVVMVF9QQVJBTV9OQU1FO1xuXG4gIHJldHVybiBwcm9wc1xuICAgIC5yZWR1Y2UoKHBhcmFtcywgcGFyYW0pID0+IHtcbiAgICAgIGxldCB2YWx1ZSA9IHBhcmFtO1xuICAgICAgaWYgKHBhcmFtLnR5cGUgPT09ICdPYmplY3RQcm9wZXJ0eScpIHtcbiAgICAgICAgdmFsdWUgPSBwYXJhbS52YWx1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBwID0gZ2V0UGFyYW1QYXJzZXIodmFsdWUudHlwZSk7XG4gICAgICBjb25zdCBuZXdQYXJhbXMgPSBwcCh2YWx1ZSkubWFwKChwKSA9PiBPYmplY3QuYXNzaWduKHt9LCBwLCB7IHBhcmVudCB9KSk7XG4gICAgICByZXR1cm4gcGFyYW1zLmNvbmNhdChuZXdQYXJhbXMpO1xuICAgIH0sIFt7IG5hbWU6IHBhcmVudCwgdHlwZTogJ29iamVjdCcgfV0pO1xufVxuXG4vKipcbiAqIHNpbXBsaWZ5UGFyYW1zIC0gVGFrZSBhIGxpc3Qgb2YgcGFyYW1ldGVycyBhbmQgcmV0dXJuIGEgbGlzdCBvZiBzaW1wbGlmaWVkXG4gKiBwYXJhbWV0ZXJzIHRvIHJlcHJlc2VudCB0aGVtIGZvciBKUyBEb2MuXG4gKlxuICogQHBhcmFtIHthcnJheX0gcGFyYW1zIExpc3Qgb2YgQVNUIHJlcGVyZXNlbnRhdGlvbiBvZiBwYXJhbWV0ZXJzLlxuICpcbiAqIEByZXR1cm4ge2FycmF5fSBMaXN0IG9mIHNpbXBsaWZpZWQgcGFyYW1ldGVycyByZXByZXNlbnRhdGlvbiB0aGUgQVNUXG4gKiBwYXJhbWV0ZXJzLlxuICovXG5mdW5jdGlvbiBzaW1wbGlmeVBhcmFtcyhwYXJhbXMpIHtcbiAgcmV0dXJuIHBhcmFtcy5yZWR1Y2UoKGNvbCwgcGFyYW0pID0+IHtcbiAgICBjb25zdCBwcCA9IGdldFBhcmFtUGFyc2VyKHBhcmFtLnR5cGUpO1xuICAgIHJldHVybiBjb2wuY29uY2F0KHBwKHBhcmFtKSk7XG4gIH0sIFtdKTtcbn1cblxuLyoqXG4gKiBzaW1wbGlmeUxvY2F0aW9uIC0gVGFrZSB0aGUgbm9kZSBsb2NhdGlvbiBhbmQgcmV0dXJuIGp1c3QgYSBsaW5lIGFuZCBjb2x1bW4uXG4gKiBUaGlzIGlzIGludGVuZGVkIHRvIHJlcHJlc2VudCB3aGVyZSB0aGUgSlNEb2Mgd2lsbCBiZSBvdXRwdXQgKGkuZS4gb25lIGxpbmVcbiAqIGFib3ZlIHRoZSBmdW5jdGlvbilcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbG9jYXRpb24gQVNUIGZ1bmN0aW9uIG5vZGUgbG9jYXRpb25cbiAqXG4gKiBAcmV0dXJuIHtvYmplY3R9IExvY2F0aW9uIEFTVCBkb2Mgc2hvdWxkIGJlIG91dHB1dC5cbiAqL1xuZnVuY3Rpb24gc2ltcGxpZnlMb2NhdGlvbihsb2NhdGlvbikge1xuICByZXR1cm4ge1xuICAgIGxpbmU6IE1hdGgubWF4KGxvY2F0aW9uLnN0YXJ0LmxpbmUgLSAxLCAxKSxcbiAgICBjb2x1bW46IGxvY2F0aW9uLnN0YXJ0LmNvbHVtbixcbiAgfTtcbn1cblxuLyoqXG4gKiBzaW1wbGlmeU5vZGUgLSBUYWtlIHRoZSBBU1QgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGUgYW5kIHNpbXBsaWZ5XG4gKiBpdCB0byBnZXQganVzdCB0aGUgaW5mb3JtYXRpb24gd2UgbmVlZCBmb3IgZ2VuZXJhdGluZyBhIEpTIERvYy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbm9kZSBBU1QgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGUuXG4gKlxuICogQHJldHVybiB7b2JqZWN0fSBTaW1wbGlmaWVkIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlLlxuICovXG5mdW5jdGlvbiBzaW1wbGlmeU5vZGUobm9kZSkge1xuICBjb25zdCBqc0RvY1R5cGUgPSBub2RlLmpzRG9jVHlwZTtcbiAgY29uc3Qgc2ltcGxpZmllciA9IFNJTVBMSUZJRVJTW2pzRG9jVHlwZV07XG4gIGlmICghc2ltcGxpZmllcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBub2RlIHR5cGU6ICR7anNEb2NUeXBlfWApO1xuICB9XG5cbiAgY29uc3QgaWQgPSBub2RlLmlkIHx8IHt9O1xuICBjb25zdCBuYW1lID0gaWQubmFtZSB8fCAnVW5rbm93bic7XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe1xuICAgIG5hbWUsXG4gICAgbG9jYXRpb246IHNpbXBsaWZ5TG9jYXRpb24obm9kZS5sb2MpLFxuICAgIHR5cGU6IGpzRG9jVHlwZSxcbiAgfSwgc2ltcGxpZmllcihub2RlKSk7XG59XG5cbi8qKlxuICogc2ltcGxpZnlGdW5jTm9kZSAtIEV4dHJhY3QgZnVuY3Rpb24gc3BlY2lmaWMgSlMgRG9jIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG5vZGUgQVNUIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlLlxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gU2ltcGxpZmllZCByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZS5cbiAqL1xuZnVuY3Rpb24gc2ltcGxpZnlGdW5jTm9kZShub2RlKSB7XG4gIHJldHVybiB7XG4gICAgcGFyYW1zOiBzaW1wbGlmeVBhcmFtcyhub2RlLnBhcmFtcyksXG4gICAgcmV0dXJuczogeyByZXR1cm5zOiBmYWxzZSB9LFxuICB9O1xufVxuXG5cbi8qKlxuICogc2ltcGxpZnlDbGFzc01ldGhvZE5vZGUgLSBFeHRyYWN0IGNsYXNzTWV0aG9kIHNwZWNpZmljIEpTIERvYyBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSAge29iamVjdH0gbm9kZSBBU1QgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vZGUuXG4gKlxuICogQHJldHVybiB7dHlwZX0gICAgICBTaW1wbGlmaWVkIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlLlxuICovXG5mdW5jdGlvbiBzaW1wbGlmeUNsYXNzTWV0aG9kTm9kZShub2RlKSB7XG4gIHJldHVybiB7XG4gICAgcGFyYW1zOiBzaW1wbGlmeVBhcmFtcyhub2RlLnBhcmFtcyksXG4gICAgaXNTdGF0aWM6IG5vZGUuc3RhdGljLFxuICAgIHJldHVybnM6IHsgcmV0dXJuczogZmFsc2UgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBzaW1wbGlmeUNsYXNzTm9kZSAtIEV4dHJhY3QgdGhlIGNsYXNzIHNwZWNpZmljIEpTIERvYyBwcm9wZXJ0aWVzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG5vZGUgQVNUIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBub2RlLlxuICpcbiAqIEByZXR1cm4ge29iamVjdH0gU2ltcGxpZmllZCByZXByZXNlbnRhdGlvbiBvZiB0aGUgbm9kZS5cbiAqL1xuZnVuY3Rpb24gc2ltcGxpZnlDbGFzc05vZGUobm9kZSkge1xuICByZXR1cm4ge1xuICAgIGV4dGVuZHM6IChub2RlLnN1cGVyQ2xhc3MgfHwge30pLm5hbWUsXG4gIH07XG59XG5cbi8qKlxuICogcGFyc2UgLSBUYWtlIGNvZGUgYW5kIGEgbGluZSBudW1iZXIgYW5kIHJldHVybiBhbiBvYmplY3QgcmVwcmVzZW50aW5nIGFsbFxuICogcHJvcGVydGllcyBvZiB0aGUgZnVuY3Rpb24gb3IgY2xhc3MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvZGUgICAgICAgIENvbXBsZXRlIGZpbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGluZU51bT0xXSBMaW5lIG51bWJlciB3aGVyZSB0aGUgY3Vyc29yIGlzIGxvY2F0ZWQgYW5kIHdoZXJlXG4gKiB3ZSB3aWxsIGxvb2sgZm9yIHRoZSBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIG9iamVjdCBmb3IuXG4gKlxuICogQHJldHVybiB7b2JqZWN0fSBTaW1wbGlmaWVkIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoY29kZSwgbGluZU51bSA9IDEpIHtcbiAgY29uc3QgYXN0ID0gZ2V0QVNUKGNvZGUpO1xuICBjb25zdCBub2RlID0gZ2V0Tm9kZShhc3QsIGxpbmVOdW0pO1xuICBpZiAoIW5vZGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHNpbXBsaWZpZWQgPSBzaW1wbGlmeU5vZGUobm9kZSk7XG5cbiAgcmV0dXJuIHNpbXBsaWZpZWQ7XG59XG4iXX0=