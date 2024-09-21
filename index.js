import readline from 'readline';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute the scripts and handle interactive input/output
const runScript = (scriptName, callback) => {
  const scriptPath = path.join(__dirname, scriptName);
  console.log(`Executing script: ${scriptPath}`);

  const child = spawn('node', [scriptPath], {
    stdio: 'inherit', // Ensures that input/output is directly passed through
  });

  child.on('error', (error) => {
    console.error(`Error executing script: ${error.message}`);
  });

  child.on('exit', (code) => {
    console.log(`Script finished with exit code ${code}`);
    if (callback) callback();
  });
};

// Create an interface to prompt the user for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt the user to select an option
console.log('Select an option:');
console.log('1. Git Push');
console.log('2. git push and Deploy');
console.log('3. only deploy');
console.log('4. set api key (run first time only)');

rl.question('Enter your choice (1, 2, 3, 4): ', (choice) => {
  switch (choice.trim()) {
    case '1':
      console.log('Running Git Push (first script only)...');
      runScript('index1.js');
      break;
    case '2':
      console.log('Running Deploy (first and second script)...');
      runScript('index1.js', () => {
        runScript('index2.js');
      });
      break;
    case '3':
      console.log('Running Last Script (second script only)...');
      runScript('index3.js');
      break;
    case '4':
      console.log('Setting API Key...');
      runScript('set.js');
      break;
    default:
      console.log('Invalid choice. Please select 1, 2, 3, or 4.');
      break;
  }
  rl.close(); // Close the readline interface once the choice is made
});