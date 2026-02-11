const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');
const closeBtn = document.querySelector('#close-btn');

// Кнопки портала
const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const cameraEl = document.querySelector('#cam');

sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    video.play().then(() => { video.pause(); });
    sceneEl.systems['mindar-image-system'].start();
});

// Таргеты
document.querySelector('#target0').addEventListener("targetFound", () => { video.play(); status.innerHTML = "Видео активно"; });
document.querySelector('#target0').addEventListener("targetLost", () => { video.pause(); });

document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "модель 1"; });

document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 2"; 
    worldContainer.setAttribute('visible', 'true');
    closeBtn.style.display = 'block';
});

// Логика ПОРТАЛА (Таргет 3)
document.querySelector('#target3').addEventListener("targetFound", () => {
    status.innerHTML = "Маркер портала найден";
    enter360Btn.style.display = 'block'; // Показываем кнопку входа
});
document.querySelector('#target3').addEventListener("targetLost", () => {
    enter360Btn.style.display = 'none';
});

// Нажатие на кнопку "ВОЙТИ В ПОРТАЛ"
enter360Btn.addEventListener('click', () => {
    enter360Btn.style.display = 'none';
    exit360Btn.style.display = 'block';
    skyPortal.setAttribute('visible', 'true');
    video.play();
    cameraEl.setAttribute('look-controls', 'enabled: true');
    status.innerHTML = "Вы внутри портала";
});

// Нажатие на кнопку "ВЫЙТИ ИЗ 360"
exit360Btn.addEventListener('click', () => {
    exit360Btn.style.display = 'none';
    skyPortal.setAttribute('visible', 'false');
    cameraEl.setAttribute('look-controls', 'enabled: false');
    cameraEl.setAttribute('rotation', '0 0 0');
    status.innerHTML = "Наведите на маркер";
});

// Закрытие модели 2
closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
});

// Вращение моделей
let isDragging = false;
let prevX = 0; let prevY = 0;
window.addEventListener('touchstart', (e) => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; });
window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    let active = status.innerHTML.includes("модель 1") ? model1 : (status.innerHTML.includes("модель 2") ? freeModel : null);
    if (active) {
        let rot = active.getAttribute('rotation');
        active.setAttribute('rotation', { x: rot.x + (e.touches[0].clientY - prevY) * 0.5, y: rot.y + (e.touches[0].clientX - prevX) * 0.8, z: rot.z });
    }
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
});
