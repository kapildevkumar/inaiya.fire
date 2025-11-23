// utils.js
import DOMPurify from 'dompurify';

// --- Deep Merge Utility ---
export function deepMerge(target, source) {
    if (!source) return target;
    const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item));

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return target;
}

// --- Security: Sanitizer (DOMPurify) ---
export function sanitize(str) {
    if (!str) return '';
    // Removed the "typeof check" because we now import it directly
    return DOMPurify.sanitize(str, { 
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span', 'u'],
        ALLOWED_ATTR: ['href', 'target', 'class', 'aria-label'] 
    });
}

// --- Input Validation ---
export function validateInput(value, type, label) {
    if (type === 'required' && (!value || value.trim() === '')) return `${label} is required.`;
    if (type === 'url' && value) {
        if (!value.match(/^(http|https):\/\/[^ "]+$/)) return `${label} must be a valid URL.`;
    }
    if (type === 'date' && value) {
        if (isNaN(new Date(value).getTime())) return `${label} is not a valid date.`;
    }
    return null;
}

// --- YouTube Helpers ---
export function getYouTubeId(input) {
    if (!input) return null;
    try {
        const url = new URL(input);
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
            if (url.searchParams.get('v')) return url.searchParams.get('v');
            if (url.pathname.slice(1)) return url.pathname.slice(1);
        }
    } catch (e) {
        if (input.length === 11) return input;
    }
    return null;
}

export function getYouTubeEmbedUrl(input) {
    const id = getYouTubeId(input);
    return id ? `https://www.youtube.com/embed/${id}` : input; 
}

// --- Password Hash Helper ---
export async function digestMessage(message) {
    if (!window.crypto || !window.crypto.subtle) {
        // Allow localhost for testing, but require HTTPS in production
        if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
             console.warn("Security Warning: This site should be run on HTTPS.");
        }
    }
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}