// Ждем полной загрузки страницы, чтобы Safari не выдал черный экран
window.onload = () => {
    const btn = document.querySelector('#btn');
    const status = document.querySelector('#status');
    const sceneEl = document.querySelector('a-scene');
    const video = document.querySelector('#v');
    const worldContainer = document.querySelector('#world-container');
    const freeModel = document.querySelector('#free-model');
    const model1 = document.querySelector('#model-to-rotate');

    // 1. Создание кнопок программно
    const playBtn = document.createElement('button');
    playBtn.innerHTML = "PAUSE";
    playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
    document.body.appendChild(playBtn);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-btn';
    closeBtn.innerHTML = '✕';
    // Стили для close-btn должны быть в твоем CSS
    document.body.appendChild(closeBtn);

    // 2. Показ кнопки START после загрузки ресурсов
    sceneEl.addEventListener('renderstart', () => {
        status.innerHTML = "Всё готово!";
        btn.style.display = 'block';
    });

    // 3. Запуск AR по кнопке
    btn.addEventListener('click', () => {
        btn.style.display = 'none';
        status.innerHTML = "Включаю камеру...";
        
        // Магия для Safari: сначала "пинаем" видео, чтобы разрешить автоплей
        video.play().then(() => {
            video.pause();
            sceneEl.systems['mindar-image-system'].start();
        }).catch(() => {
            // Если видео не пнулось, всё равно стартуем AR
            sceneEl.systems['mindar-image-system'].start();
        });
    });

    sceneEl.addEventListener("arReady", () => {
        status.innerHTML = "Наведите на маркер";
    });

    // 4. СТРАНИЦА 1: ВИДЕО
    const t0 = document.querySelector('#target0');
    t0.addEventListener("targetFound", () => {
        status.innerHTML = "Смотрим видео...";
        video.play();
        playBtn.style.display = 'block';
    });
    t0.addEventListener("targetLost", () => {
        video.pause();
        playBtn.style.display = 'none';
    });

    // 5. СТРАНИЦА 2: МОДЕЛЬ 1
    const t1 = document.querySelector('#target1');
    t1.addEventListener("targetFound", () => {
        status.innerHTML = "Крутите модель 1!";
    });

    // 6. СТРАНИЦА 3: ФИКСАЦИЯ ОБЪЕКТА В КОМНАТЕ
    const t2 = document.querySelector('#target2');
    t2.addEventListener("targetFound", () => {
        if (worldContainer.getAttribute('visible') === 'false') {
            status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН!";
            
            // Получаем позицию камеры
            const cameraObj = document.querySelector('a-camera').object3D;
            const pos = new THREE.Vector3();
            cameraObj.getWorldPosition(pos);
            
            // Ставим модель в 2 метрах перед телефоном (Z-2)
            worldContainer.setAttribute('position', {
                x: pos.x, 
                y: pos.y - 0.5, 
                z: pos.z - 2
            });
            
            worldContainer.setAttribute('visible', 'true');
            closeBtn.style.display = 'block';
        }
    });

    // Кнопка закрытия модели 3
    closeBtn.addEventListener('click', () => {
        worldContainer.setAttribute('visible', 'false');
        closeBtn.style.display = 'none';
        status.innerHTML = "Ищу маркер...";
    });

    // Кнопка Пауза/Плей для видео
    playBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = "PAUSE";
        } else {
            video.pause();
            playBtn.innerHTML = "PLAY";
        }
    });

    // 7. УНИВЕРСАЛЬНОЕ ВРАЩЕНИЕ ПАЛЬЦЕМ
    let isDragging = false;
    let previousMousePosition = { x: 0 };

    window.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition.x = e.touches[0].clientX;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;

        let activeModel = null;
        // Если видна 3-я модель — крутим её
        if (worldContainer.getAttribute('visible') === 'true') {
            activeModel = freeModel;
        } 
        // Иначе, если видим 2-й маркер — крутим первую модель
        else if (status.innerHTML.includes("модель 1")) {
            activeModel = model1;
        }

        if (activeModel) {
            let rot = activeModel.getAttribute('rotation');
            activeModel.setAttribute('rotation', {
                x: rot.x,
                y: rot.y + deltaX * 0.8, // Вращаем только влево-вправо для стабильности
                z: rot.z
            });
        }
        previousMousePosition.x = e.touches[0].clientX;
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });
};
