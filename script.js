const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');
const model1 = document.querySelector('#model-to-rotate');
const worldContainer = document.querySelector('#world-container');
const freeModel = document.querySelector('#free-model');

// 1. Создание кнопок программно
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

const closeBtn = document.createElement('button');
closeBtn.id = 'close-btn';
closeBtn.innerHTML = '✕';
// Стили для кнопки-крестика уже в твоем CSS, просто убедимся, что она в body
document.body.appendChild(closeBtn);

// 2. Показ кнопки START после загрузки ресурсов
sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block';
});

// 3. Запуск AR по кнопке
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

// 5. СТРАНИЦА 2: МОДЕЛЬ НА МАРКЕРЕ (Вращающаяся)
const t1 = document.querySelector('#target1');
t1.addEventListener("targetFound", () => { 
    status.innerHTML = "Крутите модель 1!"; 
});

// 6. СТРАНИЦА 3: СВОБОДНЫЙ ОБЪЕКТ (Ленивая загрузка + Фиксация)
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
    const t2 = document.querySelector('#target2');
    
    // 1. Узнаем, где в пространстве сейчас находится маркер страницы
    const markerPos = new THREE.Vector3();
    const markerQuat = new THREE.Quaternion();
    const markerScale = new THREE.Vector3();
    
    t2.object3D.matrixWorld.decompose(markerPos, markerQuat, markerScale);

    // 2. Копируем эти координаты нашему контейнеру
    worldContainer.object3D.position.copy(markerPos);
    worldContainer.object3D.quaternion.copy(markerQuat);
    
    // 3. Показываем его
    worldContainer.setAttribute('visible', 'true');
    status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН НА СТРАНИЦЕ";
    closeBtn.style.display = 'block';

    // 4. Чтобы MindAR не смог его скрыть при потере маркера, 
    // МЫ ВЫНОСИМ ЕГО ИЗ ТАРГЕТА (если он вдруг был внутри)
    sceneEl.appendChild(worldContainer);
}

// Обработчик кнопки закрытия (крестика)
closeBtn.addEventListener('click', () => {
    worldContainer.setAttribute('visible', 'false');
    closeBtn.style.display = 'none';
    status.innerHTML = "Возврат к книге...";

    // ВКЛЮЧАЕМ камеру обратно
    const arVideo = document.querySelector('video');
    if (arVideo) {
        arVideo.style.opacity = "1";
    }
});

// 7. УПРАВЛЕНИЕ ВИДЕО КНОПКОЙ
playBtn.addEventListener('click', () => {
    if (video.paused) { 
        video.play(); playBtn.innerHTML = "PAUSE"; 
    } else { 
        video.pause(); playBtn.innerHTML = "PLAY"; 
    }
});

// 8. УНИВЕРСАЛЬНОЕ ВРАЩЕНИЕ ПАЛЬЦЕМ
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
    // Если на экране надпись про модель 1 — крутим её
    if (status.innerHTML.includes("модель 1")) activeModel = model1;
    // Если виден контейнер со свободной моделью — крутим её
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






