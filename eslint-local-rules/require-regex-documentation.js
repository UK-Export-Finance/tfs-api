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
    };
  },
};
