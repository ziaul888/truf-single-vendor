// Static migration inventory; review delegated queries and service-level authorization separately.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const api = fileURLToPath(new URL("../../turf-api/", import.meta.url));
const output = fileURLToPath(new URL("../docs/", import.meta.url));
const schema = fs.readFileSync(path.join(api, "prisma/schema.prisma"), "utf8");
const models = new Map(
  Array.from(schema.matchAll(/^model (\w+) \{/gm), (m) => [
    m[1][0].toLowerCase() + m[1].slice(1),
    m[1],
  ])
);
const platform = new Set(["User", "Tenant", "TenantMembership"]);
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? e.name === "generated"
          ? []
          : files(path.join(dir, e.name))
        : [path.join(dir, e.name)]
    );
}
function decorators(node) {
  return ts.canHaveDecorators(node) ? ts.getDecorators(node) || [] : [];
}
function decorator(node, name) {
  return decorators(node).find(
    (d) => ts.isCallExpression(d.expression) && d.expression.expression.getText() === name
  )?.expression;
}
function args(node, name) {
  return (
    decorator(node, name)
      ?.arguments.map((a) => (ts.isStringLiteral(a) ? a.text : a.getText()))
      .join(" + ") || ""
  );
}
const routes = [["file", "line", "method", "path", "guards", "roles"]];
const queries = [["file", "line", "model", "operation", "proposed_ownership"]];
for (const file of files(path.join(api, "src")).filter(
  (f) => f.endsWith(".ts") && !f.endsWith(".spec.ts")
)) {
  const text = fs.readFileSync(file, "utf8"),
    source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const relative = path.relative(api, file);
  function walk(node) {
    if (ts.isClassDeclaration(node) && decorator(node, "Controller")) {
      const prefix = args(node, "Controller");
      for (const member of node.members) {
        if (!ts.isMethodDeclaration(member)) continue;
        const method = ["Get", "Post", "Patch", "Put", "Delete"].find((name) =>
          decorator(member, name)
        );
        if (!method) continue;
        const endpoint = ("/api/v1/" + prefix + "/" + args(member, method))
          .replace(/\/+$/, "")
          .replace(/\/{2,}/g, "/");
        routes.push([
          relative,
          source.getLineAndCharacterOfPosition(member.getStart()).line + 1,
          method.toUpperCase(),
          endpoint,
          [args(node, "UseGuards"), args(member, "UseGuards")].filter(Boolean).join(" + "),
          [args(node, "Roles"), args(member, "Roles")].filter(Boolean).join(" + "),
        ]);
      }
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const access = node.expression,
        operation = access.name.text,
        target = access.expression;
      let model = ts.isPropertyAccessExpression(target) ? models.get(target.name.text) : undefined;
      if (
        relative === "src/tenants/tenant-access.ts" &&
        target.getText() === "reader" &&
        operation === "findUnique"
      )
        model = "TenantMembership";
      if (model)
        queries.push([
          relative,
          source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          model,
          operation,
          platform.has(model)
            ? "platform identity/control-plane"
            : model === "SystemState"
              ? "split tenant/infrastructure"
              : "tenant",
        ]);
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
}
const csv = (rows) =>
  rows
    .map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(","))
    .join("\n") + "\n";
fs.writeFileSync(path.join(output, "tenant-foundation-routes.csv"), csv(routes));
fs.writeFileSync(path.join(output, "tenant-foundation-queries.csv"), csv(queries));
console.log(
  JSON.stringify({
    models: models.size,
    routes: routes.length - 1,
    queryCallSites: queries.length - 1,
  })
);
