// From: <https://github.com/nodejs-mobile/nodejs-mobile-cordova/blob/6cd38b0abc86f0acdbc3e899b36937abf906b119/install/helper-scripts/override-dlopen-paths-preload.js>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const substitutionDataFile = path.join(__dirname, 'override-dlopen-paths-data.json');
// If the json file exists, override dlopen to load the specified framework paths instead.
if (fs.existsSync(substitutionDataFile)) {
  const pathSubstitutionData = JSON.parse(fs.readFileSync(substitutionDataFile, 'utf8'));

  const pathSubstitutionDictionary = {};
  // Build a dictionary to convert paths at runtime, taking current sandboxed paths into account.
  for (let i = 0; i < pathSubstitutionData.length; i++) {
    pathSubstitutionDictionary[
      path.normalize(path.join.apply(null, [__dirname].concat(pathSubstitutionData[i].originalpath)))
    ] = path.normalize(path.join.apply(null, [__dirname].concat(pathSubstitutionData[i].newpath)));
  }

  const old_dlopen = process.dlopen;
  // Override process.dlopen
  process.dlopen = function(_module, _filename) {
    if (pathSubstitutionDictionary[path.normalize(_filename)]) {
      _filename = pathSubstitutionDictionary[path.normalize(_filename)];
    }
    old_dlopen(_module, _filename);
  }
}
