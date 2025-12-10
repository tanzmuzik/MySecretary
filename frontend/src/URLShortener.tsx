import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import './URLShortener.css';

interface ShortenedData {
  originalUrl: string;
  shortenedUrl: string;
  code: string;
  qrCode: string;
}

function URLShortener() {
  const [inputUrl, setInputUrl] = useState('');
  const [shortenedData, setShortenedData] = useState<ShortenedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: inputUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await response.json();

      // Fetch QR code
      const qrResponse = await fetch(
        `http://localhost:3001/api/qrcode/${data.code}`
      );
      const qrData = await qrResponse.json();

      setShortenedData({
        originalUrl: data.originalUrl,
        shortenedUrl: data.shortenedUrl,
        code: data.code,
        qrCode: qrData.qrCode,
      });
      setInputUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortenedData) {
      navigator.clipboard.writeText(shortenedData.shortenedUrl);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="url-shortener">
      <h2>URLを短縮してQRコードを生成</h2>

      <form onSubmit={handleShorten} className="form">
        <div className="form-group">
          <label htmlFor="urlInput">URLを入力:</label>
          <input
            id="urlInput"
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '処理中...' : '短縮して生成'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {shortenedData && (
        <div className="results">
          <div className="result-section">
            <h3>元のURL</h3>
            <p className="url-display">{shortenedData.originalUrl}</p>
          </div>

          <div className="result-section">
            <h3>短縮URL</h3>
            <p className="shortened-url">{shortenedData.shortenedUrl}</p>
            <button onClick={copyToClipboard} className="copy-button">
              コピー
            </button>
          </div>

          <div className="result-section qr-section">
            <h3>QRコード</h3>
            <div className="qr-code-container">
              <img
                src={shortenedData.qrCode}
                alt="QRコード"
                className="qr-code-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default URLShortener;
