// Assignment Service
import { db } from '../config/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DEPARTMENTS } from '../utils/constants';

/**
 * Auto-assign complaint to department based on category and location
 */
export const autoAssignComplaint = async (complaintId, category, location) => {
    try {
        // Find department for category
        const department = DEPARTMENTS.find(dept =>
            dept.categories.includes(category)
        );

        if (!department) {
            throw new Error('No department found for category');
        }

        // Get available officers from department
        const officers = await getAvailableOfficers(department.id);

        if (officers.length === 0) {
            console.warn('No officers available, complaint remains unassigned');
            return null;
        }

        // Simple round-robin assignment (can be enhanced with load balancing)
        const assignedOfficer = officers[0];

        // Update complaint
        const complaintRef = doc(db, 'complaints', complaintId);
        await updateDoc(complaintRef, {
            assignedTo: assignedOfficer.id,
            assignedOfficerName: assignedOfficer.name,
            department: department.id,
            departmentName: department.name,
            status: 'assigned',
            assignedAt: new Date()
        });

        return assignedOfficer;
    } catch (error) {
        console.error('Error auto-assigning complaint:', error);
        throw error;
    }
};

/**
 * Get available officers for a department
 */
const getAvailableOfficers = async (departmentId) => {
    try {
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'officer'),
            where('department', '==', departmentId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(q);
        const officers = [];

        snapshot.forEach((doc) => {
            officers.push({ id: doc.id, ...doc.data() });
        });

        // Sort by workload (least assigned first)
        officers.sort((a, b) => (a.assignedCount || 0) - (b.assignedCount || 0));

        return officers;
    } catch (error) {
        console.error('Error getting available officers:', error);
        return [];
    }
};

/**
 * Manual assignment by admin
 */
export const manualAssignComplaint = async (complaintId, officerId, officerName) => {
    try {
        const complaintRef = doc(db, 'complaints', complaintId);
        await updateDoc(complaintRef, {
            assignedTo: officerId,
            assignedOfficerName: officerName,
            status: 'assigned',
            assignedAt: new Date()
        });

        return true;
    } catch (error) {
        console.error('Error manually assigning complaint:', error);
        throw error;
    }
};

export default {
    autoAssignComplaint,
    manualAssignComplaint
};
