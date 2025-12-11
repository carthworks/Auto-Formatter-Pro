# Auto Formatter Pro

**Version:** 1.0.0  
**Platform:** Chrome Extension (Manifest V3)

A fast, minimal, and professional Chrome extension that formats, validates, converts, and shares multiple text/code formats with advanced utility features.

## 🚀 Features

### Core Features
- ✨ **Multi-Format Auto-Detection** - Automatically detects JSON, XML, SQL, CSV, YAML, HTML, Markdown, JavaScript, and CSS
- 📚 **5-Level Memory Stack** - Navigate through your last 5 formatted outputs
- 🔍 **Error Detection & Fix Suggestions** - Intelligent error parsing with helpful suggestions
- 💾 **Export in 6+ Formats** - Download as .json, .xml, .sql, .csv, .md, or .txt
- 🔗 **Share Options** - Share via Slack, Gmail, or GitHub Gist
- 👁️ **Dual-View Mode** - Side-by-side comparison of raw and formatted code
- 🔄 **Format Conversion** - Convert between JSON, CSV, YAML, SQL, and more
- 🖱️ **Context Menu Integration** - Right-click to format selected text

### Additional Features
- 🌓 Light/Dark theme toggle
- ⚙️ Custom indentation (2 spaces, 4 spaces, or tabs)
- 🗜️ One-click minify for JSON, HTML, CSS, and JavaScript
- ⌨️ Keyboard shortcuts for quick actions
- 📱 Resizable panels for optimal viewing

## 📦 Installation

### From Source
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

### From Chrome Web Store
*(Coming soon)*

## 🎯 Usage

### Basic Formatting
1. Click the extension icon in your toolbar
2. Paste your code in the input panel
3. Click "Beautify" to format or "Minify" to compress
4. The formatted output appears in the right panel

### Context Menu
1. Select any text on a webpage
2. Right-click and choose "Format Selection with Auto Formatter Pro"
3. The extension popup opens with your text auto-formatted

### Keyboard Shortcuts
- `Ctrl+Enter` - Beautify current input
- `Ctrl+Shift+M` - Minify current input
- `Ctrl+Shift+C` - Copy formatted output

### Format Conversion
1. Enter your code in the input panel
2. Click the "Convert" dropdown
3. Select your desired conversion (e.g., JSON → CSV)
4. The converted output appears instantly

### Exporting
1. Format your code
2. Click the "Export" dropdown
3. Choose your desired file format
4. The file downloads automatically

### Sharing
- **Slack**: Opens Slack with content copied to clipboard
- **Gmail**: Opens Gmail with pre-filled email
- **GitHub Gist**: Creates a public Gist (requires GitHub token)

## ⚙️ Settings

Access settings by clicking the gear icon in the popup.

### Available Settings
- **Theme**: Light or Dark mode
- **Default Indentation**: 2 spaces, 4 spaces, or tabs
- **Default View Mode**: Dual or Single panel view
- **Context Menu**: Enable/disable right-click formatting
- **GitHub Token**: For creating GitHub Gists

### GitHub Token Setup
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the `gist` scope
4. Copy the token
5. Paste it in the extension settings

## 🛠️ Supported Formats

| Format | Detection | Beautify | Minify | Convert From | Convert To |
|--------|-----------|----------|--------|--------------|------------|
| JSON | ✅ | ✅ | ✅ | ✅ | ✅ |
| XML | ✅ | ✅ | ✅ | - | - |
| HTML | ✅ | ✅ | ✅ | - | - |
| SQL | ✅ | ✅ | - | - | ✅ |
| CSV | ✅ | - | - | ✅ | ✅ |
| YAML | ✅ | - | - | ✅ | ✅ |
| Markdown | ✅ | - | - | ✅ | - |
| JavaScript | ✅ | ✅ | ✅ | - | - |
| CSS | ✅ | ✅ | ✅ | - | - |

### Conversion Matrix
- JSON → CSV
- JSON → YAML
- JSON → SQL INSERT statements
- YAML → JSON
- CSV → JSON
- Markdown Table → JSON

## 📊 Performance

- ⚡ Formatting completes in <150ms for 300KB input
- 💾 Extension size: <3 MB
- 🔒 Fully offline - no backend required
- 🚀 Lightweight dependencies

## 🏗️ Architecture

```
Auto Formatter Pro/
├── manifest.json           # Extension manifest (MV3)
├── background/
│   └── service-worker.js  # Background service worker
├── popup/
│   ├── popup.html         # Main popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings logic
├── utils/
│   ├── format-detector.js # Format detection
│   ├── formatter.js       # Code formatting
│   ├── converter.js       # Format conversion
│   └── error-parser.js    # Error detection
└── assets/
    └── icon*.png          # Extension icons
```

## 🔐 Privacy

- **No Data Collection**: This extension does not collect any user data
- **Offline First**: All processing happens locally in your browser
- **No Analytics**: No tracking or analytics
- **Optional GitHub Integration**: GitHub token is stored locally and only used when you create Gists

## 🐛 Troubleshooting

### Extension not loading
- Ensure you're using Chrome version 88 or higher
- Check that all files are present in the extension directory
- Look for errors in `chrome://extensions/`

### Format not detected
- The extension uses pattern matching for detection
- For ambiguous formats, manually select the format type
- Ensure your code is valid

### GitHub Gist not working
- Verify your GitHub token has the `gist` scope
- Check that the token is correctly entered in settings
- Ensure you have an active internet connection

## 📝 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for developers who love clean code**
