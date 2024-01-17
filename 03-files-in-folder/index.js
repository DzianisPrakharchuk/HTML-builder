const fs = require('fs');
const path = require('path');
const readDir = path.join(__dirname, 'secret-folder');

let dirEntries = [];
fs.readdir(readDir, {withFileTypes: true }, (err, files) => { 
    if (err) {
        console.log(err);
    } else { 
        files.forEach(file => {
            if (file.isFile()) {
                dirEntries.push(file);
                let filePath = path.resolve(__dirname, 'secret-folder', file.name);
                fs.stat(filePath, function(error, stats) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    console.log(`${path.basename(filePath, path.extname(filePath))} - ${path.extname(filePath).slice(1)} - ${stats.size}b`); 
                });
            }
        });
    }
}); 
