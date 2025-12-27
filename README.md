🔲 QR Code Pro - Enhanced QR Creator & Scanner
A modern, feature-rich Progressive Web App for creating and scanning QR codes with advanced features, beautiful UI/UX, and offline capability.

✨ Features
🎨 UI/UX Enhancements
Separate Pages: Dedicated Generator, Scanner, and History pages
Dark/Light Mode: Toggle between themes with persistent storage
Responsive Design: Works seamlessly on desktop, tablet, and mobile
Modern Animations: Smooth transitions and micro-interactions
Intuitive Navigation: Easy-to-use bottom navigation on mobile
📝 QR Code Generator
Multiple Presets:
📝 Text/URL
📶 WiFi (with SSID, password, and security type)
👤 vCard (contact information)
✉️ Email (with subject and body)
High Quality: Error correction level H for better scanning
Download & Share: Save QR codes or share directly from the app
📷 QR Code Scanner
Camera Scanning: Real-time QR code detection
Image Upload: Upload images from your device
Drag & Drop: Drag images directly into the scanner
Smart Results: Automatically detects URLs and makes them clickable
Copy & Open: Quick actions for scanned content
📜 History Management
Persistent Storage: All generated and scanned codes saved to localStorage
Separate Lists: View generated and scanned QR codes separately
Quick Actions:
Regenerate previous QR codes
Copy scanned content
Delete individual items
Clear all history
Timestamps: See when each QR code was created/scanned
Stores up to 50 items per category
📱 Progressive Web App (PWA)
Installable: Add to home screen on mobile/desktop
Offline Support: Works without internet connection
Fast Loading: Cached assets for instant loading
App Shortcuts: Quick access to Generator and Scanner
🚀 Getting Started
Installation
Download the files:
index.html
style.css
script.js
manifest.json
sw.js
Place all files in the same directory
Serve the files:
For local testing: Use a local server (e.g., python -m http.server)
For production: Upload to any web hosting service
Access the app:
Open index.html in your browser
Or visit your hosted URL
PWA Installation
Open the app in a modern browser
Look for the "Install" prompt in the address bar
Click "Install" to add it to your home screen/desktop
Launch the app like any native application
📋 Usage Guide
Creating QR Codes
Navigate to the Generator page
Select a preset type (Text, WiFi, vCard, or Email)
Fill in the required fields
Click Generate QR Code
Download or share your QR code
WiFi Example:

SSID: MyHomeNetwork
Password: SecurePass123
Security: WPA/WPA2
vCard Example:

Name: John Doe
Phone: +1234567890
Email: john@example.com
Organization: ACME Corp
Scanning QR Codes
Method 1 - Camera:

Click on Camera button
Allow camera permissions
Point camera at QR code
Result appears automatically
Method 2 - Upload:

Click on Upload button
Click or drag & drop an image
QR code is decoded instantly
Managing History
Navigate to the History page
Switch between Generated and Scanned tabs
Use action buttons:
🔄 Regenerate (for generated codes)
📋 Copy (for scanned codes)
🗑️ Delete individual items
Clear All button for bulk deletion
🛠️ Technical Details
Technologies Used
HTML5: Semantic markup
CSS3: Modern styling with CSS Variables for theming
Vanilla JavaScript: No framework dependencies
QRCode.js: QR code generation
jsQR: QR code scanning
Service Workers: Offline functionality
Web Manifest: PWA capabilities
Browser Compatibility
✅ Chrome/Edge (v90+)
✅ Firefox (v88+)
✅ Safari (v14+)
✅ Opera (v76+)
Camera Requirements
HTTPS connection (or localhost)
Camera permission granted
Modern browser with getUserMedia support
Storage
localStorage: History and theme preferences
Cache API: Offline asset storage
Maximum storage: ~50 items per history category
🎯 Future Enhancements (Optional)
Firebase Integration
To add cloud storage and authentication:

Create a Firebase project
Add Firebase SDK to index.html
Implement authentication:
javascript
// Sign in with Google
const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider);
Store history in Firestore:
javascript
// Save to cloud
db.collection('qr-history').add({
  userId: user.uid,
  type: 'generated',
  data: qrData,
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
});
React + Tailwind Conversion
To rebuild with modern frameworks:

Initialize React project: npx create-react-app qr-code-pro
Install dependencies: npm install qrcode.react jsqr tailwindcss
Convert to component-based architecture
Use Tailwind utility classes for styling
📄 File Structure
qr-code-pro/
├── index.html          # Main HTML file
├── style.css           # All styling (theme support)
├── script.js           # All functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md          # Documentation
🔒 Privacy & Security
✅ No server communication: All processing happens locally
✅ No data collection: No analytics or tracking
✅ Secure storage: Data stored only in browser's localStorage
✅ Camera privacy: Camera access only when explicitly granted
🐛 Troubleshooting
Camera not working?

Ensure HTTPS or localhost
Check browser permissions
Try a different browser
PWA not installing?

Ensure all files are served via HTTPS
Check manifest.json is accessible
Clear browser cache and try again
History not saving?

Check if localStorage is enabled
Ensure not in private/incognito mode
Check browser storage quota
📝 License
This project is open source and available for personal and commercial use.

🤝 Contributing
Contributions are welcome! Feel free to:

Report bugs
Suggest features
Submit pull requests
Improve documentation
💡 Tips
WiFi QR codes: Great for sharing guest network access
vCards: Perfect for business cards and networking
Email presets: Quick contact forms for events
History feature: Keep track of frequently used QR codes
Dark mode: Reduce eye strain during night usage
📞 Support
For issues or questions:

Check the troubleshooting section
Review browser console for errors
Ensure all files are properly loaded
Test on a different browser
Made with ❤️ for the QR code community

