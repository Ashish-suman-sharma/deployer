import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = express.Router();

// GitHub API
router.get('/github-repos', async (req, res) => {
  try {
    const githubResponse = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
      params: { per_page: 100, visibility: 'all' }, // Include both private and public repositories
    });
    res.json(githubResponse.data);
  } catch (error) {
    res.status(500).send('Error fetching GitHub repositories');
  }
});

// Vercel API
router.get('/vercel-projects', async (req, res) => {
  try {
    const vercelResponse = await axios.get('https://api.vercel.com/v9/projects', {
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    });
    res.json(vercelResponse.data.projects.slice(0, 30));
  } catch (error) {
    res.status(500).send('Error fetching Vercel projects');
  }
});

// Delete GitHub Repo
router.delete('/github-repos/:repo', async (req, res) => {
  try {
    const repoName = req.params.repo;
    console.log(`Attempting to delete GitHub repo: ${repoName}`);
    await axios.delete(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repoName}`, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
    });
    res.send('GitHub repo deleted');
  } catch (error) {
    console.error('Error deleting GitHub repository:', error.response ? error.response.data : error.message);
    res.status(500).send('Error deleting GitHub repository');
  }
});

// Delete Vercel Project
router.delete('/vercel-projects/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    await axios.delete(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    });
    res.send('Vercel project deleted');
  } catch (error) {
    res.status(500).send('Error deleting Vercel project');
  }
});

export default router;