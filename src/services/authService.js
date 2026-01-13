// Enhanced Authentication Service with Email/Password and Phone
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    signInAnonymously,
    signOut as firebaseSignOut,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { USER_ROLES } from '../utils/constants';

let recaptchaVerifier = null;

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, name, username) => {
    try {
        // Check if username is already taken
        const usernameExists = await checkUsernameExists(username);
        if (usernameExists) {
            throw new Error('Username already taken');
        }

        // Create user account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Update profile with display name
        await updateProfile(user, { displayName: name });

        // Send verification email
        await sendEmailVerification(user);

        // Create user document in Firestore
        await createOrUpdateUser(user.uid, {
            email,
            name,
            username,
            role: USER_ROLES.CITIZEN,
            emailVerified: false,
            createdAt: new Date()
        });

        return user;
    } catch (error) {
        console.error('Error signing up with email:', error);
        throw error;
    }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Error signing in with email:', error);
        throw error;
    }
};

/**
 * Sign in with username (converts to email first)
 */
export const signInWithUsername = async (username, password) => {
    try {
        // Find user by username
        const email = await getEmailByUsername(username);
        if (!email) {
            throw new Error('Username not found');
        }

        // Sign in with email
        return await signInWithEmail(email, password);
    } catch (error) {
        console.error('Error signing in with username:', error);
        throw error;
    }
};

/**
 * Initialize reCAPTCHA for phone auth
 */
export const initRecaptcha = (containerId = 'recaptcha-container') => {
    if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {
                console.log('reCAPTCHA solved');
            }
        });
    }
    return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phoneNumber) => {
    try {
        const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
        const appVerifier = initRecaptcha();
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        return confirmationResult;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP and sign in
 */
export const verifyOTP = async (confirmationResult, otp) => {
    try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;

        // Create or update user document
        await createOrUpdateUser(user.uid, {
            phone: user.phoneNumber,
            role: USER_ROLES.CITIZEN
        });

        return user;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Guest sign in
 */
export const signInAsGuest = async () => {
    try {
        const result = await signInAnonymously(auth);
        const user = result.user;

        await createOrUpdateUser(user.uid, {
            role: USER_ROLES.CITIZEN,
            isGuest: true
        });

        return user;
    } catch (error) {
        console.error('Error signing in as guest:', error);
        throw error;
    }
};

/**
 * Check if username exists
 */
const checkUsernameExists = async (username) => {
    try {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
};

/**
 * Get email by username
 */
const getEmailByUsername = async (username) => {
    try {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const userData = snapshot.docs[0].data();
        return userData.email;
    } catch (error) {
        console.error('Error getting email by username:', error);
        return null;
    }
};

/**
 * Create or update user document
 */
const createOrUpdateUser = async (userId, userData) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                ...userData,
                createdAt: new Date()
            });
        } else {
            await setDoc(userRef, {
                ...userSnap.data(),
                ...userData,
                updatedAt: new Date()
            }, { merge: true });
        }
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
};

/**
 * Officer/Admin login (email/password based)
 */
export const officerLogin = async (email, password, role) => {
    try {
        const result = await signInWithEmail(email, password);
        const user = result.user;

        // Verify role
        const userData = await getUserData(user.uid);
        if (userData && userData.role === role) {
            return user;
        }

        // Sign out if role doesn't match
        await firebaseSignOut(auth);
        throw new Error('Invalid credentials or role');
    } catch (error) {
        console.error('Error in officer login:', error);
        throw error;
    }
};

/**
 * Get user data
 */
export const getUserData = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
};

/**
 * Sign out
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

export default {
    signUpWithEmail,
    signInWithEmail,
    signInWithUsername,
    sendOTP,
    verifyOTP,
    signInAsGuest,
    officerLogin,
    getUserData,
    signOut,
    getCurrentUser
};
