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
    status.innerHTML = "ГОТОВО! Наведите на страницу"; 
});

// 4. СТРАНИЦА 1: ВИДЕО
const t0 = document.querySelector('#target0');
t0.addEventListener("targetFound", () => {
    status.innerHTML = "Смотрим видео...";
    video.currentTime = 0; 
    video.play();
    playBtn.style.display = 'block'; 
});
t0.addEventListener("targetLost", () => { 
    video.pause(); 
    playBtn.style.display = 'none'; 
});

// 5. СТРАНИЦА 2: МОДЕЛЬ НА МАРКЕРЕ
const t1 = document.querySelector('#target1');
t1.addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});

// 6. СТРАНИЦА 3: СВОБОДНЫЙ ОБЪЕКТ (Тот самый рабочий кусок)
const t2 = document.querySelector('#target2');
t2.addEventListener("targetFound", () => {
    if (!freeModel.getAttribute('src')) {
        status.innerHTML = "Загрузка тяжелого объекта...";
        freeModel.setAttribute('src', './model2.glb'); 
        
        freeModel.addEventListener('model-loaded', () => {
            showWorldModel();
        }, { once: true });
    } else {
        showWorldModel();
    }
});

function showWorldModel() {
    status.innerHTML = "ЗАКРЕПЛЕНО! ТЕПЕРЬ МОЖНО УБРАТЬ КНИГУ";
    worldContainer.setAttribute('visible', 'true');
    
    // Перехватываем событие потери цели, чтобы насильно держать видимость
    const targetEntity = document.querySelector('#target2');
    targetEntity.addEventListener("targetLost", () => {
        if (closeBtn.style.display === 'block') {
            worldContainer.setAttribute('visible', 'true'); 
            status.innerHTML = "Маркер потерян, но объект остался!";
        }
    });

    closeBtn.style.display = 'block';
}

closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
    status.innerHTML = "Объект удален. Наведите на маркер снова.";
});

// 7. УПРАВЛЕНИЕ ВИДЕО
playBtn.addEventListener('click', () => {
    if (video.paused) { 
        video.play(); playBtn.innerHTML = "PAUSE"; 
    } else { 
        video.pause(); playBtn.innerHTML = "PLAY"; 
    }
});

// 8. ВРАЩЕНИЕ ПАЛЬЦЕМ
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
