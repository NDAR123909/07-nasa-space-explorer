// NASA APOD API configuration
const NASA_API_KEY = 'EItpMuhIVqYXQxjeKVwneHLyFaLa57haprAYmjvu'; // Replace with your actual API key
const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod';

// Random space facts for level-up feature
const SPACE_FACTS = [
  "A day on Venus is longer than its year! Venus rotates so slowly that one day (243 Earth days) is longer than one year (225 Earth days).",
  "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - it won't happen for about 4.5 billion years!",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years and is larger than Earth.",
  "One million Earths could fit inside the Sun, but the Sun is considered a medium-sized star.",
  "Saturn would float in water because it's less dense than water, despite being the second-largest planet in our solar system.",
  "There are more possible games of chess than there are atoms in the observable universe.",
  "The footprints left by Apollo astronauts on the Moon will last for millions of years because there's no wind or water to erode them.",
  "A black hole with the mass of our Sun would have a radius of only 3 kilometers.",
  "The International Space Station travels at 17,500 mph and orbits Earth every 90 minutes."
];

// DOM elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  setupDateInputs();
  displayRandomSpaceFact();
  button.addEventListener('click', handleGetImages);
});

// Set up date inputs with proper constraints
function setupDateInputs() {
  const today = new Date().toISOString().split('T')[0];
  const apodStartDate = '1995-06-16';
  
  startDateInput.setAttribute('min', apodStartDate);
  startDateInput.setAttribute('max', today);
  endDateInput.setAttribute('min', apodStartDate);
  endDateInput.setAttribute('max', today);
  
  // Set default date range (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  
  startDateInput.value = startDate.toISOString().split('T')[0];
  endDateInput.value = endDate.toISOString().split('T')[0];
}

// Display random space fact (Level-up feature)
function displayRandomSpaceFact() {
  const randomFact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  
  // Create space fact section
  const factSection = document.createElement('div');
  factSection.className = 'space-fact';
  factSection.innerHTML = `
    <h3>🌟 Did You Know?</h3>
    <p>${randomFact}</p>
  `;
  
  // Insert before gallery
  gallery.parentNode.insertBefore(factSection, gallery);
}

// Handle the Get Images button click
async function handleGetImages() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be before end date.');
    return;
  }
  
  // Show loading message
  showLoading();
  
  try {
    const apodData = await fetchAPODData(startDate, endDate);
    displayGallery(apodData);
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    showError('Failed to fetch space images. Please try again.');
  }
}

// Show loading message
function showLoading() {
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;
}

// Show error message
function showError(message) {
  gallery.innerHTML = `
    <div class="error">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

// Fetch APOD data from NASA API
async function fetchAPODData(startDate, endDate) {
  const url = `${NASA_API_BASE}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

// Display the gallery of images
function displayGallery(apodData) {
  // Filter out video entries or handle them appropriately (Level-up feature)
  const processedData = apodData.map(item => {
    if (item.media_type === 'video') {
      // For YouTube videos, extract thumbnail
      if (item.url && item.url.includes('youtube.com')) {
        const videoId = extractYouTubeId(item.url);
        item.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        item.is_video = true;
      } else {
        // For other videos, use a placeholder or skip
        item.thumbnail_url = 'https://via.placeholder.com/400x300?text=Video+Content';
        item.is_video = true;
      }
    }
    return item;
  });

  if (processedData.length === 0) {
    gallery.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>No images found for the selected date range.</p>
      </div>
    `;
    return;
  }

  // Generate gallery HTML
  const galleryHTML = processedData.map(item => createGalleryItem(item)).join('');
  gallery.innerHTML = galleryHTML;
  
  // Add click event listeners for modal
  addModalEventListeners(processedData);
}

// Create individual gallery item HTML
function createGalleryItem(item) {
  const imageUrl = item.media_type === 'image' ? item.url : item.thumbnail_url;
  const isVideo = item.media_type === 'video';
  const videoIndicator = isVideo ? '<div class="video-indicator">▶️ Video</div>' : '';
  
  return `
    <div class="gallery-item" data-date="${item.date}">
      <div class="image-container">
        ${videoIndicator}
        <img src="${imageUrl}" alt="${item.title}" loading="lazy" />
      </div>
      <div class="item-content">
        <h3>${item.title}</h3>
        <p class="date">${formatDate(item.date)}</p>
      </div>
    </div>
  `;
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Add modal event listeners
function addModalEventListeners(apodData) {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      showModal(apodData[index]);
    });
  });
}

// Show modal with image details
function showModal(item) {
  const isVideo = item.media_type === 'video';
  const mediaContent = isVideo 
    ? `<div class="video-container">
         <iframe src="${getEmbedUrl(item.url)}" frameborder="0" allowfullscreen></iframe>
         <p><a href="${item.url}" target="_blank">Watch on ${getVideoSource(item.url)}</a></p>
       </div>`
    : `<img src="${item.hdurl || item.url}" alt="${item.title}" />`;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <div class="modal-media">
        ${mediaContent}
      </div>
      <div class="modal-info">
        <h2>${item.title}</h2>
        <p class="modal-date">${formatDate(item.date)}</p>
        <div class="modal-explanation">
          <p>${item.explanation}</p>
        </div>
        ${item.copyright ? `<p class="copyright">© ${item.copyright}</p>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal events
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });

  // Close on Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeModal(modal);
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

// Get embed URL for videos
function getEmbedUrl(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

// Get video source name
function getVideoSource(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube';
  }
  return 'Original Source';
}

// Close modal
function closeModal(modal) {
  modal.remove();
}

// Add CSS styles dynamically
function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Space fact styles */
    .space-fact {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .space-fact h3 {
      margin-bottom: 10px;
      font-size: 1.3em;
    }
    
    .space-fact p {
      font-size: 1em;
      line-height: 1.5;
      margin: 0;
    }

    /* Loading and error styles */
    .loading, .error, .no-results {
      flex: 1 1 100%;
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .loading-icon, .error-icon, .no-results-icon {
      font-size: 48px;
      margin-bottom: 20px;
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .error {
      color: #d32f2f;
    }

    /* Enhanced gallery item styles */
    .gallery-item {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    }
    
    /* Hover zoom effect (Level-up feature) */
    .gallery-item:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .image-container {
      position: relative;
      overflow: hidden;
      border-radius: 4px;
    }
    
    .gallery-item img {
      transition: transform 0.3s ease;
    }
    
    .gallery-item:hover img {
      transform: scale(1.05);
    }
    
    .video-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      z-index: 1;
    }
    
    .item-content h3 {
      font-size: 1.1em;
      margin: 10px 0 5px 0;
      color: #333;
      line-height: 1.3;
    }
    
    .item-content .date {
      color: #666;
      font-size: 0.9em;
      margin: 0;
    }

    /* Modal styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .modal-content {
      background: white;
      border-radius: 10px;
      max-width: 900px;
      max-height: 90vh;
      width: 100%;
      overflow-y: auto;
      position: relative;
      animation: modalAppear 0.3s ease;
    }
    
    @keyframes modalAppear {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .modal-close {
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 30px;
      cursor: pointer;
      z-index: 1001;
      color: #666;
      background: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .modal-close:hover {
      color: #333;
      background: #f5f5f5;
    }
    
    .modal-media img {
      width: 100%;
      height: auto;
      border-radius: 10px 10px 0 0;
    }
    
    .video-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      border-radius: 10px 10px 0 0;
      overflow: hidden;
    }
    
    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .video-container p {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      margin: 0;
    }
    
    .video-container a {
      color: white;
      text-decoration: none;
    }
    
    .modal-info {
      padding: 20px;
    }
    
    .modal-info h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.5em;
    }
    
    .modal-date {
      color: #666;
      margin: 0 0 15px 0;
      font-style: italic;
    }
    
    .modal-explanation {
      line-height: 1.6;
      color: #444;
    }
    
    .modal-explanation p {
      margin: 0;
    }
    
    .copyright {
      margin-top: 15px;
      font-size: 0.9em;
      color: #888;
      font-style: italic;
    }

    /* Responsive modal */
    @media (max-width: 600px) {
      .modal {
        padding: 10px;
      }
      
      .modal-content {
        max-height: 95vh;
      }
      
      .modal-info {
        padding: 15px;
      }
      
      .modal-info h2 {
        font-size: 1.3em;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize styles
addStyles();