// ==========================================
// БЛОК 1: Переменные
// ==========================================
const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video1 = document.querySelector('#v1'); 
const video360 = document.querySelector('#v360'); 
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');
const venusModel = document.querySelector('#venus-model'); // Наша Венера
const closeBtn = document.querySelector('#close-btn');

const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const uiBottom = document.querySelector('#ui-bottom-360');
const playPauseBtn = document.querySelector('#play-pause-360');
const zoomSlider = document.querySelector('#zoom-slider');
const cameraEl = document.querySelector('#cam');

// БЛОК 2 ОСТАВЛЯЕМ БЕЗ ИЗМЕНЕНИЙ (ТВОЙ РАБОЧИЙ)
// ... (скопируй свою функцию proceedToAR и activateStart сюда)

// ==========================================
// БЛОК 3: Таргеты
// ==========================================
document.querySelector('#target0').addEventListener("targetFound", () => { 
    video1.play(); status.innerHTML = "Видео активно"; 
});
document.querySelector('#target0').addEventListener("targetLost", () => { video1.pause(); });

document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "модель 1"; });

document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 2"; 
    worldContainer.setAttribute('visible', 'true');
    closeBtn.style.display = 'block';
});

// НОВЫЙ ТАРГЕТ 4
document.querySelector('#target4').addEventListener("targetFound", () => { 
    status.innerHTML = "Venus"; 
});

// БЛОКИ ПОРТАЛА (4, 5, 6) ОСТАВЛЯЕМ КАК БЫЛИ
// ... (скопируй свои блоки управления порталом)

// ==========================================
// БЛОК 7-8: Взаимодействие (Вращение и Зум)
// ==========================================
let isDragging = false;
let prevX = 0; let prevY = 0;
let initialDist = 0;
let initialScale = 1;

function getActiveModel() {
    const txt = status.innerHTML;
    if (txt.includes("модель 1")) return model1;
    if (txt.includes("модель 2")) return freeModel;
    if (txt.includes("Venus")) return venusModel;
    return null;
}

window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        initialDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        let active = getActiveModel();
        if (active) initialScale = active.getAttribute('scale').x;
    }
});

window.addEventListener('touchend', () => isDragging = false);

window.addEventListener('touchmove', (e) => {
    let active = getActiveModel();
    if (!active) return;

    if (e.touches.length === 1 && isDragging) {
        let rot = active.getAttribute('rotation');
        active.setAttribute('rotation', { 
            x: rot.x + (e.touches[0].clientY - prevY) * 0.5, 
            y: rot.y + (e.touches[0].clientX - prevX) * 0.8, 
            z: rot.z 
        });
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        let currentDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        let zoomFactor = currentDist / initialDist;
        let newScale = initialScale * zoomFactor;
        newScale = Math.min(Math.max(newScale, 0.1), 5);
        active.setAttribute('scale', { x: newScale, y: newScale, z: newScale });
    }
});
