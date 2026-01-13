// Priority Engine Service
import { db } from '../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { PRIORITIES, STATUSES, PRIORITY_RULES, SENSITIVE_LOCATIONS } from '../utils/constants';
import { calculateDistance } from '../utils/helpers';

/**
 * Calculate priority for a complaint based on business rules
 */
export const calculatePriority = async (complaint) => {
    let priority = PRIORITIES.NORMAL;
    const reasons = [];

    // Rule 1: Check if near sensitive locations (schools, hospitals)
    if (complaint.location) {
        for (const location of SENSITIVE_LOCATIONS) {
            const distance = calculateDistance(
                complaint.location.lat,
                complaint.location.lng,
                location.lat,
                location.lng
            );

            if (distance <= PRIORITY_RULES.NEAR_SENSITIVE_AREA.radius) {
                priority = PRIORITIES.HIGH;
                reasons.push(`Near ${location.name}`);
                break;
            }
        }
    }

    // Rule 2: Check for multiple similar reports in the area
    if (complaint.location && complaint.category) {
        const similarComplaints = await getSimilarComplaints(
            complaint.category,
            complaint.location,
            1000 // 1km radius
        );

        if (similarComplaints.length >= PRIORITY_RULES.MULTIPLE_REPORTS.threshold) {
            priority = PRIORITIES.CRITICAL;
            reasons.push(`${similarComplaints.length} similar reports in area`);
        }
    }

    // Rule 3: Check if pending for too long (for updates)
    if (complaint.createdAt) {
        const createdDate = complaint.createdAt.toDate ? complaint.createdAt.toDate() : new Date(complaint.createdAt);
        const hoursPending = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);

        if (hoursPending > PRIORITY_RULES.PENDING_DURATION.hours &&
            complaint.status !== STATUSES.RESOLVED) {
            priority = PRIORITIES.CRITICAL;
            reasons.push(`Pending for ${Math.floor(hoursPending)} hours`);
        }
    }

    return { priority, reasons };
};

/**
 * Get similar complaints in an area
 */
const getSimilarComplaints = async (category, location, radiusMeters) => {
    try {
        const complaintsRef = collection(db, 'complaints');
        const q = query(
            complaintsRef,
            where('category', '==', category),
            where('status', '!=', STATUSES.RESOLVED)
        );

        const snapshot = await getDocs(q);
        const similar = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.location) {
                const distance = calculateDistance(
                    location.lat,
                    location.lng,
                    data.location.lat,
                    data.location.lng
                );

                if (distance <= radiusMeters) {
                    similar.push({ id: doc.id, ...data });
                }
            }
        });

        return similar;
    } catch (error) {
        console.error('Error getting similar complaints:', error);
        return [];
    }
};

/**
 * Check and escalate old complaints
 */
export const checkAndEscalateComplaints = async () => {
    try {
        const complaintsRef = collection(db, 'complaints');
        const q = query(
            complaintsRef,
            where('status', 'in', [STATUSES.SUBMITTED, STATUSES.ASSIGNED, STATUSES.IN_PROGRESS])
        );

        const snapshot = await getDocs(q);
        const toEscalate = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const createdDate = data.createdAt.toDate();
            const hoursPending = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);

            if (hoursPending > PRIORITY_RULES.PENDING_DURATION.hours) {
                toEscalate.push({ id: doc.id, ...data });
            }
        });

        return toEscalate;
    } catch (error) {
        console.error('Error checking complaints for escalation:', error);
        return [];
    }
};

export default {
    calculatePriority,
    checkAndEscalateComplaints
};
