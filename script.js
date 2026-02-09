const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model = document.querySelector('#model-to-rotate');

// 1. Кнопка Плей/Пауза для видео
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

// 2. Показ кнопки START после загрузки ресурсов
sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

// 3. Запуск AR по кнопке
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

// 4. Логика для Страницы 1 (Видео)
const t0 = document.querySelector('#target0');
t0.addEventListener("targetFound", () => {
    status.innerHTML = "Страница 1 оживает...";
    video.currentTime = 0;
    video.play();
    playBtn.style.display = 'block';
    playBtn.innerHTML = "PAUSE";
});
t0.addEventListener("targetLost", () => {
    status.innerHTML = "Ищу страницу...";
    video.pause();
    playBtn.style.display = 'none';
});

// 5. Логика для Страницы 2 (Модель)
const t1 = document.querySelector('#target1');
t1.addEventListener("targetFound", () => {
    status.innerHTML = "Загружаю 3D объект...";
    playBtn.style.display = 'none';
});

// 6. Управление видео кнопкой
playBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playBtn.innerHTML = "PAUSE";
    } else {
        video.pause();
        playBtn.innerHTML = "PLAY";
    }
});

// 7. ЛОГИКА ВРАЩЕНИЯ МОДЕЛИ (то самое, что ты прислала)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Для мышки (если смотришь с компа)
window.addEventListener('mousedown', (e) => { isDragging = true; });
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', (e) => {
    if (!isDragging || !model) return;
    const deltaX = e.movementX;
    let currentRotation = model.getAttribute('rotation');
    model.setAttribute('rotation', {
        x: currentRotation.x,
        y: currentRotation.y + deltaX * 0.5,
        z: currentRotation.z
    });
});

// Для iPhone (сенсор)
window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX };
});
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (!isDragging || !model) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - previousMousePosition.x;
    
    let currentRotation = model.getAttribute('rotation');
    model.setAttribute('rotation', {
        x: currentRotation.x,
        y: currentRotation.y + deltaX * 0.8,
        z: currentRotation.z
    });
    previousMousePosition = { x: touch.clientX };
});
