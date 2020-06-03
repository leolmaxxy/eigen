// @ts-check

const Lint = require("tslint")
const tsutils = require("tsutils")
const ts = require("typescript")
const { isBinaryExpression } = require("typescript")

const FAILURE_STRING = "Please use safe conditional expressions in JSX 🙏"
class Rule extends Lint.Rules.AbstractRule {
  /**
   * @param {ts.SourceFile} sourceFile
   * @returns {Lint.RuleFailure[]}
   */
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk)
  }
}
module.exports.Rule = Rule

/**
 * @param {ts.Node} node
 */
function isJsxContext(node) {
  if (tsutils.isJsxAttribute(node)) {
    return false
  } else if (tsutils.isJsxElement(node)) {
    return true
  } else {
    if (node.parent) {
      return isJsxContext(node.parent)
    }
  }
}

/**
 * @param {ts.Node} node
 */
function isBooleanExpression(node) {
  return (
    node.getFullText().match(/^(\!|Boolean\()/) ||
    (tsutils.isBinaryExpression(node) &&
      ([
        ts.SyntaxKind.GreaterThanEqualsToken,
        ts.SyntaxKind.GreaterThanToken,
        ts.SyntaxKind.LessThanEqualsToken,
        ts.SyntaxKind.LessThanToken,
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.SyntaxKind.EqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
      ].includes(node.operatorToken.kind) ||
        (isBooleanExpression(node.left) && isBooleanExpression(node.right))))
  )
}

/**
 * @param {ts.Node} node
 */
function isWithinBooleanExpression(node) {
  if (node.parent) {
    if (isBooleanExpression(node.parent)) {
      return true
    }
    return isWithinBooleanExpression(node.parent)
  }
  return false
}

/**
 *
 * @param {Lint.WalkContext<void>} ctx
 */
function walk(ctx) {
  /**
   * @param {ts.Node} node
   */
  function cb(node) {
    if (
      tsutils.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
      isJsxContext(node) &&
      !isBooleanExpression(node.left) &&
      !isWithinBooleanExpression(node)
    ) {
      ctx.addFailureAt(
        node.getStart(),
        node.getWidth(),
        FAILURE_STRING,
        new Lint.Replacement(
          node.left.getStart(),
          node.left.getWidth(),
          isBinaryExpression(node.left) ? `!!(${node.left.getFullText()})` : `!!${node.left.getFullText()}`
        )
      )
      return
    }

    return ts.forEachChild(node, cb)
  }

  return ts.forEachChild(ctx.sourceFile, cb)
}
