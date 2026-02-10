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
document.querySelector('#target1').addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});

// 5. СТРАНИЦА 3: ЗАКРЕПЛЕНИЕ (Метод Якоря на Маркере)
const t2 = document.querySelector('#target2');

t2.addEventListener("targetFound", () => {
    if (worldContainer.getAttribute('visible') === 'false') {
        status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН";

        // 1. Загружаем модель
        if (!freeModel.getAttribute('src')) {
            freeModel.setAttribute('src', './model2.glb');
        }

        // 2. Берем камеру
        const cameraEl = document.querySelector('a-camera');
        
        // 3. Прямая привязка: 
        // Мы НЕ считаем сложные матрицы. Мы просто спрашиваем у A-Frame:
        // "Где сейчас находится камера?"
        const camPos = cameraEl.getAttribute('position');
        const camRot = cameraEl.getAttribute('rotation');

        // 4. Ставим модель в ту же точку, что и камера...
        worldContainer.setAttribute('position', camPos);
        
        // ...и "отталкиваем" её от себя на 1.5 метра вперёд 
        // (в локальных координатах это проще всего)
        // Но чтобы она не липла, мы делаем это ОДИН РАЗ
        worldContainer.object3D.translateZ(-1.5);
        worldContainer.object3D.translateY(-0.3); // чуть ниже уровня глаз

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
    if (worldContainer.getAttribute('visible') === 'true') activeModel = freeModel;
    else if (status.innerHTML.includes("модель 1")) activeModel = model1;

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

