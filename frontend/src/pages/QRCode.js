import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import '../styles/QRCode.css';

const QRCode = () => {
  const [localIP, setLocalIP] = useState('');
  const [frontendPort, setFrontendPort] = useState(3000);
  const [backendPort, setBackendPort] = useState(5000);

  useEffect(() => {
    // Try to detect local IP
    detectLocalIP();
  }, []);

  const detectLocalIP = async () => {
    try {
      // Try WebRTC to get local IP
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (match && !match[1].startsWith('127.') && !match[1].startsWith('169.')) {
            setLocalIP(match[1]);
            pc.close();
          }
        }
      };
    } catch (error) {
      console.error('Error detecting IP:', error);
      // Fallback to common local IPs
      setLocalIP('192.168.1.100');
    }
  };

  const generateQRCode = (url) => {
    // Using QR Server API for QR code generation
    const encodedURL = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedURL}`;
  };

  const frontendURL = localIP ? `http://${localIP}:${frontendPort}` : `http://localhost:${frontendPort}`;
  const backendURL = localIP ? `http://${localIP}:${backendPort}` : `http://localhost:${backendPort}`;

  return (
    <div className="qr-code-page">
      <div className="container">
        <div className="qr-header">
          <h2>📱 Mobile Access QR Codes</h2>
          <p>Scan these QR codes with your phone to access NexaNova on your mobile device</p>
        </div>

        <div className="qr-instructions">
          <div className="instruction-card">
            <h3>📋 Instructions</h3>
            <ol>
              <li>Make sure your phone is on the <strong>same Wi-Fi network</strong> as your computer</li>
              <li>Ensure the development server is running (<code>npm run dev</code>)</li>
              <li>Scan the QR code below with your phone's camera</li>
              <li>If the QR code doesn't work, manually enter the URL shown below</li>
            </ol>
          </div>
        </div>

        <div className="qr-config">
          <div className="config-card">
            <h3>⚙️ Configuration</h3>
            <div className="config-group">
              <label>
                Local IP Address:
                <input
                  type="text"
                  value={localIP}
                  onChange={(e) => setLocalIP(e.target.value)}
                  placeholder="192.168.1.100"
                  className="config-input"
                />
              </label>
              <small>Your computer's local IP address (found via ipconfig)</small>
            </div>
            <div className="config-row">
              <div className="config-group">
                <label>
                  Frontend Port:
                  <input
                    type="number"
                    value={frontendPort}
                    onChange={(e) => setFrontendPort(parseInt(e.target.value) || 3000)}
                    className="config-input"
                  />
                </label>
              </div>
              <div className="config-group">
                <label>
                  Backend Port:
                  <input
                    type="number"
                    value={backendPort}
                    onChange={(e) => setBackendPort(parseInt(e.target.value) || 5000)}
                    className="config-input"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="qr-codes-grid">
          <div className="qr-card">
            <h3>🌐 Frontend (React App)</h3>
            <div className="qr-code-container">
              <img
                src={generateQRCode(frontendURL)}
                alt="Frontend QR Code"
                className="qr-code-image"
              />
            </div>
            <div className="qr-url">
              <strong>URL:</strong>
              <code className="url-display">{frontendURL}</code>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(frontendURL);
                  alert('URL copied to clipboard!');
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="qr-card">
            <h3>🔧 Backend API</h3>
            <div className="qr-code-container">
              <img
                src={generateQRCode(backendURL)}
                alt="Backend QR Code"
                className="qr-code-image"
              />
            </div>
            <div className="qr-url">
              <strong>URL:</strong>
              <code className="url-display">{backendURL}</code>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(backendURL);
                  alert('URL copied to clipboard!');
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>

        <div className="troubleshooting">
          <div className="troubleshooting-card">
            <h3>🔧 Troubleshooting</h3>
            <div className="troubleshooting-list">
              <div className="trouble-item">
                <strong>Can't connect?</strong>
                <ul>
                  <li>Check that both devices are on the same Wi-Fi network</li>
                  <li>Verify the server is running: <code>npm run dev</code></li>
                  <li>Check Windows Firewall isn't blocking the ports</li>
                  <li>Try using your computer's IP address manually</li>
                </ul>
              </div>
              <div className="trouble-item">
                <strong>Find your IP address:</strong>
                <ul>
                  <li>Windows: Open Command Prompt and type <code>ipconfig</code></li>
                  <li>Look for "IPv4 Address" under your active network adapter</li>
                  <li>Use the IP that starts with 192.168.x.x or 172.x.x.x</li>
                </ul>
              </div>
              <div className="trouble-item">
                <strong>Firewall settings:</strong>
                <ul>
                  <li>Allow Node.js through Windows Firewall</li>
                  <li>Or temporarily disable firewall for testing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-links">
          <h3>🔗 Quick Links</h3>
          <div className="links-grid">
            <a href={frontendURL} target="_blank" rel="noopener noreferrer" className="link-card">
              <span className="link-icon">🌐</span>
              <span>Open Frontend</span>
            </a>
            <a href={`${backendURL}/api`} target="_blank" rel="noopener noreferrer" className="link-card">
              <span className="link-icon">🔧</span>
              <span>Test Backend</span>
            </a>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default QRCode;

