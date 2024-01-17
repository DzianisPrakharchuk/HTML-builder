const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const rl = readline.createInterface({ input, output });
const welcome = 'Hello! Type your text or type "exit" to quit or press Ctrl+C)\n';
const goodbye = 'Good bye!\n';
const fileWright = path.join(__dirname, 'text.txt');
const stream = fs.createWriteStream(fileWright, { encoding: "utf-8" }); 

output.write(welcome);

rl.on('line', (input) => {
  newLine(input); 
});

function newLine(input){
  if(input.toLowerCase().includes("exit")){            
    rl.close(); 
    process.exit(); 
  }
  else{
    stream.write('\n' + input);     
  }
}
process.on('exit', () => output.write(goodbye));
