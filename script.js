const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');

// Новые элементы для 360
const skyPortal = document.querySelector('#sky-portal');
const portalButton = document.querySelector('#portal-button');
const exitBtn = document.querySelector('#exit-btn');
const cameraEl = document.querySelector('a-camera');

sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    sceneEl.systems['mindar-image-system'].start();
});

// ТАРГЕТЫ 0, 1, 2 (как были)
document.querySelector('#target0').addEventListener("targetFound", () => { video.play(); status.innerHTML = "Видео 1"; });
document.querySelector('#target0').addEventListener("targetLost", () => { video.pause(); });

document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "Крутите модель 1"; });

document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 2"; 
    worldContainer.setAttribute('visible', 'true');
});
document.querySelector('#target2').addEventListener("targetLost", () => { worldContainer.setAttribute('visible', 'false'); });

// ТАРГЕТ 3: ЛОГИКА ПОРТАЛА
document.querySelector('#target3').addEventListener("targetFound", () => {
    status.innerHTML = "НАЖМИТЕ НА ШАР ДЛЯ ВХОДА В 360";
});

// Клик по шару (вход в 360)
portalButton.addEventListener('click', () => {
    console.log("Portal clicked!"); // Проверим в консоли, доходит ли клик
    status.innerHTML = "РЕЖИМ 360 (Гироскоп)";
    skyPortal.setAttribute('visible', 'true');
    exitBtn.setAttribute('visible', 'true');
    
    video.currentTime = 0; // Начинаем сначала
    video.play(); 
    
    cameraEl.setAttribute('look-controls', 'enabled: true');
   
    // Опционально: можно остановить MindAR, чтобы не греть телефон, 
    // но тогда при выходе нужно будет запускать снова. Пока оставим.
});

// Клик по кнопке EXIT (выход из 360)
exitBtn.addEventListener('click', () => {
    skyPortal.setAttribute('visible', 'false');
    exitBtn.setAttribute('visible', 'false');
    cameraEl.setAttribute('look-controls', 'enabled: false');
    cameraEl.setAttribute('rotation', '0 0 0'); // Сброс взгляда
    status.innerHTML = "Наведите на маркер";
});

// УНИВЕРСАЛЬНОЕ ВРАЩЕНИЕ (для моделей)
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

