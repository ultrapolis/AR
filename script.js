const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const hiddenViewer = document.querySelector('#hidden-viewer');

// 1. Создание кнопок
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

// 2. Старт
sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Инициализация...";
    video.play().then(() => { video.pause(); sceneEl.systems['mindar-image-system'].start(); })
    .catch(() => { sceneEl.systems['mindar-image-system'].start(); });
});

sceneEl.addEventListener("arReady", () => { status.innerHTML = "Наведите на страницу"; });

// 3. ТАРГЕТ 0: ВИДЕО
document.querySelector('#target0').addEventListener("targetFound", () => {
    video.currentTime = 0; video.play();
    status.innerHTML = "Смотрим видео...";
    playBtn.style.display = 'block'; 
});
document.querySelector('#target0').addEventListener("targetLost", () => { 
    video.pause(); playBtn.style.display = 'none'; 
});

// 4. ТАРГЕТ 1: МОДЕЛЬ 1 (Вращаемая)
document.querySelector('#target1').addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});

// 5. ТАРГЕТ 2: ПРЫЖОК В НАСТОЯЩИЙ AR
document.querySelector('#target2').addEventListener("targetFound", () => {
    status.innerHTML = "ОТКРЫВАЮ МОДЕЛЬ В КОМНАТЕ...";
    
    // Это магическая команда, которая запускает системный AR
    hiddenViewer.activateAR();
});

// 6. УПРАВЛЕНИЕ ВИДЕО
playBtn.addEventListener('click', () => {
    if (video.paused) { video.play(); playBtn.innerHTML = "PAUSE"; }
    else { video.pause(); playBtn.innerHTML = "PLAY"; }
});

// 7. ВРАЩЕНИЕ ПАЛЬЦЕМ (для модели 1)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});

window.addEventListener('touchend', () => { isDragging = false; });

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (status.innerHTML.includes("модель 1")) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        let rot = model1.getAttribute('rotation');
        model1.setAttribute('rotation', {
            x: rot.x + deltaY * 0.5,
            y: rot.y + deltaX * 0.8,
            z: rot.z
        });
    }
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});
