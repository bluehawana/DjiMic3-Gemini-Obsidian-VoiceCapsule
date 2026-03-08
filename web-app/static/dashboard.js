// Voice Capsule Dashboard JavaScript
let notes = [];
let currentCategory = 'all';
let currentView = 'grid';
let audioElement = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
    updateStats();
});

// Setup Event Listeners
function setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            filterNotes();
        });
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterNotes(e.target.value);
    });
    
    // Upload area
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            document.getElementById('uploadBtn').disabled = false;
        }
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files[0]) {
            fileInput.files = e.dataTransfer.files;
            document.getElementById('uploadBtn').disabled = false;
        }
    });
    
    // Upload button
    document.getElementById('uploadBtn').addEventListener('click', uploadFile);
}

// Load Notes from API
async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        if (response.ok) {
            notes = await response.json();
            renderNotes();
            updateStats();
            updateCategoryCounts();
        }
    } catch (error) {
        console.error('Failed to load notes:', error);
        // Load demo data for testing
        loadDemoData();
    }
}

// Load Demo Data
function loadDemoData() {
    notes = [
        {
            id: '1',
            title: 'Product Strategy Meeting',
            category: 'meeting',
            content: 'Discussed Q2 roadmap and feature priorities. Key decisions: Focus on mobile experience, implement AI suggestions, improve onboarding flow.',
            date: new Date().toISOString(),
            wordCount: 156,
            duration: 1200,
            audioUrl: null
        },
        {
            id: '2',
            title: 'Feynman Learning: Quantum Computing',
            category: 'learning',
            content: 'Explaining quantum computing in simple terms: Unlike classical bits (0 or 1), qubits can be both simultaneously (superposition). This allows quantum computers to process multiple possibilities at once.',
            date: new Date(Date.now() - 86400000).toISOString(),
            wordCount: 234,
            duration: 1800,
            audioUrl: null
        },
        {
            id: '3',
            title: 'App Idea: Voice Journal',
            category: 'product-ideas',
            content: 'Build a voice-first journaling app that uses AI to extract insights, mood patterns, and personal growth metrics. Could integrate with health apps.',
            date: new Date(Date.now() - 172800000).toISOString(),
            wordCount: 89,
            duration: 600,
            audioUrl: null
        }
    ];
    renderNotes();
    updateStats();
    updateCategoryCounts();
}

// Render Notes
function renderNotes() {
    const grid = document.getElementById('notesGrid');
    const filteredNotes = currentCategory === 'all' 
        ? notes 
        : notes.filter(n => n.category === currentCategory);
    
    if (filteredNotes.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">No notes found. Upload your first recording!</div>';
        return;
    }
    
    grid.innerHTML = filteredNotes.map(note => `
        <div class="note-card" onclick="openNote('${note.id}')">
            <div class="note-header">
                <span class="note-category">${getCategoryIcon(note.category)} ${formatCategory(note.category)}</span>
                <div class="note-actions">
                    <button class="note-action-btn" onclick="event.stopPropagation(); playAudio('${note.id}')">🔊</button>
                    <button class="note-action-btn" onclick="event.stopPropagation(); downloadNote('${note.id}')">💾</button>
                    <button class="note-action-btn" onclick="event.stopPropagation(); deleteNote('${note.id}')">🗑️</button>
                </div>
            </div>
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.content}</div>
            <div class="note-meta">
                <span>📅 ${formatDate(note.date)}</span>
                <span>📝 ${note.wordCount} words</span>
                <span>⏱️ ${formatDuration(note.duration)}</span>
            </div>
        </div>
    `).join('');
}

// Filter Notes
function filterNotes(searchTerm = '') {
    const grid = document.getElementById('notesGrid');
    let filtered = currentCategory === 'all' 
        ? notes 
        : notes.filter(n => n.category === currentCategory);
    
    if (searchTerm) {
        filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">No notes found</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(note => `
        <div class="note-card" onclick="openNote('${note.id}')">
            <div class="note-header">
                <span class="note-category">${getCategoryIcon(note.category)} ${formatCategory(note.category)}</span>
                <div class="note-actions">
                    <button class="note-action-btn" onclick="event.stopPropagation(); playAudio('${note.id}')">🔊</button>
                    <button class="note-action-btn" onclick="event.stopPropagation(); downloadNote('${note.id}')">💾</button>
                    <button class="note-action-btn" onclick="event.stopPropagation(); deleteNote('${note.id}')">🗑️</button>
                </div>
            </div>
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.content}</div>
            <div class="note-meta">
                <span>📅 ${formatDate(note.date)}</span>
                <span>📝 ${note.wordCount} words</span>
                <span>⏱️ ${formatDuration(note.duration)}</span>
            </div>
        </div>
    `).join('');
}

// Switch View
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    if (view === 'grid') {
        document.getElementById('notesGrid').style.display = 'grid';
        document.getElementById('mindmapContainer').style.display = 'none';
    } else {
        document.getElementById('notesGrid').style.display = 'none';
        document.getElementById('mindmapContainer').style.display = 'block';
        renderMindMap();
    }
}

// Render Feynman Mind Map
function renderMindMap() {
    const canvas = document.getElementById('mindmapCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Group notes by category
    const categories = {};
    notes.forEach(note => {
        if (!categories[note.category]) {
            categories[note.category] = [];
        }
        categories[note.category].push(note);
    });
    
    // Draw central node
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    drawNode(ctx, centerX, centerY, 'Voice Capsule', '#667eea', 20);
    
    // Draw category nodes in circle
    const categoryKeys = Object.keys(categories);
    const angleStep = (2 * Math.PI) / categoryKeys.length;
    const radius = 200;
    
    categoryKeys.forEach((category, index) => {
        const angle = index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Draw connection
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw category node
        drawNode(ctx, x, y, formatCategory(category), '#764ba2', 16);
        
        // Draw note nodes
        const noteAngleStep = (Math.PI / 3) / categories[category].length;
        categories[category].forEach((note, noteIndex) => {
            const noteAngle = angle + (noteIndex - categories[category].length / 2) * noteAngleStep;
            const noteX = x + 120 * Math.cos(noteAngle);
            const noteY = y + 120 * Math.sin(noteAngle);
            
            // Draw connection
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(noteX, noteY);
            ctx.strokeStyle = '#d1d5da';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw note node
            drawNode(ctx, noteX, noteY, note.title.substring(0, 20), '#e1e4e8', 12);
        });
    });
}

function drawNode(ctx, x, y, text, color, fontSize) {
    // Measure text
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`;
    const metrics = ctx.measureText(text);
    const padding = 12;
    const width = metrics.width + padding * 2;
    const height = fontSize + padding * 2;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, 8);
    ctx.fill();
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#24292e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

// Open Note Detail
function openNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    document.getElementById('noteModalTitle').textContent = note.title;
    document.getElementById('noteDetail').innerHTML = `
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border);">
            <span style="background: var(--hover); padding: 4px 12px; border-radius: 4px; font-size: 14px;">
                ${getCategoryIcon(note.category)} ${formatCategory(note.category)}
            </span>
            <span style="margin-left: 16px; color: var(--text-secondary); font-size: 14px;">
                📅 ${formatDate(note.date)}
            </span>
        </div>
        <div style="line-height: 1.8; white-space: pre-wrap;">${note.content}</div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 24px; font-size: 14px; color: var(--text-secondary);">
            <span>📝 ${note.wordCount} words</span>
            <span>⏱️ ${formatDuration(note.duration)}</span>
        </div>
    `;
    
    // Show audio player if available
    if (note.audioUrl) {
        document.getElementById('audioPlayer').style.display = 'block';
        setupAudioPlayer(note.audioUrl);
    } else {
        document.getElementById('audioPlayer').style.display = 'none';
    }
    
    document.getElementById('noteModal').classList.add('active');
}

// Setup Audio Player
function setupAudioPlayer(audioUrl) {
    if (audioElement) {
        audioElement.pause();
    }
    
    audioElement = new Audio(audioUrl);
    const playBtn = document.getElementById('playBtn');
    const progressFill = document.getElementById('audioProgressFill');
    const audioTime = document.getElementById('audioTime');
    
    playBtn.onclick = () => {
        if (audioElement.paused) {
            audioElement.play();
            playBtn.textContent = '⏸️';
        } else {
            audioElement.pause();
            playBtn.textContent = '▶️';
        }
    };
    
    audioElement.ontimeupdate = () => {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        progressFill.style.width = progress + '%';
        audioTime.textContent = `${formatTime(audioElement.currentTime)} / ${formatTime(audioElement.duration)}`;
    };
    
    document.getElementById('audioProgress').onclick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
    };
}

// Upload File
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const { job_id } = await response.json();
        closeModal('uploadModal');
        
        // Poll for completion
        pollJobStatus(job_id);
        
    } catch (error) {
        alert('Upload failed: ' + error.message);
    }
}

// Poll Job Status
async function pollJobStatus(jobId) {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`/api/status/${jobId}`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                clearInterval(interval);
                loadNotes();
                alert('✅ Transcription complete!');
            } else if (data.status === 'failed') {
                clearInterval(interval);
                alert('❌ Processing failed: ' + data.message);
            }
        } catch (error) {
            clearInterval(interval);
        }
    }, 2000);
}

// Update Statistics
function updateStats() {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('totalNotes').textContent = notes.length;
    document.getElementById('thisWeek').textContent = notes.filter(n => new Date(n.date) > weekAgo).length;
    document.getElementById('totalWords').textContent = notes.reduce((sum, n) => sum + n.wordCount, 0);
    
    const totalSeconds = notes.reduce((sum, n) => sum + n.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    document.getElementById('audioTime').textContent = hours + 'h';
}

// Update Category Counts
function updateCategoryCounts() {
    const counts = {};
    notes.forEach(note => {
        counts[note.category] = (counts[note.category] || 0) + 1;
    });
    
    document.querySelectorAll('.category-item').forEach(item => {
        const category = item.dataset.category;
        const countEl = item.querySelector('.category-count');
        if (category === 'all') {
            countEl.textContent = notes.length;
        } else {
            countEl.textContent = counts[category] || 0;
        }
    });
}

// Helper Functions
function getCategoryIcon(category) {
    const icons = {
        'meeting': '💼',
        'brainstorm': '💡',
        'discussion': '💬',
        'mumbling': '🤔',
        'self-awareness': '🧠',
        'product-ideas': '🚀',
        'learning': '📚'
    };
    return icons[category] || '📝';
}

function formatCategory(category) {
    return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    return date.toLocaleDateString();
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Modal Functions
function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function showImportModal() {
    alert('Import from Obsidian/R2 - Coming soon!');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (audioElement) {
        audioElement.pause();
    }
}

// Action Functions
function playAudio(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note && note.audioUrl) {
        openNote(noteId);
    } else {
        alert('Audio not available for this note');
    }
}

function downloadNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    a.click();
}

async function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;
    
    try {
        const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        if (response.ok) {
            notes = notes.filter(n => n.id !== noteId);
            renderNotes();
            updateStats();
            updateCategoryCounts();
        }
    } catch (error) {
        alert('Failed to delete note');
    }
}

function exportNotes() {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-capsule-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function syncToObsidian() {
    alert('Syncing to Obsidian vault...');
    // Implement Obsidian sync
}

function generateMindMap() {
    switchView('mindmap');
}

async function backupToR2() {
    alert('Backing up to Cloudflare R2...');
    // Implement R2 backup
}
