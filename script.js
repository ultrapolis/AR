const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');

// Кнопки
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

const closeBtn = document.createElement('button');
closeBtn.id = 'close-btn';
closeBtn.innerHTML = '✕';
document.body.appendChild(closeBtn);

// Старт
sceneEl.addEventListener('renderstart', () => { status.innerHTML = "Всё готово!"; btn.style.display = 'block'; });
btn.addEventListener('click', () => {
    btn.style.display = 'none';
    status.innerHTML = "Инициализация...";
    video.play().then(() => { video.pause(); sceneEl.systems['mindar-image-system'].start(); })
    .catch(() => { sceneEl.systems['mindar-image-system'].start(); });
});

// Таргет 0: Видео
document.querySelector('#target0').addEventListener("targetFound", () => {
    video.currentTime = 0; video.play(); status.innerHTML = "Смотрим видео...";
    playBtn.style.display = 'block';
});
document.querySelector('#target0').addEventListener("targetLost", () => { video.pause(); playBtn.style.display = 'none'; });

// Таргет 1: Модель 1
document.querySelector('#target1').addEventListener("targetFound", () => { status.innerHTML = "Крутите модель 1!"; });

// Таргет 2: Свободная модель
document.querySelector('#target2').addEventListener("targetFound", () => {
    if (worldContainer.getAttribute('visible') === 'false') {
        status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН!";
        
        // Математика фиксации перед камерой
        const cameraEl = document.querySelector('a-camera');
        const pos = new THREE.Vector3();
        const dir = new THREE.Vector3();
        cameraEl.object3D.getWorldPosition(pos);
        cameraEl.object3D.getWorldDirection(dir);

        worldContainer.setAttribute('position', {
            x: pos.x - (dir.x * 2),
            y: pos.y - (dir.y * 2) - 0.5,
            z: pos.z - (dir.z * 2)
        });
        
        const camRot = cameraEl.getAttribute('rotation');
        worldContainer.setAttribute('rotation', {x: 0, y: camRot.y, z: 0});

        worldContainer.setAttribute('visible', 'true');
        closeBtn.style.display = 'block';
    }
});

closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
    status.innerHTML = "Наведите на маркер...";
});

playBtn.addEventListener('click', () => {
    if (video.paused) { video.play(); playBtn.innerHTML = "PAUSE"; }
    else { video.pause(); playBtn.innerHTML = "PLAY"; }
});

// УНИВЕРСАЛЬНОЕ ВРАЩЕНИЕ (Исправлено!)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
window.addEventListener('touchend', () => { isDragging = false; });

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    let activeModel = null;
    
    // ПРОВЕРКА: Какую модель крутить?
    if (worldContainer.getAttribute('visible') === 'true') {
        activeModel = freeModel; // Если открыта 3-я модель, крутим её
    } else if (status.innerHTML.includes("модель 1")) {
        activeModel = model1; // Если видим маркер 2, крутим первую
    }

    if (activeModel) {
        let rot = activeModel.getAttribute('rotation');
        activeModel.setAttribute('rotation', {
            x: rot.x + deltaY * 0.5,
            y: rot.y + deltaX * 0.8,
            z: rot.z
        });
    }
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
