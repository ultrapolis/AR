const btn = document.querySelector('#btn');
const status = document.querySelector('#status');
const sceneEl = document.querySelector('a-scene');
const video = document.querySelector('#v');

// 1. Создаем кнопку PLAY/PAUSE для видео
const playBtn = document.createElement('button');
playBtn.innerHTML = "PAUSE";
playBtn.style.cssText = "position:fixed; bottom:50px; left:50%; transform:translateX(-50%); z-index:10001; padding:15px 30px; background:rgba(0,0,0,0.5); color:white; border:2px solid white; border-radius:30px; display:none; font-weight:bold;";
document.body.appendChild(playBtn);

// 2. Ждем полной загрузки всех ресурсов сцены
sceneEl.addEventListener('renderstart', () => {
    status.innerHTML = "Всё готово!";
    btn.style.display = 'block'; // Показываем кнопку START только теперь
});

// 3. Логика кнопки START
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

// 4. Когда AR система готова
sceneEl.addEventListener("arReady", () => {
    status.innerHTML = "ГОТОВО! Наведите на страницу";
});

// --- СТРАНИЦА 1 (ВИДЕО) ---
const t0 = document.querySelector('#target0');
t0.addEventListener("targetFound", () => {
    status.innerHTML = "Страница 1 оживает...";
    video.currentTime = 0; // Всегда сначала
    video.play();
    playBtn.style.display = 'block'; 
    playBtn.innerHTML = "PAUSE";
});

t0.addEventListener("targetLost", () => {
    status.innerHTML = "Ищу страницу...";
    video.pause();
    playBtn.style.display = 'none';
});

// --- СТРАНИЦА 2 (МОДЕЛЬ) ---
const t1 = document.querySelector('#target1');
t1.addEventListener("targetFound", () => {
    status.innerHTML = "Загружаю 3D объект...";
    playBtn.style.display = 'none';
});

t1.addEventListener("targetLost", () => {
    status.innerHTML = "Ищу страницу...";
});

// --- ЛОГИКА КНОПКИ ПАУЗЫ ---
playBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playBtn.innerHTML = "PAUSE";
    } else {
        video.pause();
        playBtn.innerHTML = "PLAY";
    }
});