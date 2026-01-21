const fileInput = document.getElementById('fileInput');
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d');
const logPanel = document.getElementById('logPanel');
const loading = document.getElementById('loading');
const placeholder = document.getElementById('placeholder');
const magnifier = document.getElementById('magnifier');

const btnOriginal = document.getElementById('btnOriginal');
const btnELA = document.getElementById('btnELA');
const btnEdge = document.getElementById('btnEdge');
const btnMeta = document.getElementById('btnMeta');
const btnDownload = document.getElementById('btnDownload');
const elaControls = document.getElementById('elaControls');
const btnApplyELA = document.getElementById('btnApplyELA');

const rangeScale = document.getElementById('rangeScale');
const valScale = document.getElementById('valScale');
const rangeQuality = document.getElementById('rangeQuality');
const valQuality = document.getElementById('valQuality');

let originalImg = null; 
let currentMode = 'original'; 
let savedImageData = null; 

// 이미지 업로드
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        originalImg = new Image();
        originalImg.onload = () => {
            mainCanvas.width = originalImg.width;
            mainCanvas.height = originalImg.height;
            
            if(originalImg.width > 800) mainCanvas.style.width = '100%';
            else mainCanvas.style.width = 'auto';

            ctx.drawImage(originalImg, 0, 0);
            savedImageData = ctx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
            
            placeholder.style.display = 'none';
            magnifier.style.display = 'none';
            log(`[로드됨] ${file.name} (${originalImg.width}x${originalImg.height})`);
            
            setMode('original');
        };
        originalImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// 모드 전환
function setMode(mode) {
    if(!originalImg) return;
    currentMode = mode;
    
    [btnOriginal, btnELA, btnEdge].forEach(b => b.classList.remove('active'));
    
    elaControls.style.display = (mode === 'ela') ? 'block' : 'none';

    if (mode === 'original') {
        btnOriginal.classList.add('active');
        ctx.putImageData(savedImageData, 0, 0);
        log("[보기] 원본 소스");
    } else if (mode === 'ela') {
        btnELA.classList.add('active');
        runELA();
    } else if (mode === 'edge') {
        btnEdge.classList.add('active');
        runEdgeDetection();
    }
}

btnOriginal.onclick = () => setMode('original');
btnELA.onclick = () => setMode('ela');
btnEdge.onclick = () => setMode('edge');
btnApplyELA.onclick = () => runELA();

rangeScale.oninput = (e) => valScale.textContent = e.target.value;
rangeQuality.oninput = (e) => valQuality.textContent = e.target.value + "%";

// ELA 분석
function runELA() {
    if (!originalImg) return;
    loading.style.display = 'flex';
    
    setTimeout(() => {
        const w = mainCanvas.width;
        const h = mainCanvas.height;
        const quality = parseInt(rangeQuality.value) / 100;
        const scale = parseInt(rangeScale.value);

        const jpegDataUrl = mainCanvas.toDataURL('image/jpeg', quality);
        
        const compressedImg = new Image();
        compressedImg.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(compressedImg, 0, 0);

            const diffData = ctx.createImageData(w, h);
            const compData = tempCtx.getImageData(0, 0, w, h).data;
            const orgData = savedImageData.data;

            for (let i = 0; i < orgData.length; i += 4) {
                diffData.data[i] = Math.abs(orgData[i] - compData[i]) * scale;
                diffData.data[i+1] = Math.abs(orgData[i+1] - compData[i+1]) * scale;
                diffData.data[i+2] = Math.abs(orgData[i+2] - compData[i+2]) * scale;
                diffData.data[i+3] = 255;
            }
            ctx.putImageData(diffData, 0, 0);
            loading.style.display = 'none';
            log(`[ELA 완료] Q:${quality*100}%, S:${scale} \n밝게 표시되는 영역은 높은 에러율(조작 가능성)을 의미합니다.`);
        };
        compressedImg.src = jpegDataUrl;
    }, 50);
}

// 엣지 검출
function runEdgeDetection() {
    if (!originalImg) return;
    loading.style.display = 'flex';

    setTimeout(() => {
        const w = mainCanvas.width;
        const h = mainCanvas.height;
        const src = savedImageData.data;
        const output = ctx.createImageData(w, h);
        const dst = output.data;
        
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let r = 0, g = 0, b = 0;
                const idx = (y * w + x) * 4;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pIdx = ((y + ky) * w + (x + kx)) * 4;
                        const weight = (kx === 0 && ky === 0) ? 8 : -1;
                        
                        r += src[pIdx] * weight;
                        g += src[pIdx+1] * weight;
                        b += src[pIdx+2] * weight;
                    }
                }
                
                dst[idx] = Math.min(255, Math.max(0, r));
                dst[idx+1] = Math.min(255, Math.max(0, g));
                dst[idx+2] = Math.min(255, Math.max(0, b));
                dst[idx+3] = 255;
            }
        }
        ctx.putImageData(output, 0, 0);
        loading.style.display = 'none';
        log("[엣지 검출] 분석 완료. 불연속적인 부분을 확인하세요.");
    }, 50);
}

// 메타데이터
btnMeta.onclick = () => {
    if (!fileInput.files[0]) return;
    log("[정보] 메타데이터 읽는 중...");
    
    EXIF.getData(fileInput.files[0], function() {
        const tags = EXIF.getAllTags(this);
        let txt = "〓〓〓 EXIF 데이터 〓〓〓\n";
        
        if(Object.keys(tags).length === 0) {
            txt += "메타데이터를 찾을 수 없습니다.\n(SNS나 스크린샷에 의해 삭제되었을 수 있음)";
        } else {
            if(tags.Make) txt += `제조사: ${tags.Make}\n`;
            if(tags.Model) txt += `모델: ${tags.Model}\n`;
            if(tags.Software) txt += `소프트웨어: ${tags.Software}\n`;
            if(tags.DateTimeOriginal) txt += `촬영 시간: ${tags.DateTimeOriginal}\n`;

            if(tags.GPSLatitude && tags.GPSLongitude) {
                const lat = convertDMSToDD(tags.GPSLatitude, tags.GPSLatitudeRef);
                const lon = convertDMSToDD(tags.GPSLongitude, tags.GPSLongitudeRef);
                txt += `\n[위치 감지됨]\n위도: ${lat.toFixed(6)}, 경도: ${lon.toFixed(6)}\n`;
                
                logPanel.innerHTML += `<br><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">> 구글 지도에서 열기</a>`;
            }
        }
        log(txt);
    });
};

function convertDMSToDD(dms, ref) {
    let dd = dms[0] + dms[1]/60 + dms[2]/3600;
    if (ref === "S" || ref === "W") dd = dd * -1;
    return dd;
}

// 결과 저장
btnDownload.onclick = () => {
    if (!originalImg) return;
    const link = document.createElement('a');
    link.download = 'forensic_result.png';
    link.href = mainCanvas.toDataURL();
    link.click();
};

// 돋보기
const ZOOM_LEVEL = 2;
const wrapper = document.getElementById('canvasWrapper');

wrapper.addEventListener('mousemove', function(e) {
    if (!originalImg || placeholder.style.display !== 'none') return;
    
    magnifier.style.display = 'block';
    
    const rect = mainCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        magnifier.style.display = 'none';
        return;
    }

    magnifier.style.left = (e.clientX - rect.left - 75) + "px"; 
    magnifier.style.top = (e.clientY - rect.top - 75) + "px";  

    magnifier.style.backgroundImage = `url('${mainCanvas.toDataURL()}')`;
    magnifier.style.backgroundSize = `${rect.width * ZOOM_LEVEL}px ${rect.height * ZOOM_LEVEL}px`;
    
    magnifier.style.backgroundPosition = `-${x * ZOOM_LEVEL - 75}px -${y * ZOOM_LEVEL - 75}px`;
});

wrapper.addEventListener('mouseleave', function() {
    magnifier.style.display = 'none';
});

// 비교 기능
wrapper.addEventListener('mousedown', () => {
    if(!originalImg || currentMode === 'original') return;
    ctx.putImageData(savedImageData, 0, 0);
});
wrapper.addEventListener('mouseup', () => {
    if(!originalImg || currentMode === 'original') return;
    if(currentMode === 'ela') runELA();
    else if(currentMode === 'edge') ctx.putImageData(ctx.createImageData(mainCanvas.width, mainCanvas.height),0,0), runEdgeDetection(); 
});
wrapper.addEventListener('touchstart', (e) => { e.preventDefault(); if(originalImg && currentMode !== 'original') ctx.putImageData(savedImageData, 0, 0); });
wrapper.addEventListener('touchend', (e) => { e.preventDefault(); if(originalImg && currentMode === 'ela') runELA(); else if(currentMode === 'edge') runEdgeDetection(); });

function log(msg) {
    logPanel.textContent = msg;
}
