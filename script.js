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
const venusModel = document.querySelector('#venus-model'); // ДОБАВЛЕНО: Венера
const closeBtn = document.querySelector('#close-btn');

const skyPortal = document.querySelector('#sky-portal');
const enter360Btn = document.querySelector('#enter-360');
const exit360Btn = document.querySelector('#exit-360');
const uiBottom = document.querySelector('#ui-bottom-360');
const playPauseBtn = document.querySelector('#play-pause-360');
const zoomSlider = document.querySelector('#zoom-slider');
const cameraEl = document.querySelector('#cam');

// ==========================================
// БЛОК 2: Безопасный запуск системы
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
                proceedToAR(); // Идем дальше после клика
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
    
    // Будим видео
    if(video1) video1.play().then(() => video1.pause()).catch(e => {});
    if(video360) video360.play().then(() => video360.pause()).catch(e => {});

    // Даем браузеру 300мс "продохнуть" перед запуском тяжелого AR-движка
    setTimeout(() => {
        try {
            const arSystem = sceneEl.systems['mindar-image-system'];
            if (arSystem) {
                arSystem.start();
                console.log("MindAR успешно вызван");
                // ДОБАВЛЕНО: фикс ресайза для мобильных
                window.dispatchEvent(new Event('resize'));
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
// БЛОК 3: Таргеты 0, 1, 2, 4
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
// ДОБАВЛЕНО: Статус для Венеры
document.querySelector('#target4').addEventListener("targetFound", () => { status.innerHTML = "Venus"; });

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
// БЛОК 6: ВЫХОД ИЗ ПОРТАЛА (с перезапуском AR)
// ==========================================
exit360Btn.addEventListener('click', () => {
    exit360Btn.style.display = 'none';
    uiBottom.style.display = 'none';
    
    // 1. Скрываем портал и гасим видео
    skyPortal.setAttribute('visible', 'false');
    video360.pause();
    video360.currentTime = 0;
    
    // 2. Выключаем гироскоп
    cameraEl.setAttribute('look-controls', 'enabled: false');
    
    // 3. СБРОС КАМЕРЫ (очень важно для возврата к маркерам)
    if(cameraEl.components['look-controls']) {
        // Обнуляем углы поворота
        cameraEl.components['look-controls'].yawObject.rotation.set(0, 0, 0);
        cameraEl.components['look-controls'].pitchObject.rotation.set(0, 0, 0);
    }
    // Принудительно ставим камеру в ноль, чтобы она "увидела" маркеры перед собой
    cameraEl.setAttribute('rotation', '0 0 0');
    cameraEl.setAttribute('camera', 'fov', 100);
    zoomSlider.value = 100;
    
    // 4. ПЕРЕЗАПУСК ДВИЖКА
    status.style.display = 'block';
    status.innerHTML = "Возврат в AR...";

    setTimeout(() => {
        // Команда на перерисовку сцены
        sceneEl.renderer.clear(); 
        status.innerHTML = "Наведите на маркеры";
        
        if(video1) {
            video1.pause();
            video1.currentTime = 0;
        }
        window.dispatchEvent(new Event('resize'));
    }, 500);
});

// ==========================================
// БЛОК 7: Вращение (ОБНОВЛЕНО для Венеры)
// ==========================================
let isDragging = false;
let prevX = 0; let prevY = 0;
window.addEventListener('touchstart', (e) => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; });
window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    // Находим активную модель, включая Венеру
    let active = status.innerHTML.includes("модель 1") ? model1 : 
                 (status.innerHTML.includes("модель 2") ? freeModel : 
                 (status.innerHTML.includes("Venus") ? venusModel : null));
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
