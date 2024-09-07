# Deployer

## Overview

The Deployer repository is a tool designed to streamline the process of creating a GitHub repository, pushing all files to it, and deploying the project on Vercel. This automation tool requires minimal setup and is initiated with a single click.

## Requirements

To use this tool, you need the following:

1. **Node.js**: Ensure you have Node.js installed. Download it from [nodejs.org](https://nodejs.org/).
2. **NPM**: Comes bundled with Node.js. It’s used for package management.
3. **Git**: Required for cloning repositories and managing version control. Install it from [git-scm.com](https://git-scm.com/).
4. **PowerShell**: Preferred for running commands on Windows. Install from [powershell.org](https://powershell.org/).
5. **Visual Studio Code (VS Code)**: Recommended for editing and managing your project files. Download it from [code.visualstudio.com](https://code.visualstudio.com/).

## About

This repository provides an automated script that:

1. Creates a new GitHub repository.
2. Pushes all files from the local project to the new GitHub repository.
3. Deploys the project to Vercel.

The automation is achieved using GitHub API and Vercel API, with authentication managed through GitHub and Vercel tokens.

## Usage

After setting up, simply run the provided script. It will handle repository creation, file uploads, and deployment to Vercel automatically.

# Installation Guide

## Cloning the Repository

Open PowerShell and execute the following command to clone the repository to your local machine:
   1. **Change to the directory where the repository was cloned:**
   ```bash
   cd C:
   ```
   2. **Clone the Repository:**

   ```bash
   git clone https://github.com/Ashish-suman-sharma/deployer.git
   ```
3. **Initialize the Project:**

   Run npm init to set up the project:
```bash
npm install
```
4. **Open the Project in VS Code:**

   Start editing the project in VS Code:
```bash
code .
```

5. **Configure Environment Variables:**

   Rename example.env to .env:


###  Environment Variables (.env)
 6. **To use the automation script, you need to configure the following environment variables in your `.env` file:**
   ```bash
      
   GITHUB_TOKEN=your_github_personal_access_token
   VERCEL_TOKEN=your_vercel_auth_token
   GITHUB_USERNAME=your_github_username
  ```

# Obtaining GitHub and Vercel Tokens

In order to use this repository, you'll need to authenticate with both GitHub and Vercel via tokens. Below is a step-by-step guide on how to obtain the required tokens.

## GitHub Token

A GitHub Personal Access Token (PAT) is required to create repositories and push files programmatically. Follow these steps to generate one:

### Steps to Generate a GitHub Personal Access Token

1. **Log into GitHub:**
   Go to [github.com](https://github.com/) and log in to your account.

2. **Navigate to Personal Access Tokens:**
   - Click on your profile picture in the top-right corner.
   - Select **Settings** from the dropdown.
   - In the left sidebar, scroll down and click on **Developer settings**.
   - Under **Developer settings**, select **Personal access tokens**.

3. **Generate a New Token:**
   - Click the **Generate new token** button.
   - Provide a descriptive name for your token under "Note" (e.g., `Deployer Automation`).
   - Under **Expiration**, choose a duration or set it to **No expiration** if you prefer.
   - Under **Select Scopes**, check the following:
     - `repo`: Full control of private repositories.
     - `workflow`: Update GitHub Actions workflows.
     - `admin:repo_hook`: Read, write, and ping repository hooks.
   - Once done, click **Generate Token** at the bottom.

4. **Copy Your Token:**
   After generating the token, **copy** it immediately as you won’t be able to view it again. Store this token securely.

5. **Add Token to `.env` File:**
   Once you have your token, open your `.env` file and add it like this:
   ```plaintext
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_USERNAME=your_github_username

# Obtaining Vercel Token

In order to use the deployment functionality provided in this repository, you need to authenticate with Vercel using a Vercel token. Below is a step-by-step guide on how to generate the required Vercel token.

## Steps to Generate a Vercel Token

### 1. Log into Vercel

Go to [vercel.com](https://vercel.com/) and log in to your Vercel account. If you don’t have an account, you can sign up for free.

### 2. Navigate to Your Account Settings

Once logged in, follow these steps:

- Click on your profile picture in the top-right corner of the page.
- From the dropdown menu, click on **Settings**.

### 3. Go to the Tokens Section

In the settings sidebar:

- Scroll down to find the **Tokens** section under **Security**.
- Click on **Tokens** to manage and generate tokens.

### 4. Generate a New Token

- Click on the **Generate Token** button to create a new token.
- Provide a **name** for the token (e.g., `Deployer Automation Token`).
- Once you've named the token, click **Create**.

### 5. Copy Your Token

After generating the token, a success message will appear showing your token.

- **Copy** the token immediately, as it won’t be displayed again after you close this page.
- Store this token securely in a password manager or a secure file.

### 6. Add Token to `.env` File

Once you have your Vercel token, open your `.env` file and add the following line:

```plaintext
VERCEL_TOKEN=your_generated_vercel_token
```

# Deployment Instructions

Once you have set up your environment variables and cloned the repository, follow these steps to deploy your project using the provided `run2.bat` script.

## Steps to Deploy Your Project

### 1. Navigate to the Project Folder

After configuring your environment (`.env` file) with the necessary tokens, you need to navigate to the folder or repository that you want to deploy.

#### Using VS Code Terminal:

- Open the folder you wish to deploy in **Visual Studio Code**.
- Open the integrated terminal in VS Code by pressing `Ctrl + ` (backtick).
  
or 
#### Using PowerShell or Command Prompt:

- Open **PowerShell** or **Command Prompt**.
- Navigate to the directory of your project using the `cd` command. For example:
  ```bash
  cd C:/path/to/your/project

2. Run the Deployment Script  
Once you are in the desired project folder, you can run the deployment script located in the deployer repository.

Execute the following command:

```bash
C:/deployer/run2.bat
```

## What Happens Next
**The ```run2.bat``` script will automatically handle the following:**

1.Push your project files to a new GitHub repository (using your GitHub token and credentials).

Deploy your project to Vercel

2 .You don’t need to do anything else! The script will take care of everything from pushing the code to deploying it to Vercel. After 10 seconds, the deployed link will automatically open in your browser

### 4. Working Structure and Use Cases


# Working Structure and Use Cases

## Working Structure

1. **Repository Creation:**
   - The script uses the GitHub API to create a new repository under your account.

2. **File Upload:**
   - All files in the local project directory are pushed to the newly created GitHub repository.

3. **Deployment:**
   - The script uses the Vercel API to deploy the project. It handles the deployment process automatically.

## Use Cases

1. **Automated Deployment:**
   - Ideal for automating the deployment of new projects with minimal manual intervention.

2. **Fast Prototyping:**
   - Quickly create a repository and deploy a project for testing or demo purposes.

3. **Continuous Integration:**
   - Integrate with CI/CD pipelines to streamline the deployment process.

# License and Additional Information

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Additional Information

- **Support:**
  For any issues or questions, please open an issue on the [GitHub repository](https://github.com/Ashish-suman-sharma/deployer/issues).

- **Contributions:**
  Contributions are welcome! Please refer to the [contributing guidelines](CONTRIBUTING.md) for more information.

- **Credits:**
  This project utilizes GitHub and Vercel APIs to provide automated deployment solutions.

