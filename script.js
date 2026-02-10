const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');

// 1. Создание кнопок
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

const closeBtn = document.createElement('button');
closeBtn.id = 'close-btn';
closeBtn.innerHTML = '✕';
document.body.appendChild(closeBtn);

// 2. Инициализация
sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

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
    status.innerHTML = "ГОТОВО! Наведите на монитор"; 
});

// 3. СТРАНИЦА 1: ВИДЕО
document.querySelector('#target0').addEventListener("targetFound", () => {
    video.currentTime = 0; video.play();
    status.innerHTML = "Смотрим видео...";
    playBtn.style.display = 'block'; 
});
document.querySelector('#target0').addEventListener("targetLost", () => { 
    video.pause(); playBtn.style.display = 'none'; 
});

// 4. СТРАНИЦА 2: МОДЕЛЬ 1
const t1 = document.querySelector('#target1');
t1.addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});
// Сбрасываем статус, чтобы не мешать определению 3-й страницы
t1.addEventListener("targetLost", () => { 
    if (worldContainer.getAttribute('visible') === 'false') {
        status.innerHTML = "Ищу следующий маркер..."; 
    }
});

// 5. СТРАНИЦА 3: ЗАКРЕПЛЕНИЕ ОБЪЕКТА В МИРЕ
const t2 = document.querySelector('#target2');

t2.addEventListener("targetFound", () => {
    // Срабатывает только если объект еще не закреплен
    if (worldContainer.getAttribute('visible') === 'false') {
        status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН";

        // Загружаем модель
        if (!freeModel.getAttribute('src')) {
            freeModel.setAttribute('src', './model2.glb');
        }

        const cameraEl = document.querySelector('a-camera');
        
        // Математика Three.js для точного позиционирования перед глазами
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        
        // Узнаем мировые координаты и поворот камеры в текущий момент
        cameraEl.object3D.getWorldPosition(pos);
        cameraEl.object3D.getWorldQuaternion(quat);

        // Ставим контейнер (который вне таргетов) точно туда, где камера
        worldContainer.object3D.position.copy(pos);
        worldContainer.object3D.quaternion.copy(quat);
        
        // Отталкиваем модель от лица на 1.5 метра вперед и чуть вниз
        worldContainer.object3D.translateZ(-1.5);
        worldContainer.object3D.translateY(-0.3);

        worldContainer.setAttribute('visible', 'true');
        closeBtn.style.display = 'block';
    }
});

closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
    status.innerHTML = "Наведите на монитор снова.";
});

// 6. УПРАВЛЕНИЕ ВИДЕО
playBtn.addEventListener('click', () => {
    if (video.paused) { video.play(); playBtn.innerHTML = "PAUSE"; }
    else { video.pause(); playBtn.innerHTML = "PLAY"; }
});

// 7. ВРАЩЕНИЕ
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});

window.addEventListener('touchend', () => { isDragging = false; });

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    let activeModel = null;
    // Если на экране закрепленная модель 3
    if (worldContainer.getAttribute('visible') === 'true') {
        activeModel = freeModel;
    } 
    // Если видим маркер модели 1
    else if (status.innerHTML.includes("модель 1")) {
        activeModel = model1;
    }

    if (activeModel) {
        let rot = activeModel.getAttribute('rotation');
        activeModel.setAttribute('rotation', {
            x: rot.x + deltaY * 0.5,
            y: rot.y + deltaX * 0.8,
            z: rot.z
        });
    }
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
});
