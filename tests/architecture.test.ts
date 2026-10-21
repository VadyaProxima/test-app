/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const segmentedLayers = new Set(['app', 'shared']);
const display = (file: string) =>
  relative(sourceRoot, file).replaceAll('\\', '/');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.tsx?$/.test(path)
        ? [path]
        : [];
  });
}

type Location = { layer: string; unit: string; legacy: boolean };
function location(file: string): Location {
  const [layer, unit = ''] = display(file).split('/');
  return { layer, unit, legacy: layer === 'components' };
}

type Dependency = {
  from: string;
  specifier: string;
  runtime: boolean;
  target?: string;
};

function resolveSource(from: string, specifier: string): string | undefined {
  let base: string;
  if (specifier.startsWith('.')) base = resolve(dirname(from), specifier);
  else if (specifier.startsWith('src/'))
    base = resolve(sourceRoot, specifier.slice(4));
  else if (specifier.startsWith('@/'))
    base = resolve(sourceRoot, specifier.slice(2));
  else return undefined;
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ].find((candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate));
}

function dependencies(file: string): Dependency[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const result: Dependency[] = [];
  const add = (specifier: string, runtime: boolean) => {
    result.push({
      from: file,
      specifier,
      runtime,
      target: resolveSource(file, specifier),
    });
  };
  function visit(node: ts.Node) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const onlyNamedTypes =
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length > 0 &&
        bindings.elements.every((element) => element.isTypeOnly);
      add(
        node.moduleSpecifier.text,
        !clause?.isTypeOnly && (!onlyNamedTypes || !!clause?.name),
      );
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const onlyNamedTypes =
        node.exportClause &&
        ts.isNamedExports(node.exportClause) &&
        node.exportClause.elements.length > 0 &&
        node.exportClause.elements.every((element) => element.isTypeOnly);
      add(node.moduleSpecifier.text, !node.isTypeOnly && !onlyNamedTypes);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      add(node.arguments[0].text, true);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

const files = sourceFiles(sourceRoot);
const imports = files.flatMap(dependencies);
const isLocal = (specifier: string) =>
  specifier.startsWith('.') ||
  specifier.startsWith('src/') ||
  specifier.startsWith('@/');

test('all local source imports resolve and production files belong to FSD layers', () => {
  const errors: string[] = [];
  for (const file of files) {
    const source = location(file);
    if (
      !source.legacy &&
      (!layers.includes(source.layer) ||
        !source.unit ||
        !display(file).includes('/'))
    ) {
      errors.push(`${display(file)}: place production code in an FSD layer`);
    }
  }
  for (const dependency of imports) {
    if (isLocal(dependency.specifier) && !dependency.target) {
      errors.push(
        `${display(dependency.from)}: unresolved ${dependency.specifier}`,
      );
    }
  }
  assert.deepEqual(errors, []);
});

test('FSD imports point down layers and use public slice or segment indexes', () => {
  const errors: string[] = [];
  for (const { from, target } of imports) {
    if (!target) continue;
    const source = location(from);
    const destination = location(target);
    // These files intentionally remain as compatibility forwarders at the user's request.
    if (source.legacy) continue;
    const edge = `${display(from)} -> ${display(target)}`;
    if (destination.legacy) {
      errors.push(
        `${edge}: production code must not depend on compatibility components`,
      );
      continue;
    }
    const sourceRank = layers.indexOf(source.layer);
    const targetRank = layers.indexOf(destination.layer);
    if (sourceRank < 0 || targetRank < 0) continue; // Reported by the structure test.
    if (targetRank < sourceRank) {
      errors.push(`${edge}: imports must point down layers`);
      continue;
    }
    const sameLayer = source.layer === destination.layer;
    if (
      sameLayer &&
      !segmentedLayers.has(source.layer) &&
      source.unit !== destination.unit
    ) {
      errors.push(`${edge}: slices in one layer are isolated`);
      continue;
    }
    const sameUnit =
      sameLayer && (source.layer === 'app' || source.unit === destination.unit);
    if (sameUnit) continue;
    const publicIndex = `${destination.layer}/${destination.unit}/index.ts`;
    if (
      display(target) !== publicIndex &&
      display(target) !== publicIndex.replace(/\.ts$/, '.tsx')
    ) {
      errors.push(`${edge}: import through ${publicIndex}`);
    }
  }
  assert.deepEqual(errors, []);
});

test('runtime source dependencies have no cycles', () => {
  const graph = new Map(files.map((file) => [file, [] as string[]]));
  for (const { from, target, runtime } of imports) {
    if (target && runtime && graph.has(target)) graph.get(from)!.push(target);
  }
  const visited = new Set<string>();
  const active = new Set<string>();
  const stack: string[] = [];
  const cycles: string[] = [];
  function visit(file: string) {
    if (active.has(file)) {
      cycles.push(
        [...stack.slice(stack.indexOf(file)), file].map(display).join(' -> '),
      );
      return;
    }
    if (visited.has(file)) return;
    active.add(file);
    stack.push(file);
    for (const dependency of graph.get(file) ?? []) visit(dependency);
    stack.pop();
    active.delete(file);
    visited.add(file);
  }
  for (const file of files) visit(file);
  assert.deepEqual(cycles, []);
});
