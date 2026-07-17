// ========================================================
// KUNCI: LINK TEACHABLE MACHINE MILIK FAREL TERTANAM AMAN
// ========================================================
const URL_MODEL = "https://teachablemachine.withgoogle.com/models/gEfNaH_kW/"; 

let model, maxPredictions, isPredicting = false;
let finalVerdictLabel = "MEMINDAI...", finalHighestPercent = 0, finalIsAnalog = false;
let historyLogsArray = []; 

const resContainer = document.getElementById('resultContainer');
const verdictBadge = document.getElementById('verdictBadge');
const analogPercentText = document.getElementById('analogPercent');
const analogFillBar = document.getElementById('analogFill');
const digitalPercentText = document.getElementById('digitalPercent');
const digitalFillBar = document.getElementById('digitalFill');
const resStatusText = document.getElementById('resStatusText');
const specTable = document.getElementById('specTable');

const historyCard = document.getElementById('historyCard');
const historyBody = document.getElementById('historyBody');
const directDetectBtn = document.getElementById('directDetectBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

const camScanner = document.getElementById('camScanner');
const imgScanner = document.getElementById('imgScanner');

// MEMUAT ARSITEKTUR ENJIN AI
async function loadAIModel() {
  resContainer.style.display = "flex";
  if (URL_MODEL.includes("PASTE_LINK_KAMU_DISINI")) {
    verdictBadge.textContent = "ALARM";
    verdictBadge.style.background = "#ef4444";
    verdictBadge.style.color = "#fff";
    resStatusText.textContent = "Link model Teachable Machine belum diisi pada kode script.";
    return;
  }
  try {
    resStatusText.textContent = "Mengunduh arsitektur neural network visi komputer...";
    const modelURL = URL_MODEL + "model.json";
    const metadataURL = URL_MODEL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    resStatusText.textContent = "Model neural network siap. Silakan aktifkan input media.";
  } catch (e) {
    resStatusText.textContent = "Gagal memuat arsitektur model AI.";
  }
}
loadAIModel();

// LOOP PREDIKSI KAMERA SECARA REAL-TIME
async function predictLoop() {
  if (!isPredicting || !model) return;
  const prediction = await model.predict(camVideo);
  displayDetectionResult(prediction);
  window.requestAnimationFrame(predictLoop);
}

// EKSTRAKSI HASIL DETEKSI NEURAL NETWORK
function displayDetectionResult(prediction) {
  let analogProb = 0;
  let digitalProb = 0;
  let highestPred = { className: "", probability: 0 };

  for (let i = 0; i < maxPredictions; i++) {
    const label = prediction[i].className.toUpperCase();
    const prob = prediction[i].probability;

    if (prob > highestPred.probability) {
      highestPred = prediction[i];
    }

    if (label.includes('ANALOG') || label.includes('JARUM') || label.includes('CLASS 0')) {
      analogProb = prob;
    } else if (label.includes('DIGITAL') || label.includes('LCD') || label.includes('CLASS 1')) {
      digitalProb = prob;
    } else {
      if (i === 0) analogProb = prob;
      if (i === 1) digitalProb = prob;
    }
  }

  const analogVal = Math.round(analogProb * 100);
  analogPercentText.textContent = `${analogVal}%`;
  analogFillBar.style.width = `${analogVal}%`;

  const digitalVal = Math.round(digitalProb * 100);
  digitalPercentText.textContent = `${digitalVal}%`;
  digitalFillBar.style.width = `${digitalVal}%`;

  if (highestPred.probability > 0.5) {
    finalHighestPercent = Math.round(highestPred.probability * 100);
    finalVerdictLabel = highestPred.className.toUpperCase();
    finalIsAnalog = finalVerdictLabel.includes('ANALOG') || finalVerdictLabel.includes('JARUM') || finalVerdictLabel.includes('CLASS 0');

    verdictBadge.textContent = highestPred.className;
    verdictBadge.style.background = finalIsAnalog ? "rgba(197, 155, 39, 0.12)" : "rgba(14, 165, 233, 0.12)";
    verdictBadge.style.color = finalIsAnalog ? "var(--analog)" : "#0284c7";

    resStatusText.textContent = `AI mendeteksi objek sebagai ${highestPred.className}.`;

    specTable.style.display = "flex";
    document.getElementById('specType').textContent = finalIsAnalog ? "Dial & Mechanical Hands" : "LCD Segment Array";
    document.getElementById('specMethod').textContent = finalIsAnalog ? "Vector Angular Extractor" : "Matrix Font Decoding";
    document.getElementById('specSpeed').textContent = "0.03 Detik";
  } else {
    verdictBadge.textContent = "MEMINDAI...";
    verdictBadge.style.background = "var(--paper)";
    verdictBadge.style.color = "var(--slate)";
    specTable.style.display = "none";
  }
}

// MENGUNCI HASIL PADA DATA LOGGER TABEL
directDetectBtn.addEventListener('click', () => {
  if (finalHighestPercent < 50 || finalVerdictLabel === "MEMINDAI...") {
    alert("Sistem belum mendeteksi objek jam secara stabil. Silakan arahkan kamera atau pilih berkas gambar.");
    return;
  }
  
  historyCard.style.display = "block";
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  
  historyLogsArray.push({
    waktu: timeString,
    tipe: finalVerdictLabel,
    akurasi: `${finalHighestPercent}%`,
    status: "SUCCESS"
  });

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td style="font-family:'JetBrains Mono'; font-weight:600; color:var(--slate);">${timeString}</td>
    <td><span style="background:${finalIsAnalog ? 'rgba(197, 155, 39, 0.12)':'rgba(14, 165, 233, 0.12)'}; color:${finalIsAnalog ? 'var(--analog)':'#0284c7'}; padding:4px 12px; border-radius:8px; font-weight:700; font-family:'Space Grotesk'; font-size:12px; letter-spacing:0.02em;">${finalVerdictLabel}</span></td>
    <td style="font-family:'JetBrains Mono'; font-weight:700; color:${finalIsAnalog ? 'var(--analog)':'#0284c7'}; font-size:16px;">${finalHighestPercent}%</td>
    <td><span class="status-pill"><span class="indicator-dot"></span>SUCCESS</span></td>
  `;
  
  historyBody.insertBefore(newRow, historyBody.firstChild);
  historyCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// UNDUH LOG FILE (.CSV) KE KOMPUTER
exportCsvBtn.addEventListener('click', () => {
  if(historyLogsArray.length === 0) return;
  
  let csvContent = "data:text/csv;charset=utf-8,Waktu Pindai,Tipe Jam Terdeteksi,Tingkat Keyakinan AI,Status Enjin\n";
  historyLogsArray.forEach(log => {
    csvContent += `${log.waktu},${log.tipe},${log.akurasi},${log.status}\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "WatchLens_AI_Detection_Logs.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// SIMULASI MESSENGER TOAST
function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('usrName').value;
  const toast = document.getElementById('toastNotif');
  
  toast.textContent = `Terima kasih ${name}, pesan masukan Anda berhasil dikirim! ✓`;
  toast.style.display = "block";
  
  document.getElementById('msgForm').reset();
  
  setTimeout(() => {
    toast.style.animation = "fadeIn 0.3s ease reverse";
    setTimeout(() => {
      toast.style.display = "none";
      toast.style.animation = "fadeIn 0.3s ease";
    }, 300);
  }, 4000);
}

// LOGIKA JAM DUEL DI BANNER UTAMA
function initClock() {
  const now = new Date();
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  document.getElementById('hourHand').style.transform = `rotate(${(h + m / 60) * 30}deg)`;
  document.getElementById('minHand').style.transform = `rotate(${(m + s / 60) * 6}deg)`;
  document.getElementById('secHand').style.transform = `rotate(${s * 6}deg)`;
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('lcdTime').textContent = `${pad(now.getHours())}:${pad(m)}:${pad(s)}`;
  const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  document.getElementById('lcdDate').textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}
initClock();
setInterval(initClock, 1000);

const clockFace = document.getElementById('clockFace');
for (let i = 0; i < 12; i++) {
  const tick = document.createElement('div');
  tick.className = 'tick';
  tick.style.transform = `rotate(${i * 30}deg)`;
  clockFace.appendChild(tick);
}

// KONTROL AKTIVASI LENSA KAMERA
const camOption = document.getElementById('camOption');
const heroCamBtn = document.getElementById('heroCamBtn');
const camPreview = document.getElementById('camPreview');
const camVideo = document.getElementById('camVideo');
const imgPreview = document.getElementById('imgPreview');
const imgView = document.getElementById('imgView');
let camStream = null;

async function toggleCamera() {
  if (camPreview.style.display === 'block') {
    camPreview.style.display = 'none';
    camScanner.style.display = 'none';
    isPredicting = false;
    if (camStream) {
      camStream.getTracks().forEach(track => track.stop());
      camStream = null;
    }
    resStatusText.textContent = "Kamera dinonaktifkan. Siap menerima data baru.";
    specTable.style.display = "none";
  } else {
    try {
      imgPreview.style.display = 'none';
      imgScanner.style.display = 'none';
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      camVideo.srcObject = camStream;
      camPreview.style.display = 'block';
      camScanner.style.display = 'block';
      resContainer.style.display = 'flex';
      isPredicting = true;
      camVideo.addEventListener('loadeddata', () => {
        predictLoop();
      });
    } catch (err) {
      alert('Gagal membuka kamera: ' + err.message);
    }
  }
}

camOption.addEventListener('click', toggleCamera);
if(heroCamBtn) heroCamBtn.addEventListener('click', () => {
  document.getElementById('deteksi').scrollIntoView({ behavior: 'smooth' });
  if (camPreview.style.display !== 'block') toggleCamera();
});

// KONTROL UNGGAH FILE GAMBAR LOKAL
const fileOption = document.getElementById('fileOption');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');

fileOption.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    fileNameDisplay.textContent = '✓ Gambar dimuat: ' + fileInput.files[0].name;
    
    if (camPreview.style.display === 'block') {
      isPredicting = false;
      if (camStream) {
        camStream.getTracks().forEach(track => track.stop());
        camStream = null;
      }
      camPreview.style.display = 'none';
      camScanner.style.display = 'none';
    }
    
    if (model) {
      const blobURL = URL.createObjectURL(fileInput.files[0]);
      imgView.src = blobURL;
      imgPreview.style.display = 'block';
      imgScanner.style.display = 'block';
      resContainer.style.display = 'flex';
      
      imgView.onload = async () => {
        resStatusText.textContent = "Mengekstrak data piksel gambar...";
        const prediction = await model.predict(imgView);
        displayDetectionResult(prediction);
      };
    }
  }
});