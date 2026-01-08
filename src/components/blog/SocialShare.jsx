import React from 'react';
import { Facebook, Linkedin, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SocialShare({ title, excerpt, url }) {
  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(excerpt || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: excerpt,
        url: url || window.location.href
      }).catch(() => {});
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold text-gray-600 ml-2">שתף:</span>
      
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-2 hover:bg-[#25D366] hover:text-white hover:border-[#25D366]">
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
      </a>

      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-2 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]">
          <Facebook className="w-4 h-4" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>
      </a>

      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-2 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]">
          <Linkedin className="w-4 h-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </Button>
      </a>

      {navigator.share && (
        <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">עוד...</span>
        </Button>
      )}
    </div>
  );
}