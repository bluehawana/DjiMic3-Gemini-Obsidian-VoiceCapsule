# Voice Capsule Dashboard

## Overview

The Voice Capsule Dashboard is your personal knowledge management system, inspired by NotebookLM and Obsidian, with Feynman-style learning integration.

## Features

### 🎯 Core Features

1. **Upload & Transcribe**
   - Drag & drop audio files (WAV, MP3, M4A, OGG)
   - Automatic transcription using Gemini API
   - Real-time processing status

2. **Smart Categorization**
   - 💼 Meeting - Business meetings and discussions
   - 💡 Brainstorm - Creative ideation sessions
   - 💬 Discussion - General conversations
   - 🤔 Mumbling - Random thoughts and ideas
   - 🧠 Self-Awareness - Personal reflections
   - 🚀 Product Ideas - Innovation and product concepts
   - 📚 Learning - Educational content (Feynman technique)

3. **Knowledge Dashboard**
   - Grid view for browsing notes
   - Mind map visualization (Feynman-style)
   - Full-text search across all notes
   - Category filtering
   - Statistics tracking

4. **Audio Playback**
   - Built-in audio player
   - Sync audio with transcription
   - Progress tracking

5. **Export & Backup**
   - Export to Markdown
   - Sync with Obsidian vault
   - Backup to Cloudflare R2
   - Import/Export JSON

### 🧠 Feynman Mind Map

The mind map view helps you visualize connections between your notes using the Feynman technique:

- **Central Node**: Your Voice Capsule knowledge base
- **Category Nodes**: Different types of content
- **Note Nodes**: Individual recordings and insights
- **Connections**: Visual links showing relationships

This helps you:
- Identify knowledge gaps
- See patterns in your thinking
- Build mental models
- Connect disparate ideas

## Setup

### 1. Basic Configuration

The dashboard is already integrated with your Voice Capsule installation. Access it at:

```
http://mic3.bluehawana.com/dashboard
```

### 2. Cloudflare R2 Storage (Optional)

For cloud backup and storage, configure R2:

1. **Create R2 Bucket**
   - Go to Cloudflare Dashboard → R2
   - Create bucket named `voice-capsule`
   - Note your Account ID

2. **Generate API Tokens**
   - Go to R2 → Manage R2 API Tokens
   - Create token with read/write permissions
   - Save Access Key ID and Secret Access Key

3. **Update .env**
   ```bash
   CF_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=voice-capsule
   ```

### 3. Obsidian Integration

To sync with your Obsidian vault:

1. Set `OBSIDIAN_VAULT_PATH` in `.env`
2. Notes will auto-sync to your vault
3. Use "Sync to Obsidian" button in dashboard

## Usage

### Upload New Recording

1. Click "➕ New Recording" button
2. Drag & drop audio file or click to browse
3. Click "Upload & Process"
4. Wait for transcription (progress shown)
5. Note appears in dashboard automatically

### Browse & Search

- **Search**: Type in search bar to find notes
- **Filter**: Click category to filter by type
- **View**: Switch between Grid and Mind Map views

### View Note Details

1. Click any note card
2. Read full transcription
3. Play audio (if available)
4. See metadata (date, word count, duration)

### Export & Backup

- **Download Note**: Click 💾 icon on note card
- **Export All**: Click "📤 Export" in header
- **Backup to R2**: Click "☁️ Backup to R2" in sidebar
- **Sync Obsidian**: Click "🔄 Sync to Obsidian"

## Architecture

```
Dashboard
├── Frontend (dashboard.html + dashboard.js)
│   ├── Grid View - Browse notes as cards
│   ├── Mind Map View - Feynman visualization
│   ├── Audio Player - Playback controls
│   └── Upload Modal - File upload interface
│
├── Backend (main.py)
│   ├── /api/notes - List all notes
│   ├── /api/notes/{id} - Get/Delete note
│   ├── /api/upload - Upload audio
│   ├── /api/backup/r2 - Backup to R2
│   └── /api/export/obsidian - Export to Obsidian
│
└── Storage (r2_storage.py)
    ├── R2 Integration - Cloud storage
    ├── Backup/Restore - Data management
    └── Audio Storage - Media files
```

## API Endpoints

### GET /dashboard
Serve dashboard interface

### GET /api/notes
List all notes
```json
[
  {
    "id": "uuid",
    "title": "Note Title",
    "category": "meeting",
    "content": "Transcription...",
    "date": "2026-03-06T10:00:00Z",
    "wordCount": 156,
    "duration": 1200,
    "audioUrl": "https://..."
  }
]
```

### GET /api/notes/{note_id}
Get specific note details

### DELETE /api/notes/{note_id}
Delete a note

### POST /api/backup/r2
Backup all notes to R2

### POST /api/import/r2
Import notes from R2

### POST /api/export/obsidian
Export notes to Obsidian format

## Feynman Technique Integration

The dashboard implements the Feynman learning technique:

1. **Record**: Explain concepts in your own words
2. **Transcribe**: AI converts speech to text
3. **Organize**: Auto-categorize by content type
4. **Visualize**: Mind map shows knowledge structure
5. **Review**: Identify gaps and connections
6. **Refine**: Re-record unclear concepts

This creates a feedback loop for deep learning and understanding.

## Cost Optimization

- **Gemini API**: Free tier (60 requests/min)
- **Cloudflare R2**: $0.015/GB storage, free egress
- **VPS Hosting**: Your existing server
- **Total**: ~$0-5/month vs $200+/year for alternatives

## Customization

### Add Custom Categories

Edit `dashboard.js`:
```javascript
const categories = {
  'my-category': '🎨',
  // Add more...
};
```

### Modify Mind Map Layout

Edit `renderMindMap()` function in `dashboard.js`:
```javascript
const radius = 200; // Distance from center
const angleStep = (2 * Math.PI) / categoryKeys.length;
```

### Change Color Scheme

Edit CSS variables in `dashboard.html`:
```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  /* Customize colors */
}
```

## Troubleshooting

### Dashboard not loading
- Check nginx configuration
- Verify static files are served
- Check browser console for errors

### Notes not appearing
- Verify API endpoint `/api/notes` returns data
- Check R2 credentials if using cloud storage
- Ensure database/storage is accessible

### Audio not playing
- Verify audio files are uploaded to R2
- Check CORS configuration
- Ensure audio URLs are accessible

### Mind map not rendering
- Check browser canvas support
- Verify notes have categories
- Check console for JavaScript errors

## Next Steps

1. **Deploy Dashboard**: Replace index.html with dashboard
2. **Configure R2**: Set up cloud storage
3. **Test Upload**: Try uploading a recording
4. **Explore Mind Map**: Visualize your knowledge
5. **Export Notes**: Backup to Obsidian/R2

## Support

For issues or questions:
- Check logs: `sudo journalctl -u voice-capsule -f`
- Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Test API: `curl http://localhost:8001/api/health`
