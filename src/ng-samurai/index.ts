import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { getLibRootPath, getName } from '../shared/pathHelper';
import { submodule } from '../submodule/index';
import { updateImportPaths } from '../rules/update-import-paths.rule';
import { addTsconfigPaths } from '../rules/add-tsconfig-paths.rule';
import { updateSubentryPublicAPI } from '../rules/update-public-api/update-subentry-public-api.rule';
import { updateTopLevelPublicAPI } from '../rules/update-public-api/update-top-level-public-api.rule';

export function ngSamurai(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const libRootPath = getLibRootPath(tree);

    const rules: Rule[] = [];
    const modulePaths: string[] = [];

    tree.getDir(libRootPath).visit(filePath => {
      if (filePath.endsWith('.ts')) {
        rules.push(updateImportPaths(filePath));
      }

      if (filePath.endsWith('module.ts')) {
        modulePaths.push(filePath);

        rules.push(
          submodule({
            name: getName(filePath),
            filesPath: '../submodule/files',
            path: libRootPath,
            generateComponent: false,
            generateModule: false
          })
        );
        rules.push(updateSubentryPublicAPI(filePath));
      }
    });
    rules.push(updateTopLevelPublicAPI(modulePaths));
    rules.push(addTsconfigPaths());
    return chain(rules);
  };
}
