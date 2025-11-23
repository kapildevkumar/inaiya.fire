// auth.js
import { initializeApp } from 'firebase/app';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// --- 1. CRASH PREVENTION ---
if (!window.SITE_CONFIG || !window.SITE_CONFIG.firebaseConfig) {
    console.error("CRITICAL ERROR: SITE_CONFIG is missing or incomplete. Make sure config.js is loaded and contains firebaseConfig.");
    throw new Error("Firebase Configuration Missing");
}

// Initialize Firebase
const app = initializeApp(window.SITE_CONFIG.firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// State to prevent double-firing events
let isProcessingAuth = false;

/**
 * Initialize Auth Listener
 * @param {Function} onLogin - Callback when session is established
 * @param {Function} onLogout - Callback when session ends
 */
export function initAuth(onLogin, onLogout) {
    // Check if returning from Email Link
    const isReturningFromEmail = isSignInWithEmailLink(auth, window.location.href);
    
    if (isReturningFromEmail) {
        console.log("Auth: Email Link detected in URL.");
        
        // Get email from localStorage
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn');
                    console.log("Successfully signed in with email link");
                    // Clean URL
                    window.history.replaceState(null, null, window.location.pathname);
                })
                .catch((error) => {
                    console.error("Error signing in with email link:", error);
                });
        }
    }

    // --- 2. EVENT LISTENER (Robust) ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Auth Event: User signed in");
            if (!isProcessingAuth) {
                isProcessingAuth = true;
                onLogin({ user });
            }
        } else {
            console.log("Auth Event: User signed out");
            isProcessingAuth = false;
            onLogout();
        }
    });
}

/**
 * Get current session snapshot
 */
export async function getSession() {
    return { data: { session: auth.currentUser ? { user: auth.currentUser } : null } };
}

/**
 * Send Magic Link (Email Link Authentication)
 * @param {string} email 
 */
export async function sendMagicLink(email) {
    const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
    };
    
    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        return { error: null };
    } catch (error) {
        console.error("Error sending email link:", error);
        return { error };
    }
}

/**
 * Log Out (Cleanly)
 */
export async function logout() {
    try {
        await signOut(auth);
        sessionStorage.removeItem('isAppAuthenticated');
        window.location.reload();
    } catch (error) {
        console.error('Error logging out:', error);
    }
}