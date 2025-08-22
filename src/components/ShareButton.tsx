import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  shareUrl: string;
}

export function ShareButton({ shareUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vote on this poll',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard();
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard();
    }
  };

  return (
    <button
      onClick={share}
      className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="Share poll"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-green-600 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}