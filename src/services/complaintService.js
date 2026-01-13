// Complaint Service
import { db, storage } from '../config/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateComplaintId } from '../utils/helpers';
import { STATUSES, PRIORITIES } from '../utils/constants';
import { calculatePriority } from './priorityEngine';

/**
 * Create a new complaint
 */
export const createComplaint = async (complaintData, photoFile) => {
    try {
        const complaintId = generateComplaintId();
        let photoURL = null;

        // Upload photo if provided
        if (photoFile) {
            const storageRef = ref(storage, `complaints/${complaintId}/${photoFile.name}`);
            await uploadBytes(storageRef, photoFile);
            photoURL = await getDownloadURL(storageRef);
        }

        // Calculate initial priority
        const { priority, reasons } = await calculatePriority(complaintData);

        // Create complaint document
        const complaint = {
            complaintId,
            ...complaintData,
            photoURL,
            status: STATUSES.SUBMITTED,
            priority,
            priorityReasons: reasons,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            timeline: [
                {
                    status: STATUSES.SUBMITTED,
                    timestamp: Timestamp.now(),
                    note: 'Complaint submitted'
                }
            ]
        };

        const docRef = await addDoc(collection(db, 'complaints'), complaint);

        return { id: docRef.id, ...complaint };
    } catch (error) {
        console.error('Error creating complaint:', error);
        throw error;
    }
};

/**
 * Get complaint by ID
 */
export const getComplaint = async (id) => {
    try {
        const docRef = doc(db, 'complaints', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting complaint:', error);
        throw error;
    }
};

/**
 * Get complaints by user ID
 */
export const getUserComplaints = async (userId) => {
    try {
        const q = query(
            collection(db, 'complaints'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const complaints = [];

        snapshot.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });

        return complaints;
    } catch (error) {
        console.error('Error getting user complaints:', error);
        throw error;
    }
};

/**
 * Get nearby complaints
 */
export const getNearbyComplaints = async (location, radiusKm = 5) => {
    try {
        // Note: For production, use geohashing or GeoFirestore for efficient geo queries
        const snapshot = await getDocs(collection(db, 'complaints'));
        const nearby = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.location) {
                // Simple distance check (replace with proper geo query in production)
                const latDiff = Math.abs(data.location.lat - location.lat);
                const lngDiff = Math.abs(data.location.lng - location.lng);

                if (latDiff < radiusKm / 111 && lngDiff < radiusKm / 111) {
                    nearby.push({ id: doc.id, ...data });
                }
            }
        });

        return nearby;
    } catch (error) {
        console.error('Error getting nearby complaints:', error);
        // Return empty array instead of throwing to prevent page crashes
        return [];
    }
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (id, status, note, resolutionPhoto = null) => {
    try {
        const docRef = doc(db, 'complaints', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Complaint not found');
        }

        const currentData = docSnap.data();
        let resolutionPhotoURL = currentData.resolutionPhotoURL;

        // Upload resolution photo if provided
        if (resolutionPhoto) {
            const storageRef = ref(storage, `resolutions/${id}/${resolutionPhoto.name}`);
            await uploadBytes(storageRef, resolutionPhoto);
            resolutionPhotoURL = await getDownloadURL(storageRef);
        }

        // Add to timeline
        const newTimelineEntry = {
            status,
            timestamp: Timestamp.now(),
            note
        };

        const updates = {
            status,
            updatedAt: Timestamp.now(),
            timeline: [...currentData.timeline, newTimelineEntry]
        };

        if (resolutionPhotoURL) {
            updates.resolutionPhotoURL = resolutionPhotoURL;
        }

        if (status === STATUSES.RESOLVED) {
            updates.resolvedAt = Timestamp.now();
        }

        await updateDoc(docRef, updates);

        return { id, ...currentData, ...updates };
    } catch (error) {
        console.error('Error updating complaint status:', error);
        throw error;
    }
};

/**
 * Get complaints by officer
 */
export const getOfficerComplaints = async (officerId) => {
    try {
        const q = query(
            collection(db, 'complaints'),
            where('assignedTo', '==', officerId),
            orderBy('priority', 'desc'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const complaints = [];

        snapshot.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });

        return complaints;
    } catch (error) {
        console.error('Error getting officer complaints:', error);
        throw error;
    }
};

/**
 * Get all complaints (admin)
 */
export const getAllComplaints = async (filters = {}) => {
    try {
        let q = collection(db, 'complaints');

        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }

        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }

        if (filters.priority) {
            q = query(q, where('priority', '==', filters.priority));
        }

        const snapshot = await getDocs(q);
        const complaints = [];

        snapshot.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });

        return complaints;
    } catch (error) {
        console.error('Error getting all complaints:', error);
        // Return empty array instead of throwing to prevent page crashes
        return [];
    }
};

/**
 * Submit feedback
 */
export const submitFeedback = async (complaintId, rating, comment) => {
    try {
        const feedback = {
            complaintId,
            rating,
            comment,
            createdAt: Timestamp.now()
        };

        await addDoc(collection(db, 'feedback'), feedback);

        // Update complaint with feedback flag
        const docRef = doc(db, 'complaints', complaintId);
        await updateDoc(docRef, {
            hasFeedback: true,
            feedbackRating: rating
        });

        return feedback;
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }
};

export default {
    createComplaint,
    getComplaint,
    getUserComplaints,
    getNearbyComplaints,
    updateComplaintStatus,
    getOfficerComplaints,
    getAllComplaints,
    submitFeedback
};
