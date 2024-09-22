// Import the inquirer package
import inquirer from 'inquirer';

// Define the choices for the user
const choices = [
  { name: 'Automatic Setup', value: 'login.js' },
  { name: 'Manual Setup (Not Recomended)', value: 'set.js' }
];

// Prompt the user to select a setup option
inquirer.prompt([
  {
    type: 'list',
    name: 'setupChoice',
    message: 'Please select a setup option:',
    choices: choices
  }
]).then(async answers => {
  // Dynamically import and run the selected script
  const selectedScript = await import(`./${answers.setupChoice}`);
  selectedScript.default();
}).catch(error => {
  console.error('Error:', error);
});