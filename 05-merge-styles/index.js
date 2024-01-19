const { readdir, readFile, writeFile } = require('node:fs/promises');
const path = require('path');

const filesPath = path.join(__dirname, 'styles');
const outputPath = path.join(__dirname, 'project-dist', 'bundle.css');

readdir(filesPath, { withFileTypes: true })
  .then((files) => {
    return files.filter(file => {
      const extension = path.extname(path.join(filesPath, file.name));
      return file.isFile() && extension === '.css';
    });
  })
  .then((files) => {
    const filesPromises = files.map((file) => readFile(path.join(filesPath, file.name), 'utf-8'));
    return Promise.all(filesPromises);
  })
  .then((filesContents) => {
    return filesContents.join('\n/*<=======================================>*/\n');
  })
  .then((allStyles) => {
    return writeFile(outputPath, allStyles, 'utf-8');
  })
  .then(() => {
    console.log('Styles compiled successfully. Output file: ', outputPath);
  })
  .catch((error) => {
    console.error('Error compiling styles:', error);
  });