const colorMap = {
    'black': '#1a1a1a', 'blue_dark': '#1c2841', 'blue_light': '#7b9cbd', 'cyan_light': '#AFC9CD', 
    'green_dark': '#2f6333', 'green_light': '#519355', 'pink': '#D18091', 'red': '#9B1B3B',
    'teal': '#6BB4A4', 'white': '#f5f5f5', 'yellow': '#fad620', 'lime_light': '#F1FBCB'
};
const colors = Object.keys(colorMap);

const faceColors = {
    'black': '#1a1a1a', 'blue_dark': '#1c2841', 'blue_light': '#7b9cbd'
    ,'green':'#519355','green_light': '#519355','pink': '#D18091',
    'white': '#f5f5f5', 'yellow': '#fad620'
};

const fcolors = Object.keys(faceColors);

let currentStrap = 0;
let currentFace = 0;
let currentCase = 0; 

function init() {
    const strapTrack = document.getElementById('strap-track');
    const faceTrack = document.getElementById('face-track');
    const caseTrack = document.getElementById('case-track');

    // Populate Strap and Case Images 
    colors.forEach((color) => {
        // Strap Images 
        const sImg = document.createElement('img');
        sImg.src = `images/strap_${color}.png`;
        strapTrack.appendChild(sImg);

         // Case Images
        const cImg = document.createElement('img');
        cImg.src = `images/case_${color}.png`;
        caseTrack.appendChild(cImg); 
    });
    
    // Populate Face Images (Restricted to certain colors)
    fcolors.forEach((color) => {
        const fImg = document.createElement('img');
        fImg.src = `images/face_${color}.png`;
        faceTrack.appendChild(fImg);
    });

    initSwipe('case-zone', 'case-track', 'case');
    initSwipe('face-zone', 'face-track', 'face');
    initSwipe('strap-zone', 'strap-track', 'strap');
    
    // Initial UI state
    updateVisuals('strap');
    updateVisuals('face');
    updateVisuals('case'); 
}

// --- SELECTOR LOGIC ---
function changeColor(type, direction) {
    if (type === 'face') {
        currentFace = (currentFace + direction + fcolors.length) % fcolors.length;
    } else if (type === 'case') {
        currentCase = (currentCase + direction + colors.length) % colors.length; 
    } else {
        currentStrap = (currentStrap + direction + colors.length) % colors.length;
    }
    updateVisuals(type);
}

function updateVisuals(type) {
    let index, colorKey;
    if (type === 'face') {
        index = currentFace;
        colorKey = fcolors[index];
    } else if (type === 'case') {
        index = currentCase;
        colorKey = colors[index];
    } else {
        index = currentStrap; 
        colorKey = colors[index];
    }
    
    // Update Watch Position
    const track = document.getElementById(`${type}-track`);
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    track.style.transform = `translateY(-50%) translateX(-${index * 100}%)`;
    
    // Update Selector UI
    const nameLabel = document.getElementById(`${type}-name`);
    const previewBox = document.getElementById(`${type}-preview`);
    
    nameLabel.innerText = colorKey.replace('_', ' ');
    previewBox.style.backgroundColor = colorMap[colorKey];
}

// --- SWIPE LOGIC ---
function initSwipe(zoneId, trackId, type) {
    const zone = document.getElementById(zoneId);
    const track = document.getElementById(trackId);
    let startX = 0, currentX = 0, isDragging = false;
    
    const dragStart = (e) => {
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none';
    };
    
    const dragMove = (e) => {
        if (!isDragging) return;
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        const diffPercent = (diff / track.offsetWidth) * 100;
        
        let baseOffset;
        if (type === 'face') baseOffset = -(currentFace * 100);
        else if (type === 'case') baseOffset = -(currentCase * 100);
        else baseOffset = -(currentStrap * 100);
        
        track.style.transform = `translateY(-50%) translateX(${baseOffset + diffPercent}%)`;
    };
    
    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentX - startX;
        const threshold = track.offsetWidth * 0.15;
        if (Math.abs(diff) > threshold && currentX !== 0) {
            changeColor(type, diff < 0 ? 1 : -1);
        } else {
            updateVisuals(type);
        }
        currentX = 0;
    };

    zone.addEventListener('touchstart', dragStart, {passive: true});
    zone.addEventListener('touchmove', dragMove, {passive: false});
    zone.addEventListener('touchend', dragEnd);
    zone.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
}

async function downloadWatch() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800; 
    canvas.height = 800;

    const strapColor = colors[currentStrap];
    const caseColor = colors[currentCase];
    const faceColor = fcolors[currentFace];

    const strapImg = new Image();
    strapImg.crossOrigin = "anonymous";
    const caseImg = new Image();
    caseImg.crossOrigin = "anonymous";
    const faceImg = new Image();
    faceImg.crossOrigin = "anonymous";

    strapImg.onload = () => {
        ctx.drawImage(strapImg, 0, 0, canvas.width, canvas.height);
        caseImg.onload = () => {
            ctx.drawImage(caseImg, 0, 0, canvas.width, canvas.height);
            faceImg.onload = () => {
                ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);
                const link = document.createElement('a');
                link.download = `royal-oak-${caseColor}-${strapColor}-${faceColor}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
            faceImg.src = `images/face_${faceColor}.png`;
        };
        caseImg.src = `images/case_${caseColor}.png`;
    };
    strapImg.src = `images/strap_${strapColor}.png`;
}

function randomizeWatch() {
    // Generate random indices for each part
    currentFace = Math.floor(Math.random() * fcolors.length);
    currentCase = Math.floor(Math.random() * colors.length);
    currentStrap = Math.floor(Math.random() * colors.length);
    
    // Update all visual tracks and selector labels
    updateVisuals('face');
    updateVisuals('case');
    updateVisuals('strap');
}
window.onload = init;