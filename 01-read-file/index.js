const fs = require('fs');
const path = require('path');
const readFile = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(readFile, { encoding: "utf-8" });
stream.pipe(process.stdout);


