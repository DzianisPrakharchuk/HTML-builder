const { readdir, mkdir, copyFile, rm } = require('node:fs/promises');
const { join } = require('path');
const folderCopy =join(__dirname,'files-copy');

rm(folderCopy, { recursive: true, force: true })
  .then(() => mkdir(folderCopy, { recursive: true }))
  .then(() => readdir(join(__dirname, 'files')))
  .then((files) => {
    const copyPromises = files.map((file) => {
        const sourcePath = join(__dirname, 'files', file);
        const destinationPath = join(folderCopy, file);
        return copyFile(sourcePath, destinationPath);
      });
      return Promise.all(copyPromises);
  })
  .then(() => {
    console.log('Directory copied');
  })
  .catch((err) => {
    console.error('Error copy:', err);
  });