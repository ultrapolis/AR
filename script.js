window.onload = () => {
    const btn = document.querySelector('#btn');
    const status = document.querySelector('#status');
    const sceneEl = document.querySelector('a-scene');
    const video = document.querySelector('#v');
    const worldContainer = document.querySelector('#world-container');
    const freeModel = document.querySelector('#free-model');
    const model1 = document.querySelector('#model-to-rotate');

    const playBtn = document.createElement('button');
    playBtn.innerHTML = "PAUSE";
    playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
    document.body.appendChild(playBtn);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-btn';
    closeBtn.innerHTML = '✕';
    document.body.appendChild(closeBtn);

    sceneEl.addEventListener('renderstart', () => {
        status.innerHTML = "Всё готово!";
        btn.style.display = 'block';
    });

    btn.addEventListener('click', () => {
        btn.style.display = 'none';
        status.innerHTML = "Инициализация...";
        // Важно для iOS: запускаем видео и сразу на паузу
        video.play().then(() => {
            video.pause();
            sceneEl.systems['mindar-image-system'].start();
        }).catch(() => {
            sceneEl.systems['mindar-image-system'].start();
        });
    });

    sceneEl.addEventListener("arReady", () => {
        status.innerHTML = "Наведите на маркер";
    });

    // ТАРГЕТ 0
    document.querySelector('#target0').addEventListener("targetFound", () => {
        video.play();
        status.innerHTML = "Смотрим видео...";
        playBtn.style.display = 'block';
    });
    document.querySelector('#target0').addEventListener("targetLost", () => {
        video.pause();
        playBtn.style.display = 'none';
    });

    // ТАРГЕТ 1
    document.querySelector('#target1').addEventListener("targetFound", () => {
        status.innerHTML = "Крутите модель 1!";
    });

    // ТАРГЕТ 2 (ФИКСАЦИЯ)
    document.querySelector('#target2').addEventListener("targetFound", () => {
        if (worldContainer.getAttribute('visible') === 'false') {
            status.innerHTML = "ОБЪЕКТ ЗАКРЕПЛЕН!";
            
            const cameraObj = document.querySelector('a-camera').object3D;
            const pos = new THREE.Vector3();
            cameraObj.getWorldPosition(pos);
            
            // Фиксируем в 2 метрах перед камерой
            worldContainer.setAttribute('position', {
                x: pos.x, 
                y: pos.y - 0.5, 
                z: pos.z - 2
            });
            
            worldContainer.setAttribute('visible', 'true');
            closeBtn.style.display = 'block';
        }
    });

    closeBtn.addEventListener('click', () => {
        worldContainer.setAttribute('visible', 'false');
        closeBtn.style.display = 'none';
        status.innerHTML = "Ищу маркер...";
    });

    playBtn.addEventListener('click', () => {
        if (video.paused) { video.play(); playBtn.innerHTML = "PAUSE"; }
        else { video.pause(); playBtn.innerHTML = "PLAY"; }
    });

    // ВРАЩЕНИЕ
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    window.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition.x = e.touches[0].clientX;
        previousMousePosition.y = e.touches[0].clientY;
    });

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

    window.addEventListener('touchend', () => { isDragging = false; });
};
