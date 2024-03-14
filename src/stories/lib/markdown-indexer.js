import { readFile } from 'fs/promises';
import { getMetaDataFromMd } from './markdown-to-csf.js';

/** @type {import ('@storybook/types').Indexer} */
export const markdownIndexer = {
  test: /.md$/,
  createIndex: async (fileName, { makeTitle }) => {
    const markdownContent = await readFile(fileName, { encoding: 'utf-8' });

    const { title, subtitle } = getMetaDataFromMd(markdownContent);

    /** @type {import('@storybook/types').IndexInput} */
    const indexInput = {
      type: 'docs',
      importPath: fileName,
      // we tell storybook to import a story named "docs" so that it is considered as
      // a "docs only" story. This solution is unofficial / undocumented.
      exportName: 'docs',
      title: makeTitle(title),
      name: subtitle,
      /**
        * This makes storybook think an auto generated doc will be associated to this story.
        * Usually this tag is to be added within the default export of a CSF file.
        * The default export would then be processed by `csfIndexers` and added to the
        * index input, here.
        * Since CSF files for markdown files are actually generated on the fly (virtual files),
        * we hard code the tag here and we don't need to set `tags: ['autodocs']` within the virtual file.
        * We override the autogenerated docs page with our own doc generated from our markdown file
        * (see `/src/stories/lib/markdown-to-csf.js`).
      */
      tags: ['autodocs'],
    };

    return [indexInput];
  },
};