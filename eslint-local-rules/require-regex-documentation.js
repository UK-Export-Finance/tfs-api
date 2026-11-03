module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce JSDoc documentation on all regex constants',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingRegexDoc: 'All regex constants must have JSDoc documentation.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;

    /**
     * Check if a node is a RegExp constructor call (new or direct)
     */
    function isRegExpConstructor(node) {
      if (!node) {
        return false;
      }

      // new RegExp(...) or RegExp(...)
      if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'RegExp') {
        return node.type === 'NewExpression' || node.type === 'CallExpression';
      }

      return false;
    }

    /**
     * Check if a node is a regex pattern assignment
     */
    function isRegexAssignment(initNode) {
      if (!initNode) {
        return false;
      }

      // Direct regex literal: /pattern/
      if (initNode.type === 'Literal' && initNode.regex) {
        return true;
      }

      // RegExp constructor: new RegExp(...) or RegExp(...)
      if (isRegExpConstructor(initNode)) {
        return true;
      }

      // Arrow function returning RegExp: () => /pattern/ or () => new RegExp(...) or () => RegExp(...)
      if (initNode.type === 'ArrowFunctionExpression' && initNode.body) {
        if (initNode.body.type === 'Literal' && initNode.body.regex) {
          return true;
        }

        if (isRegExpConstructor(initNode.body)) {
          return true;
        }
      }

      return false;
    }

    /**
     * Check if a value node is a regex pattern
     */
    function isRegexValue(valueNode) {
      if (!valueNode) {
        return false;
      }

      // Direct regex literal: /pattern/
      if (valueNode.type === 'Literal' && valueNode.regex) {
        return true;
      }

      // RegExp constructor: new RegExp(...) or RegExp(...)
      if (isRegExpConstructor(valueNode)) {
        return true;
      }

      // Arrow function returning RegExp: () => /pattern/ or () => new RegExp(...) or () => RegExp(...)
      if (valueNode.type === 'ArrowFunctionExpression' && valueNode.body) {
        if (valueNode.body.type === 'Literal' && valueNode.body.regex) {
          return true;
        }

        if (isRegExpConstructor(valueNode.body)) {
          return true;
        }
      }

      return false;
    }

    /**
     * Get the declaration node for comment retrieval
     */
    function getCommentParent(varNode) {
      const varDeclaration = varNode.parent;

      if (!varDeclaration || varDeclaration.type !== 'VariableDeclaration') {
        return null;
      }

      const exportNode = varDeclaration.parent;

      return exportNode?.type === 'ExportNamedDeclaration' || exportNode?.type === 'ExportDefaultDeclaration' ? exportNode : varDeclaration;
    }

    /**
     * Check if node has JSDoc comment
     */
    function hasJsDoc(commentParent) {
      if (!commentParent) {
        return false;
      }

      const comments = sourceCode.getCommentsBefore(commentParent);
      return comments.some((comment) => comment.type === 'Block' && comment.value.startsWith('*'));
    }

    /**
     * Check if a property has JSDoc comment (checks comments before the property)
     */
    function hasPropertyJsDoc(propertyNode) {
      const comments = sourceCode.getCommentsBefore(propertyNode);
      return comments.some((comment) => comment.type === 'Block' && comment.value.startsWith('*'));
    }

    /**
     * Find the top-level variable declaration or property node that owns a regex node
     */
    function findOwningDeclaration(node) {
      let current = node;

      while (current) {
        const parent = current.parent;

        // Stop at VariableDeclarator
        if (parent && parent.type === 'VariableDeclarator') {
          return parent;
        }

        // Stop at Property
        if (parent && parent.type === 'Property') {
          return parent;
        }

        // Stop at ExportNamedDeclaration or ExportDefaultDeclaration
        if (parent && (parent.type === 'ExportNamedDeclaration' || parent.type === 'ExportDefaultDeclaration')) {
          return parent;
        }

        // Skip through ArrayExpression, ArrowFunctionExpression body, and BlockStatement
        if (
          parent &&
          (parent.type === 'ArrayExpression' ||
            (parent.type === 'ArrowFunctionExpression' && parent.body) ||
            parent.type === 'BlockStatement' ||
            parent.type === 'ReturnStatement')
        ) {
          current = parent;
        } else {
          break;
        }
      }

      return null;
    }

    /**
     * Check if a regex node (literal or constructor) has documentation
     */
    function reportUndocumentedRegex(node) {
      const owningDecl = findOwningDeclaration(node);

      if (!owningDecl) {
        return;
      }

      // For VariableDeclarator, check the comment parent
      if (owningDecl.type === 'VariableDeclarator') {
        const commentParent = getCommentParent(owningDecl);

        if (!hasJsDoc(commentParent)) {
          context.report({
            node,
            messageId: 'missingRegexDoc',
          });
        }

        return;
      }

      // For Property, check directly
      if (owningDecl.type === 'Property') {
        if (!hasPropertyJsDoc(owningDecl)) {
          context.report({
            node,
            messageId: 'missingRegexDoc',
          });
        }
      }
    }

    return {
      VariableDeclarator(node) {
        // Check if this is a regex assignment
        if (!isRegexAssignment(node.init)) {
          return;
        }

        // Get the parent node for comment checking
        const commentParent = getCommentParent(node);

        // Report if no JSDoc found
        if (!hasJsDoc(commentParent)) {
          context.report({
            node,
            messageId: 'missingRegexDoc',
          });
        }
      },

      Property(node) {
        // Only check properties with regex values
        if (!isRegexValue(node.value)) {
          return;
        }

        // Check if the property has JSDoc documentation
        if (!hasPropertyJsDoc(node)) {
          context.report({
            node,
            messageId: 'missingRegexDoc',
          });
        }
      },

      Literal(node) {
        // Check for regex literals: /pattern/
        if (node.regex) {
          reportUndocumentedRegex(node);
        }
      },

      CallExpression(node) {
        // Check for RegExp(...) constructor calls
        if (isRegExpConstructor(node)) {
          reportUndocumentedRegex(node);
        }
      },

      NewExpression(node) {
        // Check for new RegExp(...) constructor calls
        if (isRegExpConstructor(node)) {
          reportUndocumentedRegex(node);
        }
      },
    };
  },
};
