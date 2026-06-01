// --- Text Descriptions ---
// I've stubbed out 1 through 32 as requested.
const imageTexts = {};
for (let i = 1; i <= 32; i++) {
    imageTexts[`${i}.png`] = `
        <h2>Image ${i}</h2>
        <p>This is the detailed description for Image ${i}. It covers the right side of the screen while the dynamic background continues to flow seamlessly underneath a blurred overlay.</p>
    `;
}

// --- Setup Gallery ---
const container = document.getElementById('gallery-container');
let imgCounter = 1;

// Create 4 rows
for (let r = 0; r < 4; r++) {
    const row = document.createElement('div');
    // Row 1 (0): L->R, Row 2 (1): R->L, Row 3 (2): L->R, Row 4 (3): R->L
    row.className = `row ${r % 2 === 0 ? 'move-right' : 'move-left'}`;

    const track = document.createElement('div');
    track.className = 'track';

    // Get 8 images for this specific row
    const rowImages = [];
    for (let i = 0; i < 8; i++) {
        if (imgCounter > 32) break;
        rowImages.push(`${imgCounter}.png`);
        imgCounter++;
    }

    // Create a group of images
    const createGroup = () => {
        const group = document.createElement('div');
        group.className = 'img-group';
        
        rowImages.forEach(src => {
            const img = document.createElement('img');
            img.src = src; 
            img.className = 'gallery-img';
            img.dataset.src = src;
            
            // Randomize hover rotation between -8deg and +8deg for the snappy, askew effect
            const randomRotation = (Math.random() * 16) - 8;
            img.style.setProperty('--hover-rot', `${randomRotation}deg`);
            
            img.addEventListener('click', handleImageClick);
            group.appendChild(img);
        });
        return group;
    };

    // Append two identical groups to the track to create the seamless infinite scroll
    track.appendChild(createGroup());
    track.appendChild(createGroup());

    row.appendChild(track);
    container.appendChild(row);
}

// --- Interaction Logic ---
const overlay = document.getElementById('overlay');
const textPanel = document.getElementById('text-panel');
let activeClone = null;
let originalImage = null;

function handleImageClick(e) {
    if (activeClone) return; // Prevent clicking if an image is already open

    originalImage = e.target;
    const rect = originalImage.getBoundingClientRect();
    const src = originalImage.dataset.src;

    // 1. Create a clone matching the exact current position of the clicked image
    activeClone = document.createElement('img');
    activeClone.src = originalImage.src;
    activeClone.className = 'clone-img';

    activeClone.style.left = `${rect.left}px`;
    activeClone.style.top = `${rect.top}px`;
    activeClone.style.width = `${rect.width}px`;
    activeClone.style.height = `${rect.height}px`;

    document.body.appendChild(activeClone);

    // 2. Hide the original image visually (but keep it taking up space in the conveyor)
    originalImage.style.opacity = '0';

    // 3. Force the browser to register the initial coordinates before animating
    activeClone.getBoundingClientRect();

    // 4. Animate the clone to fill the left side, adding the 360 counterclockwise rotation
    activeClone.style.left = '0px';
    activeClone.style.top = '0px';
    activeClone.style.width = '50vw';
    activeClone.style.height = '100vh';
    activeClone.style.transform = 'rotate(-360deg)';

    // 5. Populate text and trigger overlay
    textPanel.innerHTML = imageTexts[src] || `<h2>Not Found</h2><p>No text available.</p>`;
    overlay.classList.add('active');
}

// Handle clicking off to return
overlay.addEventListener('click', () => {
    if (!activeClone || !originalImage) return;

    // Get the original image's bounding box again (since the conveyor might have moved slightly before it paused, though it pauses on hover)
    const rect = originalImage.getBoundingClientRect();

    overlay.classList.remove('active');

    // Animate back to its spot in the grid with a clockwise rotation (+360 relative to the -360)
    activeClone.style.left = `${rect.left}px`;
    activeClone.style.top = `${rect.top}px`;
    activeClone.style.width = `${rect.width}px`;
    activeClone.style.height = `${rect.height}px`;
    activeClone.style.transform = 'rotate(0deg)';

    // Clean up DOM after transition finishes
    activeClone.addEventListener('transitionend', () => {
        if (activeClone && activeClone.parentNode) {
            activeClone.parentNode.removeChild(activeClone);
        }
        if (originalImage) {
            originalImage.style.opacity = '1';
        }
        activeClone = null;
        originalImage = null;
    }, { once: true });
});
