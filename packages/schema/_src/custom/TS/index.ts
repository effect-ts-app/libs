import ts from "typescript"

export default function augmentName(_program: ts.Program) {
  const checker = _program.getTypeChecker()

  return {
    before(ctx: ts.TransformationContext) {
      const { factory } = ctx

      return (sourceFile: ts.SourceFile) => {
        function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
          if (
            ts.isCallExpression(node) &&
            ts.isCallExpression(node.expression) &&
            node.expression.typeArguments &&
            node.expression.typeArguments.length === 1 &&
            node.expression.arguments.length === 0
          ) {
            const signature = checker.getResolvedSignature(node.expression)

            if (
              signature &&
              signature
                .getJsDocTags()
                .findIndex(
                  (_) =>
                    _.name === "inject" && _.text?.map((_) => _.text === "genericName")
                ) !== -1 &&
              signature?.parameters.length === 1 &&
              signature?.parameters[0].name === "__name"
            ) {
              const typeNode = node.expression.typeArguments[0]
              if (ts.isTypeReferenceNode(typeNode)) {
                return ts.visitEachChild(
                  factory.updateCallExpression(
                    node,
                    factory.updateCallExpression(
                      node.expression,
                      node.expression.expression,
                      node.expression.typeArguments,
                      [factory.createStringLiteral(typeNode.typeName.getText())]
                    ),
                    node.typeArguments,
                    node.arguments
                  ),
                  visitor,
                  ctx
                )
              }
            }
          }

          return ts.visitEachChild(node, visitor, ctx)
        }

        return ts.visitEachChild(sourceFile, visitor, ctx)
      }
    },
  }
}
