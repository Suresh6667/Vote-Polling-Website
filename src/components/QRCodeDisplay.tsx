  import React, { useState, useEffect } from 'react';
  import { Download, QrCode, ExternalLink } from 'lucide-react';

  interface QRCodeDisplayProps {
    pollId: string;
    className?: string;
  }

  export function QRCodeDisplay({ pollId, className = '' }: QRCodeDisplayProps) {
    const [qrCode, setQrCode] = useState<string>('');
    const [shareUrl, setShareUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchQRCode();
    }, [pollId]);

    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/polls/${pollId}/qr`);
        if (response.ok) {
          const data = await response.json();
          setQrCode(data.qrCode);
          setShareUrl(data.shareUrl);
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    const downloadQR = () => {
      if (!qrCode) return;

      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `poll-${pollId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (loading) {
      return (
        <div className={`bg-white rounded-xl shadow-lg p-6 text-center ${className}`}>
          <div className="animate-pulse">
            <div className="w-64 h-64 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      );
    }

    if (!qrCode) {
      return null;
    }

    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 text-center ${className}`}>
        <div className="mb-4">
          <QrCode className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Share with QR Code</h3>
          <p className="text-sm text-gray-600">Scan to access this poll on mobile</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
          <img
            src={qrCode}
            alt="QR Code"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">
            {shareUrl}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={downloadQR}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </a>
          </div>
        </div>
      </div>
    );
  }