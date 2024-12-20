// TODO: ignored component, ignore story, ignore a11y rule
import { readFileSync } from 'fs';
import { join } from 'path';

export const testStoryPlugin = {
  name: 'test-story',
  async serve(context) {
    if (context.path.endsWith('stories.source.js')) {
      const storyFilePath = join(process.cwd(), context.path.replace('.source', ''));
      const storyFileSource = readFileSync(storyFilePath, { encoding: 'utf-8' });

      return storyFileSource;
    }
  },
  async transform(context) {
    if (!context.path.endsWith('.stories.js')) {
      return;
    }

    const testFileContent = `
      import { testStories } from '/test/helpers/test-stories.js';
      import * as storiesModule from '${context.path.replace('.js', '.source.js')}';

      testStories(storiesModule);
    `;

    return testFileContent;
  },
};
