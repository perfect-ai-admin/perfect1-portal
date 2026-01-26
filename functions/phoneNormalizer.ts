/**
 * שירות נרמול טלפונים מרכזי
 * מבטיח פורמט E.164 עקבי בכל המערכת
 */

export function normalizePhoneNumber(phone) {
    if (!phone) return null;
    
    // הסר רווחים, מקפים, סוגריים, ופלוס
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    
    // אם מתחיל ב-0, החלף ב-972
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    
    // אם לא מתחיל ב-972, הוסף
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    
    return cleaned;
}

export function formatPhoneForDisplay(phoneNormalized) {
    if (!phoneNormalized) return '';
    
    // 972502277087 -> 050-227-7087
    const local = phoneNormalized.replace('972', '0');
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

export function generateIdempotencyKey(phone, content, timestamp) {
    const raw = `${normalizePhoneNumber(phone)}_${content}_${timestamp}`;
    return hashString(raw);
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}