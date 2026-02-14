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
const uiBottom = document.querySelector('#ui-bottom-360');
const playPauseBtn = document.querySelector('#play-pause-360');
const zoomSlider = document.querySelector('#zoom-slider');
const cameraEl = document.querySelector('#cam');

// ==========================================
// БЛОК 2: Безопасный запуск системы (Исправленный)
// ==========================================
const assets = document.querySelector('a-assets');

// Показываем загрузку
assets.addEventListener('progress', (e) => {
    const progress = e.detail.progress;
    if (typeof progress === 'number' && progress >= 0) {
        status.innerHTML = `Загрузка контента: ${Math.floor(progress * 100)}%`;
    }
});

// Кнопка Старт
const activateStart = () => {
    if (btn.style.display !== 'block') {
        status.innerHTML = "Готово. Нажмите START";
        btn.style.display = 'block';
    }
};

assets.addEventListener('loaded', activateStart);
setTimeout(activateStart, 4000); // Даем 4 секунды на кэш

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Настройка разрешений...";

    // 1. Сначала активируем датчики для iOS
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(state => {
                console.log("Датчики наклона: " + state);
                proceedToAR(); 
            })
            .catch(err => {
                console.log("Датчики отклонены, пробуем запустить AR...");
                proceedToAR();
            });
    } else {
        proceedToAR();
    }
});

// Отдельная функция для запуска движка после всех разрешений
function proceedToAR() {
    status.innerHTML = "Запуск камеры...";
    
    // Будим видео (разблокировка звука/автоплея)
    if(video1) video1.play().then(() => video1.pause()).catch(e => {});
    if(video360) video360.play().then(() => video360.pause()).catch(e => {});

    // Даем браузеру 300мс "продохнуть"
    setTimeout(() => {
        try {
            const arSystem = sceneEl.systems['mindar-image-system'];
            if (arSystem) {
                // ФИКС ОШИБКИ ui.showLoading:
                // Принудительно отключаем внутренний UI библиотеки перед стартом
                arSystem.ui.showLoading = () => {};
                arSystem.ui.showScanning = () => {};
                arSystem.ui.hideScanning = () => {};
                
                arSystem.start();
                console.log("MindAR успешно вызван");
            } else {
                status.innerHTML = "Система AR не найдена. Обновите страницу.";
            }
        } catch (e) {
            status.innerHTML = "Ошибка: " + e.message;
            console.error(e);
        }
    }, 300);
}

sceneEl.addEventListener("arReady", () => { 
    status.innerHTML = "Наведите на маркеры"; 
});

sceneEl.addEventListener("arError", (event) => {
    status.innerHTML = "Камера заблокирована. Проверьте настройки.";
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
// БЛОК 4: Поиск портала
// ==========================================
document.querySelector('#target3').addEventListener("targetFound", () => {
    // Показываем кнопку только если мы НЕ в режиме 360
    if (skyPortal.getAttribute('visible') === false) {
        status.innerHTML = "Маркер портала найден";
        enter360Btn.style.display = 'block';
    }
});

document.querySelector('#target3').addEventListener("targetLost", () => {
    // Скрываем кнопку входа всегда, когда маркер потерян
    enter360Btn.style.display = 'none';
});

// ==========================================
// БЛОК 5: ВХОД В ПОРТАЛ И УПРАВЛЕНИЕ
// ==========================================
enter360Btn.addEventListener('click', () => {
    enter360Btn.style.display = 'none';
    exit360Btn.style.display = 'block';
    uiBottom.style.display = 'block';
    playPauseBtn.innerHTML = "PAUSE";
    
    // Активация гироскопа (для iOS)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') {
                cameraEl.setAttribute('look-controls', 'enabled: true');
            }
        }).catch(err => console.error(err));
    } else {
        cameraEl.setAttribute('look-controls', 'enabled: true');
    }

    skyPortal.setAttribute('visible', 'true');
    video360.currentTime = 0;
    
    // Небольшая задержка перед стартом видео
    setTimeout(() => { video360.play(); }, 200);
    
    status.style.display = 'none'; 
});

// ОБРАБОТКА ПАУЗЫ (внутри Блока 5)
playPauseBtn.addEventListener('click', () => {
    if (video360.paused) {
        video360.play();
        playPauseBtn.innerHTML = "PAUSE";
    } else {
        video360.pause();
        playPauseBtn.innerHTML = "PLAY";
    }
});

// ОБРАБОТКА ЗУМА (Тот самый "силовой" метод)
zoomSlider.addEventListener('input', (e) => {
    const fovValue = parseFloat(e.target.value);
    // 1. Обновляем данные компонента напрямую
    if (cameraEl.components.camera) {
        cameraEl.components.camera.data.fov = fovValue;
        // 2. И принудительно обновляем атрибут
        cameraEl.setAttribute('camera', 'fov', fovValue);
    }
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
    cameraEl.setAttribute('rotation', '0 0 0');

    // СБРОС ЗУМА: возвращаем стандартное значение 80
    zoomSlider.value = 100; // на ползунке это 100
    cameraEl.setAttribute('camera', 'fov', 80); 

    status.style.display = 'block';
    status.innerHTML = "Синхронизация AR...";

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        status.innerHTML = "Наведите на маркеры";
        if(video1) {
            video1.pause();
            video1.currentTime = 0;
        }
    }, 300);
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

// ==========================================
// БЛОК 8: Масштабирование (Зум) моделей пальцами
// ==========================================
let initialDist = 0;
let initialScale = 1;

window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        // Запоминаем начальное расстояние между пальцами
        initialDist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
        
        // Определяем, какую модель сейчас зумим
        let active = status.innerHTML.includes("модель 1") ? model1 : (status.innerHTML.includes("модель 2") ? freeModel : null);
        if (active) {
            initialScale = active.getAttribute('scale').x;
        }
    }
});

window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        let active = status.innerHTML.includes("модель 1") ? model1 : (status.innerHTML.includes("модель 2") ? freeModel : null);
        
        if (active) {
            let currentDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            
            // Коэффициент изменения (чувствительность)
            let zoomFactor = currentDist / initialDist;
            let newScale = initialScale * zoomFactor;

            // Ограничиваем зум, чтобы модель не исчезла или не стала на весь экран
            newScale = Math.min(Math.max(newScale, 0.2), 5); 

            active.setAttribute('scale', { x: newScale, y: newScale, z: newScale });
        }
    }
});



