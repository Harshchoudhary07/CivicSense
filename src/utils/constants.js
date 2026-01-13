// Application Constants

export const CATEGORIES = [
    { id: 'road', name: 'Road', icon: '🛣️', color: 'category-road' },
    { id: 'water', name: 'Water', icon: '💧', color: 'category-water' },
    { id: 'garbage', name: 'Garbage', icon: '🗑️', color: 'category-garbage' },
    { id: 'electricity', name: 'Electricity', icon: '⚡', color: 'category-electricity' }
];

export const STATUSES = {
    SUBMITTED: 'submitted',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    ESCALATED: 'escalated'
};

export const STATUS_LABELS = {
    [STATUSES.SUBMITTED]: 'Submitted',
    [STATUSES.ASSIGNED]: 'Assigned',
    [STATUSES.IN_PROGRESS]: 'In Progress',
    [STATUSES.RESOLVED]: 'Resolved',
    [STATUSES.ESCALATED]: 'Escalated'
};

export const PRIORITIES = {
    NORMAL: 'normal',
    HIGH: 'high',
    CRITICAL: 'critical'
};

export const PRIORITY_LABELS = {
    [PRIORITIES.NORMAL]: 'Normal',
    [PRIORITIES.HIGH]: 'High',
    [PRIORITIES.CRITICAL]: 'Critical'
};

export const USER_ROLES = {
    CITIZEN: 'citizen',
    OFFICER: 'officer',
    ADMIN: 'admin'
};

export const DEPARTMENTS = [
    { id: 'roads', name: 'Road Department', categories: ['road'] },
    { id: 'water', name: 'Water Supply', categories: ['water'] },
    { id: 'sanitation', name: 'Sanitation Department', categories: ['garbage'] },
    { id: 'electricity', name: 'Electricity Board', categories: ['electricity'] }
];

// Priority calculation rules
export const PRIORITY_RULES = {
    NEAR_SENSITIVE_AREA: {
        keywords: ['school', 'hospital', 'clinic', 'college'],
        radius: 500, // meters
        priority: PRIORITIES.HIGH
    },
    MULTIPLE_REPORTS: {
        threshold: 3,
        priority: PRIORITIES.CRITICAL
    },
    PENDING_DURATION: {
        hours: 48,
        priority: PRIORITIES.CRITICAL,
        status: STATUSES.ESCALATED
    }
};

export const SENSITIVE_LOCATIONS = [
    { name: 'City Hospital', lat: 0, lng: 0 },
    { name: 'Central School', lat: 0, lng: 0 }
    // Add actual coordinates for your city
];
