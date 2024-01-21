const { readdir, readFile, writeFile, mkdir, copyFile, rm, lstat } = require('node:fs/promises');
const path = require('path');
const rootDir = __dirname;
const templateFilePath = path.join(rootDir, 'template.html');
const projectDistPath = path.join(rootDir, 'project-dist');
const indexFilePath = path.join(projectDistPath, 'index.html');
const stylesPath = path.join(rootDir, 'styles');
const assetsPath = path.join(rootDir, 'assets');
const destinationAssetsPath = path.join(projectDistPath, 'assets');
const stylesOutputPath = path.join(projectDistPath, 'style.css');

function ensureDirectoryExists(directory) {
  return mkdir(directory, { recursive: true })
    .then(() => console.log(`Directory created successfully: ${directory}`))
    .catch(error => console.error(`Error creating directory ${directory}: ${error.message}`));
}

function readTemplate() {
  return readFile(templateFilePath, 'utf-8')
    .then(templateContent => templateContent)
    .catch(error => { throw new Error(`Error reading template file: ${error.message}`) });
}

function findTags(templateContent) {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = templateContent.match(regex);
  if (!matches) return [];
  return matches.map(match => match.replace('{{', '').replace('}}', ''));
}

function replaceTagsWithComponents(templateContent, tags) {
  return tags.reduce((promise, tag) => {
    const componentPath = path.join(rootDir, 'components', `${tag}.html`);
    return promise.then(() => readFile(componentPath, 'utf-8'))
      .then(componentContent => {
        const regex = new RegExp(`\\{\\{${tag}\\}\\}`, 'g');
        templateContent = templateContent.replace(regex, componentContent);
      });
  }, Promise.resolve())
    .then(() => templateContent);
}

function buildHTMLFile() {
  return ensureDirectoryExists(projectDistPath)
    .then(() => readTemplate())
    .then(templateContent => {
      const tags = findTags(templateContent);
      return replaceTagsWithComponents(templateContent, tags);
    })
    .then(modifiedTemplate => writeFile(indexFilePath, modifiedTemplate, 'utf-8'))
    .then(() => console.log('index.html created successfully.'))
    .catch(error => console.error(`Error building HTML file: ${error.message}`));
}

function copyDirectoryRecursive(source, destination) {
  return readdir(source)
    .then(files => Promise.all(files.map(file => {
      const sourcePath = path.join(source, file);
      const destinationPath = path.join(destination, file);
      return lstat(sourcePath)
        .then(stats => {
          if (stats.isDirectory()) {
            return ensureDirectoryExists(destinationPath)
              .then(() => copyDirectoryRecursive(sourcePath, destinationPath));
          } else {
            return copyFile(sourcePath, destinationPath);
          }
        });
    })))
    .then(() => console.log('Directories copied successfully'))
    .catch(err => console.error('Error copying directories:', err.message));
}

function copyAssets() {
    return rm(destinationAssetsPath, { recursive: true, force: true })
      .then(() => mkdir(destinationAssetsPath, { recursive: true }))
      .then(() => readdir(assetsPath))
      .then(files => Promise.all(files.map(file => {
        const sourcePath = path.join(assetsPath, file);
        const destinationPath = path.join(destinationAssetsPath, file);
        return lstat(sourcePath)
          .then(stats => {
            if (stats.isDirectory()) {
              return ensureDirectoryExists(destinationPath)
                .then(() => copyDirectoryRecursive(sourcePath, destinationPath));
            } else {
              return copyFile(sourcePath, destinationPath)
                .catch(err => {
                  console.error(`Error copying file ${file}: ${err.message}`);
                  throw err;
                });
            }
        });
    })))
    .then(() => console.log('Assets copied successfully'))
    .catch(err => console.error('Error copying assets:', err.message));
}

function mergeStyles() {
  return ensureDirectoryExists(projectDistPath)
    .then(() => readdir(stylesPath, { withFileTypes: true }))
    .then(files => {
      const cssFiles = files.filter(file => file.isFile() && path.extname(file.name) === '.css');
      return Promise.all(cssFiles.map(file => readFile(path.join(stylesPath, file.name), 'utf-8')));
    })
    .then(filesContents => {
      const allStyles = filesContents.join('\n/*<=======================================>*/\n');
      return writeFile(stylesOutputPath, allStyles, 'utf-8');
    })
    .then(() => console.log(`Styles compiled successfully. Output file: ${stylesOutputPath}`))
    .catch(error => console.error('Error merging styles:', error));
}

buildHTMLFile()
  .then(() => copyAssets())
  .then(() => mergeStyles());