// script.js

// IMPORTANT: Replace this with the public URL of your Railway backend server.
const backendUrl = "https://your-project-name.up.railway.app"; 

// A simple user ID for demonstration purposes.
const demoUserId = "demo_user_1"; 

async function fetchAndDisplayWatchHistory(userId) {
  const continueWatchingContainer = document.getElementById('continue-watching-container');
  continueWatchingContainer.innerHTML = '';
  
  try {
    const response = await fetch(`${backendUrl}/api/users/${userId}/continueWatching`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const watchHistory = await response.json();

    if (watchHistory.length === 0) {
      continueWatchingContainer.innerHTML = '<p class="text-gray-400">No content in your Continue Watching list yet. Start watching something!</p>';
      return;
    }

    for (const watchItem of watchHistory) {
      const contentId = watchItem.contentId;
      const contentResponse = await fetch(`${backendUrl}/api/content/${contentId}`);
      if (!contentResponse.ok) {
        console.warn(`Content details not found for contentId: ${contentId}`);
        continue;
      }
      const contentData = await contentResponse.json();

      const progressPercentage = (watchItem.progressSeconds / watchItem.totalSeconds) * 100;
      const cardHtml = `
          <div class="flex-none w-40 md:w-48 bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200 cursor-pointer"
               onclick="window.open('${contentData.videoUrl || '#'}', '_blank')">
            <img src="${contentData.imageUrl}" alt="${contentData.title} Poster" class="w-full h-auto object-cover rounded-t-lg" onerror="this.onerror=null;this.src='https://placehold.co/192x288/4B0082/FFF?text=Image+Error';" />
            <div class="p-3">
              <h3 class="text-sm font-semibold truncate">${contentData.title} (${contentData.genre ? contentData.genre[0] : 'Content'})</h3>
              <div class="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div class="bg-green-500 h-1 rounded-full" style="width: ${progressPercentage || 0}%;"></div>
              </div>
            </div>
          </div>
      `;
      continueWatchingContainer.innerHTML += cardHtml;
    }

  } catch (error) {
    console.error("Error fetching watch history:", error);
    continueWatchingContainer.innerHTML = '<p class="text-red-400">Error loading content. Please try again.</p>';
  }
}

async function fetchAndDisplayAllContent() {
  const contentContainer = document.getElementById('initial-content-container');
  contentContainer.innerHTML = '';
  
  try {
    const response = await fetch(`${backendUrl}/api/content`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const allContent = await response.json();
    
    for (const contentData of allContent) {
      const cardHtml = `
          <div class="flex-none w-40 md:w-48 bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200 cursor-pointer"
               onclick="window.open('${contentData.videoUrl || '#'}', '_blank')">
            <img src="${contentData.imageUrl}" alt="${contentData.title} Poster" class="w-full h-auto object-cover rounded-t-lg" onerror="this.onerror=null;this.src='https://placehold.co/192x288/4B0082/FFF?text=Image+Error';" />
            <div class="p-3">
              <h3 class="text-sm font-semibold truncate">${contentData.title} (${contentData.genre ? contentData.genre[0] : 'Content'})</h3>
            </div>
          </div>
      `;
      contentContainer.innerHTML += cardHtml;
    }
  } catch (error) {
    console.error("Error fetching all content:", error);
    contentContainer.innerHTML = '<p class="text-red-400">Error loading content. Please try again.</p>';
  }
}

// Hero carousel logic
const carouselImages = [
    "https://i.ytimg.com/vi/qFhvOB0yoGM/maxresdefault.jpg",
    "https://m.media-amazon.com/images/S/pv-target-images/c203ae23a15b99597c4a2e7475a5085a65e493aa5167279780b73bcfebab8120._UR1920,1080_CLs%7C1920,1080%7C/G/bundle/BottomRightCardGradient16x9.png,/G/01/digital/video/merch/subs/benefit-id/m-r/Prime/logos/channels-logo-white.png%7C0,0,1920,1080+0,0,1920,1080+1578,847,263,156_SX500_FMjpg_.jpg",
    "https://m.media-amazon.com/images/S/pv-target-images/785af8590a7f45e0e39906889941d57a0fd3d911a05b45fee5a8025c2957055d._UR1920,1080_CLs%7C1920,1080%7C/G/bundle/BottomRightCardGradient16x9.png,/G/01/digital/video/merch/subs/benefit-id/m-r/Prime/logos/channels-logo-white.png%7C0,0,1920,1080+0,0,1920,1080+1578,847,263,156_SX500_FMpng_.png",
    "https://m.media-amazon.com/images/S/pv-target-images/0fbd6a006c6ba7fd3d6067c6d9a1e6d5da1dd4831c3ebde18dcb9ccaa2988c14._UR1920,1080_CLs%7C1920,1080%7C/G/bundle/BottomRightCardGradient16x9.png,/G/01/digital/video/merch/subs/benefit-id/m-r/Prime/logos/channels-logo-white.png%7C0,0,1920,1080+0,0,1920,1080+1578,847,263,156_SX500_FMjpg_.jpg",
    "https://m.media-amazon.com/images/S/pv-target-images/8e0d90bcbc47ad1528ed1d1f0b0e88bf31125fa46acf0201fafa3250b40eac._UR1920,1080_CLs%7C1920,1080%7C/G/bundle/BottomRightCardGradient16x9.png,/G/01/digital/video/merch/subs/benefit-id/m-r/Prime/logos/channels-logo-white.png%7C0,0,1920,1080+0,0,1920,1080+1578,847,263,156_SX500_FMpng_.png"
];
let currentCarouselIndex = 0;

function changeHeroImage() {
    const carouselImage = document.getElementById('hero-carousel-image');
    currentCarouselIndex = (currentCarouselIndex + 1) % carouselImages.length;
    carouselImage.src = carouselImages[currentCarouselIndex];
}

document.addEventListener('DOMContentLoaded', () => {
    setInterval(changeHeroImage, 5000);
    fetchAndDisplayAllContent();
    fetchAndDisplayWatchHistory(demoUserId);
});