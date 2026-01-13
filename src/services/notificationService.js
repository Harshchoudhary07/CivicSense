// Notification Service - Real-time notifications for users
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    doc,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
    COMPLAINT_SUBMITTED: 'complaint_submitted',
    COMPLAINT_ASSIGNED: 'complaint_assigned',
    STATUS_UPDATE: 'status_update',
    COMPLAINT_RESOLVED: 'complaint_resolved',
    FEEDBACK_REQUEST: 'feedback_request',
    SYSTEM: 'system'
};

/**
 * Create a new notification
 */
export const createNotification = async (userId, type, message, data = {}) => {
    try {
        const notification = {
            userId,
            type,
            message,
            data,
            read: false,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'notifications'), notification);
        return { id: docRef.id, ...notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limitCount = 20) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
};

/**
 * Subscribe to real-time notifications
 */
export const subscribeToNotifications = (userId, callback) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(notifications);
        });
    } catch (error) {
        console.error('Error subscribing to notifications:', error);
        return () => { }; // Return empty unsubscribe function
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true,
            readAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        const updatePromises = snapshot.docs.map(doc =>
            updateDoc(doc.ref, { read: true, readAt: serverTimestamp() })
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking all as read:', error);
        throw error;
    }
};

/**
 * Helper: Notify user about complaint status change
 */
export const notifyComplaintStatusChange = async (userId, complaintId, oldStatus, newStatus) => {
    const statusMessages = {
        'pending': 'Your complaint is pending review',
        'assigned': 'Your complaint has been assigned to an officer',
        'in-progress': 'Work has started on your complaint',
        'resolved': '✅ Your complaint has been resolved!',
        'rejected': 'Your complaint has been reviewed'
    };

    const message = statusMessages[newStatus] || 'Your complaint status has been updated';

    return createNotification(userId, NOTIFICATION_TYPES.STATUS_UPDATE, message, {
        complaintId,
        oldStatus,
        newStatus,
        link: '/my-complaints'
    });
};

/**
 * Helper: Notify officer about new assignment
 */
export const notifyOfficerAssignment = async (officerId, complaintId, category) => {
    const message = `New ${category} complaint assigned to you`;

    return createNotification(officerId, NOTIFICATION_TYPES.COMPLAINT_ASSIGNED, message, {
        complaintId,
        category,
        link: '/officer/dashboard'
    });
};

export default {
    createNotification,
    getUserNotifications,
    subscribeToNotifications,
    markAsRead,
    markAllAsRead,
    notifyComplaintStatusChange,
    notifyOfficerAssignment,
    NOTIFICATION_TYPES
};
