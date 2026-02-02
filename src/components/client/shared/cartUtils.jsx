import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export const addToCart = async ({ type, data, price, title, description, preview_image }) => {
  try {
    const user = await base44.auth.me().catch(() => null);
    
    if (!user) {
        toast.error('יש להתחבר כדי להוסיף מוצרים לעגלה');
        setTimeout(() => {
            base44.auth.redirectToLogin(window.location.href);
        }, 1500);
        return false;
    }

    // Create entity record
    await base44.entities.CartItem.create({
      type,
      data,
      price: price || 99, // Default price if not specified
      status: 'active',
      title: title || getTypeTitle(type),
      description: description || getTypeDescription(type),
      preview_image: preview_image
    });

    // Dispatch event for UI update
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('open-cart')); // Open cart to show item
    
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