// ==================== Global Variables ====================
let currentPreset = 'text';
let qrCodeInstance = null;
let stream = null;
let scanning = false;
let currentTheme = 'light';

// ==================== Theme Management ==================== //
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').querySelector('.theme-icon').textContent = 
        theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

document.getElementById('themeToggle').addEventListener('click', () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// ==================== Navigation ====================
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });
}

function showPage(pageName) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName + 'Page').classList.add('active');

    // Stop camera if leaving scanner
    if (pageName !== 'scanner') {
        stopCamera();
    }

    // Load history if on history page
    if (pageName === 'history') {
        loadHistory();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== Preset Management ====================
function initPresets() {
    document.querySelectorAll('.preset-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const preset = tab.dataset.preset;
            switchPreset(preset);
        });
    });
}

function switchPreset(preset) {
    currentPreset = preset;
    
    // Update tabs
    document.querySelectorAll('.preset-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.preset === preset);
    });

    // Update forms
    document.querySelectorAll('.preset-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(preset + 'Form').classList.add('active');
}

// ==================== QR Code Generation ====================
function generateQRData() {
    let data = '';

    switch(currentPreset) {
        case 'text':
            data = document.getElementById('textInput').value.trim();
            break;
        
        case 'wifi':
            const ssid = document.getElementById('wifiSSID').value.trim();
            const password = document.getElementById('wifiPassword').value.trim();
            const security = document.getElementById('wifiSecurity').value;
            if (ssid) {
                data = `WIFI:T:${security};S:${ssid};P:${password};;`;
            }
            break;
        
        case 'vcard':
            const name = document.getElementById('vcardName').value.trim();
            const phone = document.getElementById('vcardPhone').value.trim();
            const email = document.getElementById('vcardEmail').value.trim();
            const org = document.getElementById('vcardOrg').value.trim();
            if (name) {
                data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nEND:VCARD`;
            }
            break;
        
        case 'email':
            const to = document.getElementById('emailTo').value.trim();
            const subject = document.getElementById('emailSubject').value.trim();
            const body = document.getElementById('emailBody').value.trim();
            if (to) {
                data = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
            break;
    }

    return data;
}

document.getElementById('generateBtn').addEventListener('click', () => {
    const data = generateQRData();
    
    if (!data) {
        alert('⚠️ Please fill in required fields');
        return;
    }

    const preview = document.getElementById('qrPreview');
    preview.innerHTML = '';

    qrCodeInstance = new QRCode(preview, {
        text: data,
        width: 280,
        height: 280,
        colorDark: currentTheme === 'dark' ? '#ffffff' : '#000000',
        colorLight: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('qrActions').style.display = 'grid';

    // Save to history
    saveToHistory('generated', {
        type: currentPreset,
        data: data,
        timestamp: Date.now()
    });

    // Show success message
    showNotification('✅ QR Code generated successfully!');
});

// ==================== Download & Share ====================
document.getElementById('downloadBtn').addEventListener('click', () => {
    const canvas = document.querySelector('#qrPreview canvas');
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${currentPreset}-${Date.now()}.png`;
        link.click();
        showNotification('💾 QR Code downloaded!');
    }
});

document.getElementById('shareBtn').addEventListener('click', async () => {
    const canvas = document.querySelector('#qrPreview canvas');
    if (canvas) {
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'qrcode.png', { type: 'image/png' });
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'QR Code',
                        text: 'Check out this QR code!'
                    });
                    showNotification('🔗 Shared successfully!');
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.log('Share cancelled');
                    }
                }
            } else {
                alert('❌ Sharing is not supported on this browser');
            }
        });
    }
});

// ==================== Scanner ====================
function initScanner() {
    document.getElementById('cameraMethodBtn').addEventListener('click', () => {
        switchScannerMethod('camera');
    });

    document.getElementById('uploadMethodBtn').addEventListener('click', () => {
        switchScannerMethod('upload');
    });

    document.getElementById('startCameraBtn').addEventListener('click', startCamera);
    document.getElementById('stopCameraBtn').addEventListener('click', stopCamera);

    const uploadZone = document.getElementById('uploadZone');
    uploadZone.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', scanFromFile);

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--primary)';
        uploadZone.style.transform = 'scale(1.02)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'var(--border)';
        uploadZone.style.transform = 'scale(1)';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--border)';
        uploadZone.style.transform = 'scale(1)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const fileInput = document.getElementById('fileInput');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            scanFromFile({ target: fileInput });
        }
    });

    document.getElementById('copyResultBtn').addEventListener('click', copyResult);
    document.getElementById('openResultBtn').addEventListener('click', openResult);
}

function switchScannerMethod(method) {
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.scanner-view').forEach(view => {
        view.classList.remove('active');
    });

    if (method === 'camera') {
        document.getElementById('cameraMethodBtn').classList.add('active');
        document.getElementById('cameraScanner').classList.add('active');
    } else {
        document.getElementById('uploadMethodBtn').classList.add('active');
        document.getElementById('uploadScanner').classList.add('active');
        stopCamera();
    }
}

async function startCamera() {
    const video = document.getElementById('video');
    const scanStatus = document.getElementById('scanStatus');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');

    scanStatus.textContent = '🔄 Starting camera...';

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.srcObject = stream;
        video.style.display = 'block';
        startBtn.style.display = 'none';
        stopBtn.style.display = 'flex';
        scanStatus.textContent = '📷 Point camera at QR code';
        scanning = true;
        scanQRCode();
    } catch (err) {
        console.error('Camera error:', err);
        scanStatus.textContent = '❌ Camera access denied';
        alert('⚠️ Unable to access camera. Please check permissions.');
    }
}

function stopCamera() {
    scanning = false;
    const video = document.getElementById('video');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.style.display = 'none';
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    document.getElementById('scanStatus').textContent = '';
}

function scanQRCode() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!scanning) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            displayScanResult(code.data);
            stopCamera();
            return;
        }
    }

    requestAnimationFrame(scanQRCode);
}

function scanFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                displayScanResult(code.data);
                showNotification('✅ QR Code scanned successfully!');
            } else {
                alert('❌ No QR code found in image');
            }
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function displayScanResult(data) {
    const result = document.getElementById('scanResult');
    const resultText = document.getElementById('resultText');
    const openBtn = document.getElementById('openResultBtn');

    resultText.textContent = data;
    result.style.display = 'block';

    // Show open button for URLs
    if (data.startsWith('http://') || data.startsWith('https://')) {
        openBtn.style.display = 'flex';
        resultText.innerHTML = `<a href="${data}" target="_blank" rel="noopener noreferrer">${data}</a>`;
    } else {
        openBtn.style.display = 'none';
    }

    // Save to history
    saveToHistory('scanned', {
        data: data,
        timestamp: Date.now()
    });

    // Scroll to result
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyResult() {
    const resultText = document.getElementById('resultText').textContent;
    navigator.clipboard.writeText(resultText).then(() => {
        const btn = document.getElementById('copyResultBtn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
        showNotification('📋 Copied to clipboard!');
    });
}

function openResult() {
    const resultText = document.getElementById('resultText').textContent;
    window.open(resultText, '_blank', 'noopener,noreferrer');
}

// ==================== History Management ====================
function saveToHistory(type, data) {
    const historyKey = `qr-history-${type}`;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    history.unshift(data);
    
    // Keep only last 50 items
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

function loadHistory() {
    loadGeneratedHistory();
    loadScannedHistory();
}

function loadGeneratedHistory() {
    const history = JSON.parse(localStorage.getItem('qr-history-generated') || '[]');
    const container = document.getElementById('generatedHistory');

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No generated QR codes yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-item-content">
                <div class="history-item-type">${item.type.toUpperCase()}</div>
                <div class="history-item-text">${item.data.substring(0, 100)}${item.data.length > 100 ? '...' : ''}</div>
                <div class="history-item-date">📅 ${new Date(item.timestamp).toLocaleString()}</div>
            </div>
            <div class="history-item-actions">
                <button class="history-item-btn" onclick="regenerateQR(${index})">🔄 Regenerate</button>
                <button class="history-item-btn" onclick="deleteHistoryItem('generated', ${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function loadScannedHistory() {
    const history = JSON.parse(localStorage.getItem('qr-history-scanned') || '[]');
    const container = document.getElementById('scannedHistory');

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No scanned QR codes yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-item-content">
                <div class="history-item-text">${item.data.substring(0, 100)}${item.data.length > 100 ? '...' : ''}</div>
                <div class="history-item-date">📅 ${new Date(item.timestamp).toLocaleString()}</div>
            </div>
            <div class="history-item-actions">
                <button class="history-item-btn" onclick="copyHistoryItem('${item.data.replace(/'/g, "\\'")}')">📋 Copy</button>
                <button class="history-item-btn" onclick="deleteHistoryItem('scanned', ${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function regenerateQR(index) {
    const history = JSON.parse(localStorage.getItem('qr-history-generated') || '[]');
    const item = history[index];
    
    showPage('generator');
    
    // Set the preset and data
    switchPreset(item.type);
    
    setTimeout(() => {
        if (item.type === 'text') {
            document.getElementById('textInput').value = item.data;
        }
        document.getElementById('generateBtn').click();
    }, 100);
}

function copyHistoryItem(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Copied to clipboard!');
    });
}

function deleteHistoryItem(type, index) {
    if (confirm('🗑️ Delete this item from history?')) {
        const historyKey = `qr-history-${type}`;
        let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history.splice(index, 1);
        localStorage.setItem(historyKey, JSON.stringify(history));
        loadHistory();
        showNotification('✅ Item deleted');
    }
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('⚠️ Clear all history? This cannot be undone.')) {
        const activeTab = document.querySelector('.history-tab.active');
        const type = activeTab.dataset.history;
        localStorage.setItem(`qr-history-${type}`, '[]');
        loadHistory();
        showNotification('✅ History cleared');
    }
});

// History tabs
document.querySelectorAll('.history-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.history-list').forEach(l => l.classList.remove('active'));
        
        tab.classList.add('active');
        const type = tab.dataset.history;
        document.getElementById(type + 'History').classList.add('active');
    });
});

// ==================== Notifications ====================
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--gradient);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = 'slideIn 0.3s ease';
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== PWA Registration ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(() => {
            console.log('✅ Service Worker registered');
        }).catch(() => {
            console.log('❌ Service Worker registration failed');
        });
    });
}

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initPresets();
    initScanner();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('👋 Welcome to QR Code Pro!');
    }, 500);
});

// ==================== Console Message ====================
console.log('%c🔲 QR Code Pro', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cDeveloped by Harsh Jethwa', 'font-size: 14px; color: #667eea; font-weight: bold;');
console.log('%cMaking QR codes simple and beautiful ✨', 'font-size: 12px; color: #64748b;');