# 1. Deployer

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

