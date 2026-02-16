

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
const venusModel = document.querySelector('#venus-splat-portal');
const closeBtn = document.querySelector('#close-btn');

const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const uiBottom = document.querySelector('#ui-bottom-360');
const playPauseBtn = document.querySelector('#play-pause-360');
const zoomSlider = document.querySelector('#zoom-slider');
const cameraEl = document.querySelector('#cam');

// БЕЗОПАСНЫЙ ФИКС ПИКСЕЛЕЙ
window.addEventListener('load', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('render-target-loaded', () => {
            if (scene.renderer) scene.renderer.setPixelRatio(window.devicePixelRatio);
        });
    }
});

// ==========================================
// БЛОК 2: Безопасный запуск системы
// ==========================================
const assets = document.querySelector('a-assets');

const activateStart = () => {
    if (btn && btn.style.display !== 'block') {
        status.innerHTML = "Готово. Нажмите START";
        btn.style.display = 'block';
    }
};

if (assets) {
    assets.addEventListener('loaded', activateStart);
    assets.addEventListener('progress', (e) => {
        status.innerHTML = `Загрузка контента: ${Math.floor(e.detail.progress * 100)}%`;
    });
}
setTimeout(activateStart, 5000);

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Настройка разрешений...";
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(proceedToAR).catch(proceedToAR);
    } else { proceedToAR(); }
});

function proceedToAR() {
    status.innerHTML = "Запуск камеры...";
    if(video1) video1.play().then(() => video1.pause()).catch(() => {});
    if(video360) video360.play().then(() => video360.pause()).catch(() => {});
    
    setTimeout(() => {
        const arSystem = sceneEl.systems['mindar-image-system'];
        if (arSystem) arSystem.start();
        window.dispatchEvent(new Event('resize'));
    }, 300);
}

sceneEl.addEventListener("arReady", () => { status.innerHTML = "Наведите на маркеры"; });

// ==========================================
// БЛОК 3: Таргеты
// ==========================================
document.querySelector('#target0').addEventListener("targetFound", () => { video1.play(); status.innerHTML = "Видео активно"; });
document.querySelector('#target0').addEventListener("targetLost", () => { video1.pause(); });
document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "модель 1"; });
document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 2"; worldContainer.setAttribute('visible', 'true'); closeBtn.style.display = 'block';
});
document.querySelector('#target4').addEventListener("targetFound", () => { status.innerHTML = "Venus"; });

closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
});

// ==========================================
// БЛОК 4: Поиск порталов (Видео и Венера)
// ==========================================
document.querySelector('#target3').addEventListener("targetFound", () => {
    status.innerHTML = "Маркер портала найден";
    if (skyPortal.getAttribute('visible') === false) enter360Btn.style.display = 'block';
});
document.querySelector('#target3').addEventListener("targetLost", () => {
    enter360Btn.style.display = 'none';
});

// Добавляем появление кнопки для маркера Венеры
document.querySelector('#target4').addEventListener("targetFound", () => { 
    status.innerHTML = "Venus"; 
    // Красный шарик можешь убрать из index.html, когда убедишься, что всё работает
    if (document.querySelector('#venus-portal-world').getAttribute('visible') === false) {
        enter360Btn.style.display = 'block';
    }
});
document.querySelector('#target4').addEventListener("targetLost", () => {
    enter360Btn.style.display = 'none';
});

// ==========================================
// БЛОК 5: ВХОД В ПОРТАЛ (Умный выбор)
// ==========================================
enter360Btn.addEventListener('click', () => {
    enter360Btn.style.display = 'none';
    exit360Btn.style.display = 'block';
    uiBottom.style.display = 'block';
    
    // Включаем гироскоп для обзора головой
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') cameraEl.setAttribute('look-controls', 'enabled: true');
        });
    } else {
        cameraEl.setAttribute('look-controls', 'enabled: true');
    }

    // РАЗДЕЛЯЕМ ЛОГИКУ: куда мы входим?
    if (status.innerHTML.includes("Venus")) {
        // 1. Мы входим в 3D-мир Венеры
        document.querySelector('#venus-portal-world').setAttribute('visible', 'true');
        skyPortal.setAttribute('visible', 'false');
        playPauseBtn.style.display = 'none'; // Скрываем кнопку паузы (для 3D она не нужна)
    } else {
        // 2. Мы входим в Видео 360
        skyPortal.setAttribute('visible', 'true');
        document.querySelector('#venus-portal-world').setAttribute('visible', 'false');
        playPauseBtn.style.display = 'inline-block';
        playPauseBtn.innerHTML = "PAUSE";
        video360.currentTime = 0;
        setTimeout(() => { video360.play(); }, 150);
    }
    
    status.style.display = 'none'; 
});

playPauseBtn.addEventListener('click', () => {
    if (video360.paused) {
        video360.play(); playPauseBtn.innerHTML = "PAUSE";
    } else {
        video360.pause(); playPauseBtn.innerHTML = "PLAY";
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
    
    // Выключаем ОБА портала
    skyPortal.setAttribute('visible', 'false');
    document.querySelector('#venus-portal-world').setAttribute('visible', 'false');
    
    video360.pause();
    video360.currentTime = 0;
    
    cameraEl.setAttribute('look-controls', 'enabled: false');
    
    if(cameraEl.components['look-controls']) {
        cameraEl.components['look-controls'].yawObject.rotation.set(0, 0, 0);
        cameraEl.components['look-controls'].pitchObject.rotation.set(0, 0, 0);
    }
    cameraEl.setAttribute('rotation', '0 0 0');
    cameraEl.setAttribute('camera', 'fov', 100);
    zoomSlider.value = 100;
    
    status.style.display = 'block';
    status.innerHTML = "Возврат в AR...";

    setTimeout(() => {
        sceneEl.renderer.clear(); 
        status.innerHTML = "Наведите на маркеры";
        if(video1) { video1.pause(); video1.currentTime = 0; }
        window.dispatchEvent(new Event('resize'));
    }, 500);
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
    let active = status.innerHTML.includes("модель 1") ? model1 : 
                 (status.innerHTML.includes("модель 2") ? freeModel : 
                 (status.innerHTML.includes("Venus") ? venusModel : null));
    if (active) {
        let rot = active.getAttribute('rotation') || {x: 0, y: 0, z: 0};
        active.setAttribute('rotation', { 
            x: rot.x + (e.touches[0].clientY - prevY) * 0.5, 
            y: rot.y + (e.touches[0].clientX - prevX) * 0.8, 
            z: rot.z 
        });
    }
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
});




