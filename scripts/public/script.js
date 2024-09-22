window.onload = async function() {
    const githubTableBody = document.querySelector('#github-table tbody');
    const vercelTableBody = document.querySelector('#vercel-table tbody');
    const popup = document.getElementById('popup');
    const cancelButton = document.getElementById('cancel-delete');
    const confirmButton = document.getElementById('confirm-delete');
    const deleteMessage = document.getElementById('delete-message');
    let deleteInfo = null;
    let selectedButton = cancelButton;

    // Fetch and sort GitHub repos
    const githubRepos = await fetch('/api/github-repos').then(res => res.json());
    githubRepos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort newest to oldest
    githubRepos.forEach(repo => {
        githubTableBody.innerHTML += `
            <tr>
                <td>${repo.name}</td>
                <td><a href="${repo.html_url}" target="_blank">${repo.html_url}</a></td>
                <td><button onclick="confirmDelete('github', '${repo.name}')">Delete</button></td>
            </tr>
        `;
    });

    // Fetch and sort Vercel projects
    const vercelProjects = await fetch('/api/vercel-projects').then(res => res.json());
    vercelProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    vercelProjects.forEach(project => {
        vercelTableBody.innerHTML += `
            <tr>
                <td>${project.name}</td>
                <td><a href="https://${project.name}.vercel.app" target="_blank">https://${project.name}.vercel.app</a></td>
                <td><button onclick="confirmDelete('vercel', '${project.id}', '${project.name}')">Delete</button></td>
            </tr>
        `;
    });

    // Show confirmation popup
    window.confirmDelete = function(type, id, name) {
        deleteInfo = { type, id };
        deleteMessage.textContent = `Are you sure you want to delete ${name}?`;
        popup.classList.remove('hidden');
        cancelButton.style.backgroundColor = 'green';
        confirmButton.style.backgroundColor = 'red';
        selectedButton = cancelButton;
        cancelButton.focus();
    };

    // Handle delete confirmation
        confirmButton.onclick = async function() {
      try {
        if (deleteInfo.type === 'github') {
          console.log(`Sending DELETE request for GitHub repo: ${deleteInfo.id}`);
          await fetch(`/api/github-repos/${deleteInfo.id}`, { method: 'DELETE' });
        } else if (deleteInfo.type === 'vercel') {
          console.log(`Sending DELETE request for Vercel project: ${deleteInfo.id}`);
          await fetch(`/api/vercel-projects/${deleteInfo.id}`, { method: 'DELETE' });
        }
        localStorage.setItem('scrollPosition', window.scrollY);
        window.location.reload();
      } catch (error) {
        console.error('Error during delete operation:', error);
      }
    };

    // Cancel delete
    cancelButton.onclick = function() {
        popup.classList.add('hidden');
    };

    // Handle keyboard navigation and Enter key press
    document.addEventListener('keydown', function(event) {
        if (popup.classList.contains('hidden')) return;

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            selectedButton = (selectedButton === cancelButton) ? confirmButton : cancelButton;
            selectedButton.focus();
        } else if (event.key === 'Enter') {
            selectedButton.click();
        }
    });

    // Restore scroll position after reload
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
        localStorage.removeItem('scrollPosition');
    }
};