// ==========================================
// БЛОК 1: Объявление переменных
// ==========================================
const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video1 = document.querySelector('#v1'); // Обычное видео
const video360 = document.querySelector('#v360'); // Видео для портала
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');
const closeBtn = document.querySelector('#close-btn');

const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const cameraEl = document.querySelector('#cam');

// ==========================================
// БЛОК 2: Загрузка ресурсов и запуск
// ==========================================
const assets = document.querySelector('a-assets');

// Отслеживаем прогресс загрузки (модели + видео)
assets.addEventListener('progress', (e) => {
    const percent = Math.floor(e.detail.progress * 100);
    status.innerHTML = `Загрузка контента: ${percent}%`;
});

// Когда всё загружено
assets.addEventListener('loaded', () => {
    status.innerHTML = "Контент загружен!";
    btn.style.display = 'block';
});

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    
    // "Будим" оба видео для iOS (обязательный жест)
    video1.play().then(() => { video1.pause(); });
    video360.play().then(() => { video360.pause(); });
    
    sceneEl.systems['mindar-image-system'].start();
});

// Когда MindAR инициализировался
sceneEl.addEventListener("arReady", () => { 
    status.innerHTML = "Наведите на маркеры"; 
});

// ==========================================
// БЛОК 3: Обработка таргетов 0, 1, 2
// ==========================================
document.querySelector('#target0').addEventListener("targetFound", () => { 
    video1.play(); 
    status.innerHTML = "Видео активно"; 
});
document.querySelector('#target0').addEventListener("targetLost", () => { 
    video1.pause(); 
});

document.querySelector('#target1').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 1"; 
});

document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 2"; 
    worldContainer.setAttribute('visible', 'true');
    closeBtn.style.display = 'block';
});

// Кнопка закрытия захваченной модели 2
closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
});

// ==========================================
// БЛОК 4: Поиск таргета 3 (Портал)
// ==========================================
document.querySelector('#target3').addEventListener("targetFound", () => {
    // Показываем кнопку входа, только если мы еще не внутри портала
    if (skyPortal.getAttribute('visible') === false) {
        status.innerHTML = "Маркер портала найден";
        enter360Btn.style.display = 'block';
    }
});

document.querySelector('#target3').addEventListener("targetLost", () => {
    enter360Btn.style.display = 'none';
});

// ==========================================
// БЛОК 5: Логика ВХОДА в портал 360
// ==========================================
enter360Btn.addEventListener('click', () => {
    enter360Btn.style.display = 'none';
    exit360Btn.style.display = 'block';
    
    // Запрос разрешения на датчики (для iPhone)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    cameraEl.setAttribute('look-controls', 'enabled: true');
                }
            })
            .catch(console.error);
    } else {
        cameraEl.setAttribute('look-controls', 'enabled: true');
    }

    skyPortal.setAttribute('visible', 'true');
    video360.currentTime = 0;
    video360.play(); // Играет только портальное видео
    
    status.style.display = 'none'; 
});

// ==========================================
// БЛОК 6: Логика ВЫХОДА из портала 360
// ==========================================
exit360Btn.addEventListener('click', () => {
    exit360Btn.style.display = 'none';
    
    skyPortal.setAttribute('visible', 'false');
    video360.pause();
    video360.currentTime = 0;
    
    // Выключаем гироскоп
    cameraEl.setAttribute('look-controls', 'enabled: false');
    
    // Сбрасываем вращение камеры (AFRAME метод)
    if(cameraEl.components['look-controls']) {
        cameraEl.components['look-controls'].yawObject.rotation.set(0, 0, 0);
        cameraEl.components['look-controls'].pitchObject.rotation.set(0, 0, 0);
    }
    
    status.style.display = 'block';
    status.innerHTML = "Наведите на маркер";
});

// ==========================================
// БЛОК 7: Вращение моделей пальцем
// ==========================================
let isDragging = false;
let prevX = 0; 
let prevY = 0;

window.addEventListener('touchstart', (e) => { 
    isDragging = true; 
    prevX = e.touches[0].clientX; 
    prevY = e.touches[0].clientY; 
});

window.addEventListener('touchend', () => isDragging = false);

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    let active = null;
    if (status.innerHTML.includes("модель 1")) active = model1;
    else if (status.innerHTML.includes("модель 2")) active = freeModel;

    if (active) {
        let rot = active.getAttribute('rotation');
        active.setAttribute('rotation', { 
            x: rot.x + (e.touches[0].clientY - prevY) * 0.5, 
            y: rot.y + (e.touches[0].clientX - prevX) * 0.8, 
            z: rot.z 
        });
    }
    prevX = e.touches[0].clientX; 
    prevY = e.touches[0].clientY;
});
