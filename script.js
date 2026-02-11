const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');
const closeBtn = document.querySelector('#close-btn');

// Элементы 360
const skyPortal = document.querySelector('#sky-portal');
const portalButton = document.querySelector('#portal-button');
const exitBtn = document.querySelector('#exit-btn');
const cameraEl = document.querySelector('#cam');

sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Инициализация...";
    video.play().then(() => { 
        video.pause(); 
        sceneEl.systems['mindar-image-system'].start(); 
    }).catch(() => { 
        sceneEl.systems['mindar-image-system'].start(); 
    });
});

sceneEl.addEventListener("arReady", () => { status.innerHTML = "Наведите на маркеры"; });

// ТАРГЕТЫ 0, 1, 2
document.querySelector('#target0').addEventListener("targetFound", () => { video.play(); status.innerHTML = "Смотрим видео"; });
document.querySelector('#target0').addEventListener("targetLost", () => { video.pause(); });
document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "Крутите модель 1"; });

document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 2"; 
    worldContainer.setAttribute('visible', 'true');
    closeBtn.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
});

// ТАРГЕТ 3: ЛОГИКА ПОРТАЛА
const enterPortal = () => {
    status.innerHTML = "РЕЖИМ 360 ВКЛЮЧЕН";
    skyPortal.setAttribute('visible', 'true');
    exitBtn.setAttribute('visible', 'true');
    video.currentTime = 0;
    video.play();
    cameraEl.setAttribute('look-controls', 'enabled: true');
};

portalButton.addEventListener('click', enterPortal);
portalButton.addEventListener('mousedown', enterPortal); // Доп. для iOS

exitBtn.addEventListener('click', () => {
    skyPortal.setAttribute('visible', 'false');
    exitBtn.setAttribute('visible', 'false');
    cameraEl.setAttribute('look-controls', 'enabled: false');
    cameraEl.setAttribute('rotation', '0 0 0');
});

// ВРАЩЕНИЕ
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
window.addEventListener('touchstart', (e) => { isDragging = true; previousMousePosition.x = e.touches[0].clientX; previousMousePosition.y = e.touches[0].clientY; });
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    let activeModel = null;
    if (status.innerHTML.includes("модель 1")) activeModel = model1;
    else if (status.innerHTML.includes("модель 2")) activeModel = freeModel;

    if (activeModel) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        let rot = activeModel.getAttribute('rotation');
        activeModel.setAttribute('rotation', { x: rot.x + deltaY * 0.5, y: rot.y + deltaX * 0.8, z: rot.z });
    }
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});
