import chalk from 'chalk';
import { promises as fs } from 'fs';
import rawGlob from 'glob';
import { extractFromCode } from 'i18n-extract';
import table from 'text-table';
import util from 'util';
import { translations as en } from '../src/translations/translations.en.js';
import { translations as fr } from '../src/translations/translations.fr.js';

const glob = util.promisify(rawGlob);
const translationsByLang = { en, fr };

async function getUsedKeys(sourceFilepaths) {
  const usedKeysByFile = {};
  for (const src of sourceFilepaths) {
    const code = await fs.readFile(src, 'utf8');
    const keys = extractFromCode(code, { marker: 'i18n' });
    usedKeysByFile[src] = keys.map(({ key }) => key);
  }
  return usedKeysByFile;
}

async function run() {
  const startTime = process.hrtime();

  let errors = false;
  const allMissingKeys = new Map();
  const allUnusedKeys = new Map();

  const sourceFilepaths = await glob('./src/**/*.js', {
    ignore: ['./src/lib/*.js', './src/styles/*.js', './src/translations/*.js'],
  });

  const usedKeysByFile = await getUsedKeys(sourceFilepaths);

  console.log(chalk.bgWhite.black.bold(`\n ⌛ Checking translations for ${sourceFilepaths.length} files... `));

  // MISSING KEYS
  sourceFilepaths.forEach((src) => {
    Object.entries(translationsByLang).forEach(([lang, translations]) => {
      const missingKeys = usedKeysByFile[src].filter((key) => translations[key] == null);

      if (missingKeys.length !== 0) {
        errors = true;

        missingKeys.forEach((key) => {
          if (!allMissingKeys.has(key)) {
            allMissingKeys.set(key, new Set());
          }
          allMissingKeys.set(key, allMissingKeys.get(key).add(lang));
        });
      }
    });
  });

  const hasMissingKeys = allMissingKeys.size !== 0;
  if (hasMissingKeys) {
    console.log(chalk.bgRed.bold(`\n ⛔ ${allMissingKeys.size} keys are missing `));

    const formattedMissingKeys = [];
    allMissingKeys.forEach((values, key) => {
      formattedMissingKeys.push(['> ' + key, [...values].join(',')]);
    });
    console.log(table(formattedMissingKeys));
  }

  // UNUSED KEYS
  const allUsedKeys = Object.values(usedKeysByFile).flat();

  Object.entries(translationsByLang).forEach(([lang, translations]) => {
    const translationsKeys = Object.keys(translations);

    const unusedKeys = translationsKeys.filter((key) => !allUsedKeys.includes(key));

    if (unusedKeys.length !== 0) {
      errors = true;

      unusedKeys.forEach((key) => {
        if (!allUnusedKeys.has(key)) {
          allUnusedKeys.set(key, new Set());
        }
        allUnusedKeys.set(key, allUnusedKeys.get(key).add(lang));
      });
    }
  });

  const hasUnusedKeys = allUnusedKeys.size !== 0;
  if (hasUnusedKeys) {
    console.log(chalk.bgYellow.black.bold(`\n ⚠️  ${allUnusedKeys.size} keys are unused `));

    const formattedUnusedKeys = [];
    allUnusedKeys.forEach((values, key) => {
      formattedUnusedKeys.push(['> ' + key, [...values].join(',')]);
    });
    console.log(table(formattedUnusedKeys));
  }

  // no error message
  if (!hasMissingKeys && !hasUnusedKeys) {
    console.log(chalk.bgGreen.bold(` 🎉 No keys were found missing or unused! `));
  }

  // script duration
  const elapsedTime = process.hrtime(startTime);
  const durationInSeconds = (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed(2);
  console.log(chalk.italic(`\nDone in ${durationInSeconds}s.`));

  // fail task when errors
  if (errors) {
    process.exit(1);
  }
}

run().catch(console.error);
