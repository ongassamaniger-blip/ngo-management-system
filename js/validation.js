// ==================== VALIDATION UTILITIES ====================
// Shared validation functions for the NGO Management System
// Author: NGO Management System
// Version: 1.0.0

/**
 * UUID validation regex pattern
 * Validates UUID v4 format (8-4-4-4-12 hexadecimal characters)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid UUID, false otherwise
 */
function isValidUUID(id) {
    if (!id || typeof id !== 'string') {
        return false;
    }
    return UUID_REGEX.test(id);
}

/**
 * Validates if a value is a valid facility ID
 * Checks for:
 * - Null or undefined
 * - String literals 'null' or 'undefined'
 * - Empty or whitespace-only strings
 * - Valid UUID format
 * 
 * @param {string} facilityId - The facility ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidFacilityId(facilityId) {
    // Check for falsy values
    if (!facilityId) {
        return false;
    }
    
    // Check for string literals
    if (facilityId === 'null' || facilityId === 'undefined') {
        return false;
    }
    
    // Check for empty or whitespace-only strings
    if (String(facilityId).trim() === '') {
        return false;
    }
    
    // Validate UUID format
    return isValidUUID(facilityId);
}

/**
 * Validates if a value is a valid project ID
 * Uses same validation as facility ID
 * 
 * @param {string} projectId - The project ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidProjectId(projectId) {
    return isValidFacilityId(projectId); // Same validation logic
}

/**
 * Validates if an entity has a valid ID property
 * @param {object} entity - The entity to check
 * @param {string} idField - The name of the ID field (default: 'id')
 * @returns {boolean} - True if entity has valid ID, false otherwise
 */
function hasValidId(entity, idField = 'id') {
    if (!entity || typeof entity !== 'object') {
        return false;
    }
    
    return isValidUUID(entity[idField]);
}

/**
 * Filters an array of entities to only include those with valid IDs
 * @param {Array} entities - Array of entities to filter
 * @param {string} idField - The name of the ID field (default: 'id')
 * @returns {Array} - Filtered array containing only entities with valid IDs
 */
function filterValidEntities(entities, idField = 'id') {
    if (!Array.isArray(entities)) {
        return [];
    }
    
    return entities.filter(entity => {
        const isValid = hasValidId(entity, idField);
        if (!isValid) {
            console.warn(`Found entity with invalid ${idField}:`, entity);
        }
        return isValid;
    });
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gets a user-friendly error message for invalid ID
 * @param {string} entityType - Type of entity (e.g., 'tesis', 'proje')
 * @param {string} id - The invalid ID
 * @returns {string} - Error message in Turkish
 */
function getInvalidIdErrorMessage(entityType = 'tesis', id = null) {
    const capitalizedEntity = capitalizeFirstLetter(entityType);
    
    // Check if ID is null, undefined, or invalid string
    if (!id || id === 'null' || id === 'undefined') {
        return `${capitalizedEntity} ID bulunamadı! Lütfen dashboard üzerinden bir ${entityType} seçin.`;
    }
    
    // Check for empty string (with safe string conversion and trim)
    if (typeof id === 'string' && id.trim() === '') {
        return `${capitalizedEntity} ID bulunamadı! Lütfen dashboard üzerinden bir ${entityType} seçin.`;
    }
    
    // Check UUID format
    if (!isValidUUID(id)) {
        return `Geçersiz ${entityType} ID formatı! Lütfen dashboard üzerinden bir ${entityType} seçin.`;
    }
    
    return `${capitalizedEntity} bulunamadı.`;
}

// Export for use in other modules
window.ValidationUtils = {
    UUID_REGEX,
    isValidUUID,
    isValidFacilityId,
    isValidProjectId,
    hasValidId,
    filterValidEntities,
    getInvalidIdErrorMessage,
    capitalizeFirstLetter
};

// Only log in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Validation Utilities loaded!');
}
