import { readFileSync } from 'fs';
import path from 'path';
import {
  convertInterface,
  findInterfacesFromExtends,
  findPathAndTypesFromImports,
  findSubtypes,
  findTypePath,
  getTypesFromClass,
} from './support-typedef-jsdoc-utils.js';

const ROOT_DIR = process.cwd();

export default function supportTypedefJsdoc() {
  // Map that contains a `type-path` as a key and has its markdown interface as a value.
  const typesStore = new Map();
  // Map that contains for a type file path the corresponding AST and code as a string.
  // e.g: {'projectfolder/src/component/x.d.ts' => {code: thesourcecode, ast: theast}}
  const fileCache = new Map();
  // Foreach component it retrieves the correct file component and the types associated
  // e.g: {'projectfolder/src/component/x.d.ts' => [foo, bar],  'projectfolder/src/component/y.d.ts' => [foobar, baz]}
  const moduleTypeCache = new Map();

  function convertImports(ts, imports) {
    const markdownInterfaces = [];

    // type-cc-x.d.ts => [Foo, Bar...]
    imports.forEach((typesSet, filename) => {
      let sourceCode;
      let sourceAst;

      const inMemoryType = fileCache.get(filename);
      if (inMemoryType == null) {
        try {
          sourceCode = readFileSync(filename).toString();
        } catch (e) {
          console.error(e);
          return;
        }
        sourceAst = ts.createSourceFile(filename, sourceCode, ts.ScriptTarget.ES2015, true);
        fileCache.set(filename, { code: sourceCode, ast: sourceAst });
      } else {
        sourceCode = inMemoryType.code;
        sourceAst = inMemoryType.ast;
      }

      const typesFromSet = Array.from(typesSet);
      // Find the imports and their associated types in the parent file
      const interfaceImports = findPathAndTypesFromImports(ts, filename);

      interfaceImports.forEach((interfaceImport) => {
        let importSourceCode;
        try {
          importSourceCode = readFileSync(interfaceImport.path).toString();
        } catch (e) {
          console.error(e);
          return;
        }
        // We append the source code of the parent type file with the source code of the imports
        sourceCode += importSourceCode;
      });
      // Then we create an AST with this big source code with all the interfaces
      sourceAst = ts.createSourceFile('ast', sourceCode, ts.ScriptTarget.ES2015, true);

      // Find the subtypes for base types.
      const subtypes = findSubtypes(ts, sourceAst, typesFromSet);
      typesFromSet.push(...subtypes);

      const foundExtends = findInterfacesFromExtends(ts, sourceAst);
      foundExtends.forEach((fromExtend) => {
        // We need to take the interfaces that are extended from an interface we need and their relatives.
        // Imagine we need Foo, and it extends Bar, we will add Bar to our types needed.
        // But if Bar itself extends Baz we will also add Baz as its related to Bar that we need.
        if (typesFromSet.includes(fromExtend.interface)) {
          typesFromSet.push(fromExtend.extends, ...fromExtend.relatives);
        }
      });

      // Find the subtypes for the extended interfaces
      const subTypesFromExt = findSubtypes(ts, sourceAst, typesFromSet);
      typesFromSet.push(...subTypesFromExt);

      const filteredTypes = Array.from(new Set(typesFromSet));

      filteredTypes.forEach((type) => {
        if (typesStore.has(`${type}-${filename}`)) {
          markdownInterfaces.push(typesStore.get(`${type}-${filename}`));
        } else {
          const typeDisplay = convertInterface(ts, sourceAst, sourceCode, type, filename);
          if (typeDisplay != null) {
            markdownInterfaces.push(typeDisplay);
            typesStore?.set(`${type}-${filename}`, typeDisplay);
          }
        }
      });
    });

    return markdownInterfaces.join('\n');
  }

  return {
    name: 'support-typedef-jsdoc',
    analyzePhase({ ts, node, moduleDoc }) {
      // First, we need to find the constructor
      // It can be found as a member of ClassDeclaration

      // If the node we loop through is not a ClassDeclaration we don't go any further
      // as we only want access to the constructor and JSDoc above the class to find the imports.
      if (node.kind !== ts.SyntaxKind.ClassDeclaration) {
        return;
      }

      // New module so we clear the cache for that module.
      moduleTypeCache.clear();

      const componentName = node.name.escapedText;
      // console.log(`\n⌛ Generating docs for ${componentName}`);

      const types = getTypesFromClass(node, ts);

      if (types.length === 0) {
        // console.info('✅ Successfully generated documentation.');
        return;
      }

      // This finds the comment where the imports are located
      const typeDefNode = node?.jsDoc?.filter((node) =>
        node.tags?.find((tag) => tag.kind === ts.SyntaxKind.JSDocTypedefTag),
      )?.[0];

      const moduleDir = path.parse(moduleDoc.path).dir;

      // Check the jsDoc of the class and find the imports
      typeDefNode?.tags?.forEach((tag) => {
        // Extract the path from the @typedef import
        const typePath = findTypePath(tag, ROOT_DIR, moduleDir);

        // If an import is not correct, warn the plugin user.
        if (typePath == null) {
          console.warn(`There's a problem with one of your @typedef - ${tag.getText()}`);
          process.exitCode = 1;
          return;
        }

        // Extract the type from the @typedef import
        const typeDefDisplay = tag.name.getText();

        const type = types.find((type) => type === typeDefDisplay);

        if (type != null) {
          if (!moduleTypeCache.has(typePath)) {
            moduleTypeCache.set(typePath, new Set());
          }
          moduleTypeCache.get(typePath).add(type);
        }
      });

      // Now that we have the types, and the path of where the types are located
      // We can convert the imports to md types
      const convertedImports = convertImports(ts, moduleTypeCache);
      const displayText = convertedImports ? '### Type Definitions\n\n' + convertedImports : '';
      const declaration = moduleDoc.declarations.find((declaration) => declaration.name === node.name.getText());

      declaration.description = declaration.description + '\n\n' + displayText;

      // console.info('✅ Successfully generated documentation.');
    },
  };
}
