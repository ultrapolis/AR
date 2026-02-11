const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');
const hiddenViewer = document.querySelector('#hidden-viewer');
const arButton = document.querySelector('#ar-button');

// 1. Показ кнопки START
sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

// 2. Запуск AR
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

sceneEl.addEventListener("arReady", () => { 
    status.innerHTML = "ГОТОВО! Наведите на страницу"; 
});

// 3. СТРАНИЦА 1: ВИДЕО
document.querySelector('#target0').addEventListener("targetFound", () => {
    status.innerHTML = "Смотрим видео...";
    video.currentTime = 0; video.play();
});
document.querySelector('#target0').addEventListener("targetLost", () => { video.pause(); });

// 4. СТРАНИЦА 2: МОДЕЛЬ 1
document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "Крутите модель 1!"; });

// 5. СТРАНИЦА 3: СИСТЕМНЫЙ AR
document.querySelector('#target2').addEventListener("targetFound", () => {
    status.innerHTML = "МАРКЕР НАЙДЕН!";
    // Показываем розовый шар в AR (внутри MindAR), чтобы знать, что маркер виден
    worldContainer.setAttribute('visible', 'true');
    // Показываем кнопку для "вылета" в реальный мир
    arButton.style.display = 'block'; 
});

document.querySelector('#target2').addEventListener("targetLost", () => {
    worldContainer.setAttribute('visible', 'false');
    // Кнопку не прячем, чтобы пользователь успел нажать
});

// Активация системного AR по клику
arButton.addEventListener('click', () => {
    arButton.style.display = 'none';
    status.innerHTML = "ЗАПУСК СИСТЕМНОГО AR...";
    hiddenViewer.activateAR();
});

// 6. ВРАЩЕНИЕ МОДЕЛИ 1
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (!isDragging || !status.innerHTML.includes("модель 1")) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    let rot = model1.getAttribute('rotation');
    model1.setAttribute('rotation', {
        x: rot.x + deltaY * 0.5,
        y: rot.y + deltaX * 0.8,
        z: rot.z
    });
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});
