  let autoSaveInterval;
  const DRAFT_KEY = 'article_draft';

  // Initialize Quill Editor
  function initializeQuill() {
    quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Write your article here...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ font: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['blockquote', 'code-block'],
          [{ 'direction': 'rtl' }],
          ['link', 'image', 'video'],
          ['table'],
          ['clean']
        ]
      }
    });

    quill.on('text-change', () => {
      updateStats();
      scheduleAutoSave();
    });
  }

  // Update word count and reading time
  function updateStats() {
    const text = quill.getText();
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute

    document.getElementById('wordCount').textContent = words;
    document.getElementById('charCount').textContent = chars;
    document.getElementById('readingTime').textContent = readingTime + ' min';
  }

  // Auto-save draft
  function scheduleAutoSave() {
    clearTimeout(autoSaveInterval);
    autoSaveInterval = setTimeout(() => {
      const draft = {
        title: document.getElementById('title').value,
        content: quill.root.innerHTML,
        savedAt: new Date().toLocaleString()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      showAutoSaveIndicator();
    }, 2000);
  }

  // Show auto-save indicator
  function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    indicator.classList.add('show');
    setTimeout(() => indicator.classList.remove('show'), 2000);
  }

  // Load draft from localStorage
  function loadDraft() {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const draft = JSON.parse(saved);
      document.getElementById('title').value = draft.title;
      quill.root.innerHTML = draft.content;
      updateStats();
    }
  }

  // Save draft manually
  function saveDraft() {
    const draft = {
      title: document.getElementById('title').value,
      content: quill.root.innerHTML,
      savedAt: new Date().toLocaleString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert('✓ Draft saved to your browser!');
  }

  // Load and display news
  async function loadNews() {
    try {
      const response = await fetch(`${backUrl}/news`);
      const newsList = await response.json();

      const tbody = document.getElementById('newsTableBody');
      tbody.innerHTML = '';

      if (newsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No news yet</td></tr>';
        return;
      }

      newsList.forEach(news => {
        const date = new Date(news.created_at).toLocaleDateString();
        const row = `
          <tr>
            <td><strong>${news.title}</strong></td>
            <td><span style="background: #e7f3ff; padding: 4px 8px; border-radius: 3px; font-size: 12px;">General</span></td>
            <td>${date}</td>
            <td><span style="color: #28a745; font-weight: 600;">Published</span></td>
            <td>
              <button class="action-btn edit" onclick="editNews(${news.id}, '${news.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="action-btn delete" onclick="deleteNews(${news.id}, '${news.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    } catch (error) {
      console.error('Error loading news:', error);
      document.getElementById('newsTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Error loading news</td></tr>';
    }
  }

  // Delete news
  async function deleteNews(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('adminSessionToken');
      const headers = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      
      const response = await fetch(`${backUrl}/delete/${id}`, {
        method: 'DELETE',
        headers: headers
      });

      if (response.ok) {
        alert('✓ News deleted successfully!');
        loadNews();
      } else if (response.status === 401) {
        isLoggedIn = false;
        localStorage.removeItem('adminSessionToken');
        showLoginPanel();
        alert('Session expired. Please login again.');
      } else {
        alert('✗ Failed to delete news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('✗ Error deleting news');
    }
  }

  // Edit news (load into editor)
  async function editNews(id, title) {
    try {
      const response = await fetch(`${backUrl}/api/news-by-id/${id}`);
      if (!response.ok) {
        alert('Could not load article for editing');
        return;
      }
      
      const news = await response.json();
      document.getElementById('title').value = news.title;
      quill.root.innerHTML = news.content;
      updateStats();
      
      // Switch to editor tab
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById('editor-tab').classList.add('active');
      document.querySelectorAll('.tab-btn')[0].classList.add('active');
      
      // Show edit indicator
      document.getElementById('editIndicator').classList.add('show');
      
      // Scroll to editor and highlight
      document.getElementById('title').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('title').focus();
      document.getElementById('title').style.borderColor = '#667eea';
      setTimeout(() => {
        document.getElementById('title').style.borderColor = '#e0e0e0';
      }, 2000);
      
      // Store the ID for update
      window.editingNewsId = id;
      alert('✓ Article loaded for editing. Click Publish to update it.');
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Error loading article for editing');
    }
  }
  

  // Dialog Manager Functions
  const DIALOG_DATA_KEY = 'welcomeDialogData';

  // Load dialog data from localStorage
  function loadDialogData() {
    const saved = localStorage.getItem(DIALOG_DATA_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      document.getElementById('dialogTitle').value = data.title;
      document.getElementById('dialogMessage').value = data.message;
      updateDialogPreview();
    } else {
      updateDialogPreview();
    }
  }

  // Save dialog
  function saveDialog() {
    const title = document.getElementById('dialogTitle').value.trim();
    const message = document.getElementById('dialogMessage').value.trim();

    if (!title) {
      alert('Please enter a dialog title');
      return;
    }
    if (!message) {
      alert('Please enter a dialog message');
      return;
    }

    const dialogData = {
      title: title,
      message: message
    };

    localStorage.setItem(DIALOG_DATA_KEY, JSON.stringify(dialogData));
    updateDialogPreview();
    alert('✓ Dialog saved successfully! Visitors will see this on page load.');
  }

  // Update dialog preview
  function updateDialogPreview() {
    const saved = localStorage.getItem(DIALOG_DATA_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      document.getElementById('currentDialogTitle').textContent = data.title;
      document.getElementById('currentDialogMessage').textContent = data.message;
    }
  }

  // Test dialog preview
  function testDialogPreview() {
    const title = document.getElementById('dialogTitle').value.trim();
    const message = document.getElementById('dialogMessage').value.trim();

    if (!title || !message) {
      alert('Please fill in both title and message');
      return;
    }

    // Show preview in a simple alert for now
    alert(`Preview:\n\n${title}\n\n${message}`);
  }

  window.addEventListener('DOMContentLoaded', () => {
  //Do the codes
});

  // Show Admin Panel
  function showAdminPanel(username) {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('currentUser').textContent = username;
    
    if (!quill) {
      initializeQuill();
      loadDraft();
      loadDialogData();
    }
  }

  // Save Article
  async function saveArticle() {
    if (!isLoggedIn) {
      alert('Please login first');
      return;
    }

    const title = document.getElementById('title').value;
    const content = quill.root.innerHTML;

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (quill.getText().trim() === '') {
      alert('Please write some content');
      return;
    }

    const article = { title, content };
    
    document.getElementById('loading').style.display = 'block';

    try {
      // Check if editing existing news
      const endpoint = window.editingNewsId ? `/update/${window.editingNewsId}` : '/insert';
      const method = window.editingNewsId ? 'PUT' : 'POST';
      
      const sessionToken = localStorage.getItem('adminSessionToken');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      
      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        body: JSON.stringify(article)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        document.getElementById('loading').style.display = 'none';
        console.error('Response is not valid JSON:', parseError);
        alert('✗ Server error. Please check your connection.');
        return;
      }

      document.getElementById('loading').style.display = 'none';

      if (response.ok) {
        const isUpdate = window.editingNewsId ? true : false;
        alert(isUpdate ? '✓ Article updated successfully!' : '✓ Article published successfully!');
        document.getElementById('title').value = '';
        quill.setText('');
        document.getElementById('preview').style.display = 'none';
        document.getElementById('editIndicator').classList.remove('show');
        localStorage.removeItem(DRAFT_KEY);
        window.editingNewsId = null;
        updateStats();
        loadNews();
      } else {
        if (data.error === 'Unauthorized. Please login.') {
          isLoggedIn = false;
          localStorage.removeItem('adminSessionToken');
          showLoginPanel();
          alert('Session expired. Please login again.');
        } else {
          alert('✗ ' + (data.error || 'Failed to save article'));
        }
      }
    } catch (error) {
      document.getElementById('loading').style.display = 'none';
      console.error('Error:', error);
      alert('✗ Connection error. Please try again.');
    }
  }

  // Preview Article
  function previewArticle() {
    const title = document.getElementById('title').value;
    const content = quill.root.innerHTML;
    const text = quill.getText();
    const readingTime = Math.ceil(text.trim().split(/\s+/).filter(w => w.length > 0).length / 200);

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const preview = document.getElementById('preview');
    const previewContent = document.getElementById('previewContent');
    document.getElementById('previewReadingTime').textContent = readingTime + ' min read';
    previewContent.innerHTML = `
      <h3>${title}</h3>
      <hr>
      ${content}
    `;
    preview.style.display = 'block';
  }

  // Clear Editor
  function clearEditor() {
    if (confirm('Are you sure you want to clear the editor? (Draft will be preserved)')) {
      document.getElementById('title').value = '';
      quill.setText('');
      document.getElementById('preview').style.display = 'none';
      document.getElementById('editIndicator').classList.remove('show');
      window.editingNewsId = null;
      updateStats();
    }
  }

  // Gallery Functions
  // Handle file selection and preview
  document.getElementById('galleryImageFile')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('galleryImagePreview').style.display = 'block';
        document.getElementById('galleryPreviewImg').src = event.target.result;
        document.getElementById('galleryPreviewInfo').textContent = `File: ${file.name} | Size: ${(file.size / 1024).toFixed(2)} KB`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Upload gallery image
  async function uploadGalleryImage() {
    if (!isLoggedIn) {
      alert('Please login first');
      return;
    }

    const title = document.getElementById('galleryImageTitle').value.trim();
    const file = document.getElementById('galleryImageFile').files[0];

    if (!title) {
      alert('Please enter an image title');
      return;
    }

    if (!file) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
      try {
        const sessionToken = localStorage.getItem('adminSessionToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }
        
        const response = await fetch(`${backUrl}/api/gallery/upload`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            title: title,
            imageData: event.target.result
          })
        });

        if (response.ok) {
          alert('✓ Image uploaded successfully!');
          clearGalleryForm();
          loadGalleryImages();
        } else {
          const data = await response.json();
          if (data.error === 'Unauthorized. Please login.') {
            isLoggedIn = false;
            localStorage.removeItem('adminSessionToken');
            showLoginPanel();
            alert('Session expired. Please login again.');
          } else {
            alert('✗ ' + (data.error || 'Failed to upload image'));
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('✗ Error uploading image');
      }
    };
    reader.readAsDataURL(file);
  }

  // Clear gallery form
  function clearGalleryForm() {
    document.getElementById('galleryImageTitle').value = '';
    document.getElementById('galleryImageFile').value = '';
    document.getElementById('galleryImagePreview').style.display = 'none';
  }

  // Load and display gallery images
  async function loadGalleryImages() {
    try {
      const response = await fetch(`${backUrl}/api/gallery`);
      const images = await response.json();

      const container = document.getElementById('galleryImagesList');
      container.innerHTML = '';

      if (images.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No images in gallery yet</p>';
        return;
      }

      // Store selected IDs for multi-select
      window.selectedGalleryImages = [];

      images.forEach(image => {
        const date = new Date(image.created_at).toLocaleDateString();
        const card = document.createElement('div');
        card.id = `gallery-item-${image.id}`;
        card.className = 'gallery-card';
        card.style.cssText = `
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
          cursor: pointer;
          position: relative;
        `;
        card.innerHTML = `
          <div style="position: relative;">
            <img src="${image.image_path}" style="width: 100%; height: 150px; object-fit: cover;">
            <input type="checkbox" class="gallery-checkbox" data-image-id="${image.id}" style="position: absolute; top: 10px; left: 10px; width: 20px; height: 20px; cursor: pointer;">
          </div>
          <div style="padding: 12px;">
            <p style="margin: 0 0 5px 0; font-weight: 600; font-size: 13px; color: #333;">${image.title}</p>
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #999;">${date}</p>
          </div>
        `;
        
        // Add click event to toggle checkbox
        card.addEventListener('click', function(e) {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = this.querySelector('.gallery-checkbox');
            checkbox.checked = !checkbox.checked;
            updateGallerySelection();
          }
        });
        
        // Add change event to checkbox
        card.querySelector('.gallery-checkbox').addEventListener('change', updateGallerySelection);
        
        card.onmouseover = function() {
          this.style.transform = 'translateY(-5px)';
          this.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        };
        card.onmouseout = function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        };
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading gallery images:', error);
      document.getElementById('galleryImagesList').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Error loading gallery images</p>';
    }
  }

  // Update gallery selection and enable/disable delete button
  function updateGallerySelection() {
    const checkboxes = document.querySelectorAll('.gallery-checkbox:checked');
    window.selectedGalleryImages = Array.from(checkboxes).map(cb => parseInt(cb.dataset.imageId));
    
    // Update card styling for selected items
    document.querySelectorAll('.gallery-card').forEach(card => {
      const checkbox = card.querySelector('.gallery-checkbox');
      if (checkbox.checked) {
        card.style.borderColor = '#667eea';
        card.style.background = '#f0f4ff';
      } else {
        card.style.borderColor = '#e0e0e0';
        card.style.background = 'white';
      }
    });
    
    // Enable/disable delete button
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    deleteBtn.disabled = window.selectedGalleryImages.length === 0;
  }

  // Select all images
  function selectAllImages() {
    const checkboxes = document.querySelectorAll('.gallery-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = !allChecked;
    });
    updateGallerySelection();
  }

  // Delete selected images
  async function deleteSelectedImages() {
    if (window.selectedGalleryImages.length === 0) {
      alert('Please select images to delete');
      return;
    }
    
    if (!confirm(`Delete ${window.selectedGalleryImages.length} image(s)? This cannot be undone.`)) {
      return;
    }
    
    try {
      const sessionToken = localStorage.getItem('adminSessionToken');
      const headers = {};
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      
      for (const id of window.selectedGalleryImages) {
        const response = await fetch(`${backUrl}/api/gallery/${id}`, {
          method: 'DELETE',
          headers: headers
        });
        
        if (!response.ok && response.status === 401) {
          isLoggedIn = false;
          localStorage.removeItem('adminSessionToken');
          showLoginPanel();
          return;
        }
      }
      alert('✓ Images deleted successfully!');
      loadGalleryImages();
    } catch (error) {
      console.error('Error deleting images:', error);
      alert('✗ Error deleting images');
    }
  }
