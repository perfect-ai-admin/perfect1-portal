import { toast } from 'sonner';
import { entities, auth, uploadFile } from '@/api/supabaseClient';

// Re-upload external image URLs to storage so they don't expire
const persistImage = async (imageUrl) => {
  if (!imageUrl || imageUrl.startsWith('data:')) return imageUrl;
  // Already on our storage - no need to re-upload
  if (imageUrl.includes('base44') || imageUrl.includes('supabase')) return imageUrl;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return imageUrl;
    const blob = await response.blob();
    const file = new File([blob], 'image.png', { type: blob.type || 'image/png' });
    const { file_url } = await uploadFile({ file });
    return file_url;
  } catch (err) {
    console.warn('Failed to persist image, using original URL:', err);
    return imageUrl;
  }
};

export const addToCart = async ({ type, data, price, title, description, preview_image, openCart = true }) => {
  try {
    const user = await auth.me().catch(() => null);
    
    if (!user) {
        toast.error('יש להתחבר כדי להוסיף מוצרים לעגלה');
        setTimeout(() => {
            auth.redirectToLogin(window.location.href);
        }, 1500);
        return false;
    }

    // For logos and stickers, persist the image to storage
    // so the URL doesn't expire (stockimg.ai URLs expire)
    let persistedPreview = preview_image;
    let persistedData = { ...data };
    if (type === 'logo' || type === 'sticker') {
      toast.info('שומר תמונה...', { duration: 2000 });
      persistedPreview = await persistImage(preview_image);
      if (persistedData.logoUrl) {
        persistedData.logoUrl = await persistImage(persistedData.logoUrl);
      }
      if (persistedData.stickerUrl) {
        persistedData.stickerUrl = await persistImage(persistedData.stickerUrl);
      }
    }

    // Create entity record
    await entities.CartItem.create({
      type,
      data: persistedData,
      price: price || 39,
      status: 'active',
      title: title || getTypeTitle(type),
      description: description || getTypeDescription(type),
      preview_image: persistedPreview
    });

    // Dispatch event for UI update
    window.dispatchEvent(new Event('cart-updated'));
    if (openCart) {
        window.dispatchEvent(new Event('open-cart')); // Open cart to show item
    }
    
    toast.success('המוצר נוסף לעגלה! 🛒');
    return true;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    toast.error('שגיאה בהוספה לסל. נסה שוב.');
    return false;
  }
};

const getTypeTitle = (type) => {
  switch(type) {
    case 'logo': return 'לוגו עסקי';
    case 'sticker': return 'סטיקר ממותג';
    case 'landing_page': return 'דף נחיתה';
    case 'presentation': return 'מצגת עסקית';
    default: return 'מוצר דיגיטלי';
  }
};

const getTypeDescription = (type) => {
  switch(type) {
    case 'logo': return 'עיצוב לוגו מקצועי';
    case 'sticker': return 'סטיקר לוואטסאפ';
    case 'landing_page': return 'דף נחיתה ממיר';
    case 'presentation': return 'מצגת עסקית להשקעה';
    default: return '';
  }
};