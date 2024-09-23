import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import sudo from 'sudo-prompt';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the environment variable for the current Node.js process
process.env.MY_CURRENT_DIR = __dirname;

// Commands for setting the environment variables at the user and system levels
const setUserEnvVarCmd = `setx MY_CURRENT_DIR "${__dirname}"`;
const addToUserPathCmd = `setx PATH "%PATH%;%MY_CURRENT_DIR%"`;

const setSystemEnvVarCmd = `setx MY_CURRENT_DIR "${__dirname}" /M`;
const addToSystemPathCmd = `setx PATH "%PATH%;%MY_CURRENT_DIR%" /M`;

// Set the environment variable for the current terminal session (temporary)
const setSessionEnvVarCmd = `set MY_CURRENT_DIR="${__dirname}" && set PATH=%PATH%;%MY_CURRENT_DIR%`;

const options = {
  name: 'Set Environment Variable',
};

// Step 1: Set MY_CURRENT_DIR for the user and add it to the user's PATH
sudo.exec(`${setUserEnvVarCmd} && ${addToUserPathCmd}`, options, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error setting user environment variable: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr (user): ${stderr}`);
    return;
  }
  console.log(`stdout (user): ${stdout}`);
  console.log(`Environment variable MY_CURRENT_DIR set for the user at ${__dirname}`);
  console.log(`MY_CURRENT_DIR added to the user's PATH`);

  // Step 2: Set MY_CURRENT_DIR for the system and add it to the system's PATH
  sudo.exec(`${setSystemEnvVarCmd} && ${addToSystemPathCmd}`, options, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting system environment variable: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr (system): ${stderr}`);
      return;
    }
    console.log(`stdout (system): ${stdout}`);
    console.log(`Environment variable MY_CURRENT_DIR set for the system at ${__dirname}`);
    console.log(`MY_CURRENT_DIR added to the system-wide PATH`);

    // Step 3: Set the environment variable for the current session
    exec(setSessionEnvVarCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error setting variable in the current session: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr (session): ${stderr}`);
        return;
      }
      console.log(`Variable set in the current session: ${stdout}`);
      console.log(`Current session MY_CURRENT_DIR and PATH updated to include ${__dirname}`);
    });
  });
});

// Optionally, log the current session's variable to verify it
console.log('Current MY_CURRENT_DIR in Node.js process:', process.env.MY_CURRENT_DIR);
