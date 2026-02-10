const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');

// Создание кнопок
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

const closeBtn = document.createElement('button');
closeBtn.id = 'close-btn';
closeBtn.innerHTML = '✕';
document.body.appendChild(closeBtn);

// Запуск
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

sceneEl.addEventListener("arReady", () => { status.innerHTML = "Наведите на страницу"; });

// СТРАНИЦА 1: ВИДЕО
document.querySelector('#target0').addEventListener("targetFound", () => {
    video.currentTime = 0; video.play(); status.innerHTML = "Смотрим видео...";
    playBtn.style.display = 'block';
});
document.querySelector('#target0').addEventListener("targetLost", () => { 
    video.pause(); playBtn.style.display = 'none';
});

// СТРАНИЦА 2: МОДЕЛЬ
document.querySelector('#target1').addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});

// СТРАНИЦА 3: ФИКСАЦИЯ
document.querySelector('#target2').addEventListener("targetFound", () => {
    if (worldContainer.getAttribute('visible') === 'false') {
        status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН В КОМНАТЕ!";
        
        // 1. Сначала показываем (он пока прилип к камере)
        worldContainer.setAttribute('visible', 'true');
        closeBtn.style.display = 'block';

        // 2. МАГИЯ: Через 100мс берем его МИРОВУЮ позицию и переносим в корень сцены
        setTimeout(() => {
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            
            // Узнаем, где в комнате сейчас находится "прилипшая" модель
            worldContainer.object3D.getWorldPosition(worldPos);
            worldContainer.object3D.getWorldQuaternion(worldQuat);

            // Переносим контейнер из камеры в корень сцены
            sceneEl.appendChild(worldContainer);

            // Устанавливаем ему эти МИРОВЫЕ координаты
            worldContainer.object3D.position.copy(worldPos);
            worldContainer.object3D.quaternion.copy(worldQuat);
            
            // Сбрасываем локальное смещение, так как теперь мы в корне сцены
            worldContainer.setAttribute('position', {x: worldPos.x, y: worldPos.y, z: worldPos.z});
        }, 100);
    }
});

// Кнопка закрытия
closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
    status.innerHTML = "Ищу маркер...";
});

// Управление видео
playBtn.addEventListener('click', () => {
    if (video.paused) { video.play(); playBtn.innerHTML = "PAUSE"; }
    else { video.pause(); playBtn.innerHTML = "PLAY"; }
});

// ВРАЩЕНИЕ
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - previousMousePosition.x;
    const deltaY = touch.clientY - previousMousePosition.y;

    let activeModel = null;
    if (status.innerHTML.includes("модель 1")) activeModel = model1;
    if (worldContainer.getAttribute('visible') === 'true') activeModel = freeModel;

    if (activeModel) {
        let rot = activeModel.getAttribute('rotation');
        activeModel.setAttribute('rotation', {
            x: rot.x + deltaY * 0.5,
            y: rot.y + deltaX * 0.8,
            z: rot.z
        });
    }
    previousMousePosition = { x: touch.clientX, y: touch.clientY };
});

