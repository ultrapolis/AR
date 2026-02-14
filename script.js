// Динамический импорт в начале файла
import { LumaSplatsThree } from '@lumaai/luma-web';

// ==========================================
// РЕГИСТРАЦИЯ КОМПОНЕНТА LUMA
// ==========================================
AFRAME.registerComponent('luma-model', {
    schema: { url: { type: 'string' } },
    init: function () {
        // Создаем модель без лишних настроек для теста
        const splat = new LumaSplatsThree({
            source: this.data.url,
            enableFastInits: true
        });

        // Прикрепляем к A-Frame
        this.el.setObject3D('mesh', splat);
    }
});

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
const lumaSplat = document.querySelector('#luma-splat');
const closeBtn = document.querySelector('#close-btn');

const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const uiBottom = document.querySelector('#ui-bottom-360');
const playPauseBtn = document.querySelector('#play-pause-360');
const zoomSlider = document.querySelector('#zoom-slider');
const cameraEl = document.querySelector('#cam');

// ==========================================
// БЛОК 2: Запуск системы
// ==========================================
const assets = document.querySelector('a-assets');

const activateStart = () => {
    if (btn.style.display !== 'block') {
        status.innerHTML = "Готово. Нажмите START";
        btn.style.display = 'block';
    }
};

assets.addEventListener('loaded', activateStart);
setTimeout(activateStart, 4000);

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Настройка разрешений...";

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(state => { proceedToAR(); })
            .catch(err => { proceedToAR(); });
    } else {
        proceedToAR();
    }
});

function proceedToAR() {
    status.innerHTML = "Запуск камеры...";
    video1.play().then(() => video1.pause()).catch(e => {});
    video360.play().then(() => video360.pause()).catch(e => {});

    setTimeout(() => {
        try {
            const arSystem = sceneEl.systems['mindar-image-system'];
            if (arSystem) {
                arSystem.ui.showLoading = () => {};
                arSystem.ui.showScanning = () => {};
                arSystem.ui.hideScanning = () => {};
                arSystem.start();
            }
        } catch (e) {
            status.innerHTML = "Ошибка: " + e.message;
        }
    }, 300);
}

sceneEl.addEventListener("arReady", () => { status.innerHTML = "Наведите на маркеры"; });

// ==========================================
// БЛОК 3-4: Таргеты
// ==========================================
document.querySelector('#target0').addEventListener("targetFound", () => { video1.play(); status.innerHTML = "Видео активно"; });
document.querySelector('#target0').addEventListener("targetLost", () => { video1.pause(); });

document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "модель 1"; });

document.querySelector('#target2').addEventListener("targetFound", () => { 
    status.innerHTML = "модель 2"; 
    worldContainer.setAttribute('visible', 'true');
    closeBtn.style.display = 'block';
});

document.querySelector('#target3').addEventListener("targetFound", () => {
    if (skyPortal.getAttribute('visible') === false) {
        status.innerHTML = "Маркер портала найден";
        enter360Btn.style.display = 'block';
    }
});
document.querySelector('#target3').addEventListener("targetLost", () => { enter360Btn.style.display = 'none'; });

// ТАРГЕТ 4 (Luma)
document.querySelector('#target4').addEventListener("targetFound", () => { status.innerHTML = "Luma Splat"; });

closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
});

// ==========================================
// БЛОК 5: Портал
// ==========================================
enter360Btn.addEventListener('click', () => {
    enter360Btn.style.display = 'none';
    exit360Btn.style.display = 'block';
    uiBottom.style.display = 'block';
    playPauseBtn.innerHTML = "PAUSE";
    cameraEl.setAttribute('look-controls', 'enabled: true');
    skyPortal.setAttribute('visible', 'true');
    video360.currentTime = 0;
    setTimeout(() => { video360.play(); }, 200);
    status.style.display = 'none'; 
});

playPauseBtn.addEventListener('click', () => {
    if (video360.paused) { video360.play(); playPauseBtn.innerHTML = "PAUSE"; }
    else { video360.pause(); playPauseBtn.innerHTML = "PLAY"; }
});

zoomSlider.addEventListener('input', (e) => {
    const fovValue = parseFloat(e.target.value);
    if (cameraEl.components.camera) {
        cameraEl.components.camera.data.fov = fovValue;
        cameraEl.setAttribute('camera', 'fov', fovValue);
    }
});

// ==========================================
// БЛОК 6: Выход
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
    cameraEl.setAttribute('rotation', '0 0 0');
    cameraEl.setAttribute('camera', 'fov', 80); 
    zoomSlider.value = 100;
    status.style.display = 'block';
    status.innerHTML = "Синхронизация...";
    setTimeout(() => { window.dispatchEvent(new Event('resize')); status.innerHTML = "Наведите на маркеры"; }, 300);
});

// ==========================================
// БЛОК 7-8: Взаимодействие (Вращение и Зум пальцами)
// ==========================================
let isDragging = false;
let prevX = 0, prevY = 0;
let initialDist = 0, initialScale = 1;

// Универсальная функция для поиска активной модели
function getActiveModel() {
    if (status.innerHTML.includes("модель 1")) return model1;
    if (status.innerHTML.includes("модель 2")) return freeModel;
    if (status.innerHTML.includes("Luma")) return lumaSplat;
    return null;
}

window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        isDragging = false;
        initialDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        let active = getActiveModel();
        if (active) initialScale = active.getAttribute('scale').x;
    }
});

window.addEventListener('touchend', () => { isDragging = false; });

window.addEventListener('touchmove', (e) => {
    let active = getActiveModel();
    if (!active) return;

    if (e.touches.length === 1 && isDragging) {
        let rot = active.getAttribute('rotation');
        active.setAttribute('rotation', {
            x: rot.x + (e.touches[0].clientY - prevY) * 0.5,
            y: rot.y + (e.touches[0].clientX - prevX) * 0.8,
            z: rot.z
        });
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        let currentDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        let newScale = initialScale * (currentDist / initialDist);
        newScale = Math.min(Math.max(newScale, 0.1), 5);
        active.setAttribute('scale', { x: newScale, y: newScale, z: newScale });
    }
});

// Чистильщик VR
setInterval(() => { const vrBtn = document.querySelector('.a-enter-vr'); if (vrBtn) vrBtn.remove(); }, 1000);




