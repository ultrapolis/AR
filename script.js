const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const hiddenViewer = document.querySelector('#hidden-viewer');
const arButton = document.querySelector('#ar-button');

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

sceneEl.addEventListener("arReady", () => { status.innerHTML = "Наведите на маркер"; });

// ТАРГЕТЫ 0 и 1 (Видео и Модель 1)
document.querySelector('#target0').addEventListener("targetFound", () => {
    video.currentTime = 0; video.play();
    status.innerHTML = "Смотрим видео...";
    document.body.insertAdjacentHTML('beforeend', '<style id="temp-video-css">#playBtn {display:block !important;}</style>'); 
});

document.querySelector('#target1').addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});

// ТАРГЕТ 2: ПОКАЗ КНОПКИ
document.querySelector('#target2').addEventListener("targetFound", () => {
    status.innerHTML = "МАРКЕР НАЙДЕН!";
    arButton.style.display = 'block';
});

// ГЛАВНЫЙ ФИКС ДЛЯ ЗАПУСКА
arButton.addEventListener('click', () => {
    status.innerHTML = "ЗАПУСК СИСТЕМНОГО AR...";
    
    // Принудительно "будим" модель перед активацией
    hiddenViewer.style.opacity = "1";
    
    // Через 100мс запускаем AR
    setTimeout(() => {
        hiddenViewer.activateAR();
        // Прячем всё обратно через секунду, чтобы не мешало
        setTimeout(() => {
            hiddenViewer.style.opacity = "0.01";
            arButton.style.display = 'none';
        }, 1000);
    }, 100);
});

// Логика вращения (только для модели 1)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
window.addEventListener('touchstart', (e) => { isDragging = true; previousMousePosition.x = e.touches[0].clientX; previousMousePosition.y = e.touches[0].clientY; });
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (!isDragging || !status.innerHTML.includes("модель 1")) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    let rot = model1.getAttribute('rotation');
    model1.setAttribute('rotation', { x: rot.x + deltaY * 0.5, y: rot.y + deltaX * 0.8, z: rot.z });
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});
