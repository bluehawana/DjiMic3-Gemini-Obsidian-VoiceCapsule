# 🎙️ Personal Voice Capsule

> Transform your voice into organized knowledge with DJI Mic 3, Gemini ASR, and Obsidian integration

A complete voice-to-knowledge automation system that captures your thoughts, transcribes them with AI, and organizes them into your personal knowledge base. Perfect for implementing the Feynman Technique and building your "Second Brain."

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [✨ Features](#-features) • [🤝 Contributing](#-contributing)

---

## 🌟 What is Personal Voice Capsule?

Personal Voice Capsule is an open-source automation system that bridges the gap between your spoken thoughts and written knowledge. It combines:

- 🎙️ **DJI Mic 3**: Professional wireless microphone for high-quality voice recording
- 🤖 **Google Gemini**: State-of-the-art AI for accurate speech-to-text transcription
- 📝 **Obsidian**: Powerful knowledge management system for organizing your notes
- ⚡ **Automation**: Seamless workflow that requires zero manual intervention

### 💰 Why Build Your Own Solution?

Market solutions are expensive and limiting:
- 💸 **Otter.ai**: $16.99/month ($204/year) - vendor lock-in, limited exports
- 💸 **Notion AI**: $10/month ($120/year) - closed ecosystem
- 💸 **Mem.ai**: $14.99/month ($180/year) - proprietary format
- 💸 **Reflect**: $10/month ($120/year) - limited integrations

**Your Voice Capsule costs: ~$0-5/month**
- ✅ Gemini API: Free tier (60 requests/min) or $0.35/1M tokens
- ✅ Your data, your control, your format
- ✅ No vendor lock-in, no subscription fatigue
- ✅ Complete privacy - process locally or use your own API keys

### 🎯 The Voice Capsule Philosophy

Every minute, ideas flow through your mind. Most are lost forever. Voice Capsule preserves them:

- 💡 **Capture instantly** - Speak your thoughts, don't lose them typing
- 🧠 **Feynman Technique** - Explain concepts verbally to solidify understanding
- ⚡ **10x faster** - Speaking is 3-4x faster than typing
- 🎯 **Focus on thinking** - Let AI handle transcription and formatting
- 📦 **Capsulize knowledge** - Every recording becomes a searchable, linkable note
- 🔄 **Build your second brain** - Continuous learning, zero friction

---

## ✨ Features

### Core Features

- ✅ **Automatic Audio Detection** - Detects when DJI Mic 3 is connected to your Mac
- ✅ **AI Transcription** - Uses Google Gemini 1.5 Flash/Pro for accurate speech-to-text
- ✅ **Multi-Language Support** - Auto-detects or specify: English, Chinese, Swedish, Spanish, French, German, Japanese, Korean
- ✅ **Obsidian Integration** - Automatically saves transcriptions as formatted markdown notes
- ✅ **Template System** - Customizable note templates for different use cases
- ✅ **Background Processing** - Runs silently in the background, no manual intervention needed
- ✅ **Error Recovery** - Automatic retry and fallback mechanisms
- ✅ **Privacy-Focused** - Your data stays in your control

### Advanced Features (Coming Soon)

- 🔄 **AI Enhancement** - Auto-categorize, tag, and link notes using LLMs
- 🔄 **NotebookLM Integration** - Sync with Google NotebookLM for AI-powered insights
- 🔄 **Windows Support** - Cross-platform automation scripts
- 🔄 **Local Whisper** - Offline transcription option for complete privacy

---

## 🚀 Quick Start

### Prerequisites

- macOS 12.0+ (Monterey or later)
- Python 3.8 or higher
- DJI Mic 3 wireless microphone
- Obsidian installed ([Download](https://obsidian.md))
- Gemini API Key ([Get free key](https://aistudio.google.com/app/apikey))

### One-Command Installation

```bash
# Clone the repository
git clone https://github.com/bluehawana/DjiMic3-Gemini-Obsidian-VoiceCapsule.git
cd DjiMic3-Gemini-Obsidian-VoiceCapsule

# Run the installer
./scripts/mac/install.sh
```

The installer will:
1. ✅ Check system requirements
2. ✅ Install Python dependencies
3. ✅ Set up configuration files
4. ✅ Configure Obsidian integration
5. ✅ Test your setup

---

## 🔄 How It Works

```
┌─────────────────┐
│  DJI Mic 3      │  1. Record your voice
│  (Recording)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Mac USB        │  2. Connect to Mac
│  (Auto-detect)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini AI      │  3. Transcribe to text
│  (ASR)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Obsidian       │  4. Save as markdown note
│  (Knowledge)    │
└─────────────────┘
```

---

## 📁 Project Structure

```
DjiMic3-Gemini-Obsidian-VoiceCapsule/
├── scripts/
│   ├── mac/
│   │   ├── install.sh              # One-click installation
│   │   ├── auto-detect.sh          # USB device detection
│   │   └── watch-and-process.sh    # Main automation loop
│   └── python/
│       ├── transcribe.py           # Gemini ASR transcription
│       ├── obsidian_sync.py        # Obsidian integration
│       └── requirements.txt        # Python dependencies
├── configs/
│   └── .env.template               # Configuration template
├── templates/
│   └── voice-note-template.md     # Obsidian note template
├── docs/
│   ├── getting-started.md          # Detailed setup guide
│   ├── troubleshooting.md          # Common issues & solutions
│   └── api-reference.md            # API documentation
├── examples/
│   └── sample-recording.wav        # Test audio file
└── README.md                       # You are here
```

---

## ⚙️ Configuration

Edit `configs/.env` with your settings:

```bash
# Required: Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Required: Obsidian Vault Path
OBSIDIAN_VAULT_PATH=/Users/yourusername/Documents/Obsidian/YourVault

# Optional: Customize settings
GEMINI_MODEL=gemini-1.5-flash        # or gemini-1.5-pro
TRANSCRIPTION_LANGUAGE=auto          # or en, zh, sv, etc.
AUTO_PROCESS_ON_CONNECT=true
DELETE_AFTER_PROCESSING=false
```

---

## 📖 Documentation

- [Getting Started Guide](docs/getting-started.md) - Detailed setup instructions
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
- [API Reference](docs/api-reference.md) - Technical documentation

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- DJI for the amazing Mic 3 hardware
- Google for Gemini AI
- Obsidian team for the knowledge management platform

---

**Made with ❤️ by the community**
