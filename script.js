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
const closeBtn = document.querySelector('#close-btn');

const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const uiBottom = document.querySelector('#ui-bottom-360'); // Панель зума и паузы
const playPauseBtn = document.querySelector('#play-pause-360');
const zoomSlider = document.querySelector('#zoom-slider');
const cameraEl = document.querySelector('#cam');

// ==========================================
// БЛОК 2: Загрузка ресурсов (с защитой от зависания)
// ==========================================
const assets = document.querySelector('a-assets');

// 1. Обработка прогресса
assets.addEventListener('progress', (e) => {
    const progress = e.detail.progress;
    if (typeof progress === 'number' && progress > 0) {
        const percent = Math.floor(progress * 100);
        status.innerHTML = `Контент загружается: ${percent}%`;
    }
});

// 2. Основная функция активации кнопки
const activateStart = () => {
    status.innerHTML = "Почти готово... Нажмите START";
    btn.style.display = 'block';
};

// 3. Слушаем событие полной загрузки
assets.addEventListener('loaded', activateStart);

// 4. СТРАХОВКА: Если ассеты уже в кэше, событие 'loaded' может не сработать.
// Проверяем через 2 секунды, если кнопка еще не появилась — выводим её принудительно.
setTimeout(() => {
    if (btn.style.display === 'none') {
        console.log("Запуск по таймеру (ресурсы из кэша или сбой события)");
        activateStart();
    }
}, 3000); // 3 секунды ожидания

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Запуск камеры...";
    
    // Пытаемся разблокировать видео
    if(video1) video1.play().then(() => { video1.pause(); }).catch(e => console.log(e));
    if(video360) video360.play().then(() => { video360.pause(); }).catch(e => console.log(e));
    
    sceneEl.systems['mindar-image-system'].start();
});

// ==========================================
// БЛОК 3: Таргеты 0, 1, 2
// ==========================================
document.querySelector('#target0').addEventListener("targetFound", () => { 
    video1.play(); 
    status.innerHTML = "Видео активно"; 
});
document.querySelector('#target0').addEventListener("targetLost", () => { video1.pause(); });
document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "модель 1"; });
document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 2"; 
    worldContainer.setAttribute('visible', 'true');
    closeBtn.style.display = 'block';
});
closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
});

// ==========================================
// БЛОК 4: Поиск портала (Таргет 3)
// ==========================================
document.querySelector('#target3').addEventListener("targetFound", () => {
    if (skyPortal.getAttribute('visible') === false) {
        status.innerHTML = "Маркер портала найден";
        enter360Btn.style.display = 'block';
    }
});
document.querySelector('#target3').addEventListener("targetLost", () => {
    enter360Btn.style.display = 'none';
});

// ==========================================
// БЛОК 5: ВХОД В ПОРТАЛ
// ==========================================
enter360Btn.addEventListener('click', () => {
    enter360Btn.style.display = 'none';
    exit360Btn.style.display = 'block';
    uiBottom.style.display = 'block'; // Показываем всю нижнюю панель
    playPauseBtn.innerHTML = "PAUSE";
    
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') cameraEl.setAttribute('look-controls', 'enabled: true');
        });
    } else {
        cameraEl.setAttribute('look-controls', 'enabled: true');
    }

    skyPortal.setAttribute('visible', 'true');
    video360.currentTime = 0;
    setTimeout(() => { video360.play(); }, 150);
    status.style.display = 'none'; 
});

playPauseBtn.addEventListener('click', () => {
    if (video360.paused) {
        video360.play();
        playPauseBtn.innerHTML = "PAUSE";
    } else {
        video360.pause();
        playPauseBtn.innerHTML = "PLAY";
    }
});

zoomSlider.addEventListener('input', (e) => {
    cameraEl.setAttribute('camera', 'fov', e.target.value);
});

// ==========================================
// БЛОК 6: ВЫХОД ИЗ ПОРТАЛА
// ==========================================
exit360Btn.addEventListener('click', () => {
    exit360Btn.style.display = 'none';
    uiBottom.style.display = 'none';
    
    skyPortal.setAttribute('visible', 'false');
    video360.pause();
    
    cameraEl.setAttribute('look-controls', 'enabled: false');
    if(cameraEl.components['look-controls']) {
        cameraEl.components['look-controls'].yawObject.rotation.set(0, 0, 0);
        cameraEl.components['look-controls'].pitchObject.rotation.set(0, 0, 0);
    }
    cameraEl.setAttribute('camera', 'fov', 100);
    zoomSlider.value = 100;
    
    status.style.display = 'block';
    status.innerHTML = "Наведите на маркер";
});

// ==========================================
// БЛОК 7: Вращение
// ==========================================
let isDragging = false;
let prevX = 0; let prevY = 0;
window.addEventListener('touchstart', (e) => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; });
window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    let active = status.innerHTML.includes("модель 1") ? model1 : (status.innerHTML.includes("модель 2") ? freeModel : null);
    if (active) {
        let rot = active.getAttribute('rotation');
        active.setAttribute('rotation', { 
            x: rot.x + (e.touches[0].clientY - prevY) * 0.5, 
            y: rot.y + (e.touches[0].clientX - prevX) * 0.8, 
            z: rot.z 
        });
    }
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
});

