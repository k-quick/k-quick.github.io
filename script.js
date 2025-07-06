// --- DOM要素の取得 ---
const digitalDisplay = document.getElementById('digital-clock-display');
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');

const analogCanvas = document.getElementById('analog-clock-canvas');
const analogCtx = analogCanvas.getContext('2d');

const clockToggle = document.getElementById('clockToggle');

const pipButton = document.getElementById('pipButton');
const pipVideo = document.getElementById('pipVideo');
const pipCanvas = document.getElementById('pipCanvas');
const pipCtx = pipCanvas.getContext('2d');

// --- 状態管理 ---
let currentClockType = 'digital'; // 'digital' or 'analog'

// --- 時計描画のメイン関数 ---
function updateClock() {
    const now = new Date();
    if (currentClockType === 'digital') {
        updateDigitalClock(now);
    } else {
        drawAnalogClock(analogCtx, now, analogCanvas.width / 2);
    }
    drawPipCanvas(now);
}

// --- デジタル時計の更新 ---
function updateDigitalClock(now) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = days[now.getDay()];
    dateElement.textContent = `${year}年${month}月${day}日 (${dayOfWeek})`;
}

// --- アナログ時計の描画 ---
function drawAnalogClock(ctx, now, radius) {
    ctx.save();
    ctx.clearRect(0, 0, radius * 2, radius * 2);
    ctx.translate(radius, radius);
    
    // 円盤
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    
    // 針
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const hourAngle = (hour + minute / 60) * (2 * Math.PI / 12);
    drawHand(ctx, hourAngle, radius * 0.5, radius * 0.07, 'white');
    
    const minuteAngle = (minute + second / 60) * (2 * Math.PI / 60);
    drawHand(ctx, minuteAngle, radius * 0.75, radius * 0.05, 'white');

    const secondAngle = second * (2 * Math.PI / 60);
    drawHand(ctx, secondAngle, radius * 0.85, radius * 0.02, '#007bff');
    
    ctx.restore();
}

function drawHand(ctx, pos, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.rotate(-pos);
}

// --- PIP用キャンバスの描画 ---
function drawPipCanvas(now) {
    pipCanvas.width = 400;
    pipCanvas.height = 150;

    const gradient = pipCtx.createLinearGradient(0, 0, pipCanvas.width, pipCanvas.height);
    gradient.addColorStop(0, '#232526');
    gradient.addColorStop(1, '#414345');
    pipCtx.fillStyle = gradient;
    pipCtx.fillRect(0, 0, pipCanvas.width, pipCanvas.height);

    if (currentClockType === 'digital') {
        const timeText = now.toLocaleTimeString('ja-JP', { hour12: false });
        pipCtx.font = 'bold 3.5em "Segoe UI", sans-serif';
        pipCtx.fillStyle = 'white';
        pipCtx.textAlign = 'center';
        pipCtx.textBaseline = 'middle';
        pipCtx.fillText(timeText, pipCanvas.width / 2, pipCanvas.height / 2);
    } else {
        // PIPウィンドウ用にアナログ時計を縮小描画
        drawAnalogClock(pipCtx, now, pipCanvas.height / 2);
    }
}

// --- イベントリスナー ---
clockToggle.addEventListener('change', (event) => {
    if (event.target.checked) {
        currentClockType = 'analog';
        digitalDisplay.style.display = 'none';
        analogCanvas.style.display = 'block';
    } else {
        currentClockType = 'digital';
        digitalDisplay.style.display = 'block';
        analogCanvas.style.display = 'none';
    }
    updateClock(); // 切り替え時に即時更新
});

pipButton.addEventListener('click', async () => {
    if (!document.pictureInPictureEnabled) {
        alert('お使いのブラウザはPicture-in-Picture APIに対応していません。');
        return;
    }
    try {
        const stream = pipCanvas.captureStream();
        pipVideo.srcObject = stream;
        await pipVideo.play();
        await pipVideo.requestPictureInPicture();
    } catch (error) {
        console.error('PIPの開始に失敗しました:', error);
    }
});

// --- 初期化 ---
setInterval(updateClock, 1000);
updateClock();
