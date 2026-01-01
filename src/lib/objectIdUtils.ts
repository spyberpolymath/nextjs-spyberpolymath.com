import { ObjectId } from 'mongodb';

/**
 * Safely converts various ObjectId representations to a string
 * @param id - The id that could be a string, ObjectId, or buffer object
 * @returns A string representation of the ObjectId
 */
export function safeObjectIdToString(id: any): string {
  if (!id) return '';
  
  // If it's already a string, return it
  if (typeof id === 'string') {
    return id;
  }
  
  // If it's an ObjectId instance
  if (id instanceof ObjectId) {
    return id.toString();
  }
  
  // If it's a MongoDB ObjectId-like object with toHexString method
  if (id && typeof id.toHexString === 'function') {
    return id.toHexString();
  }
  
  // If it's a MongoDB ObjectId-like object with toString method
  if (id && typeof id.toString === 'function') {
    return id.toString();
  }
  
  // If it's a buffer object (from JWT parsing issues)
  if (id && typeof id === 'object' && 'buffer' in id) {
    const bufferId = id as any;
    if (bufferId.buffer && typeof bufferId.buffer === 'object') {
      // Convert buffer to hex string (MongoDB ObjectId format)
      const hexArray = Object.values(bufferId.buffer) as number[];
      return hexArray.map((byte: number) => byte.toString(16).padStart(2, '0')).join('');
    }
  }
  
  // If it's an object with _id property
  if (id && typeof id === 'object' && id._id) {
    return safeObjectIdToString(id._id);
  }
  
  // Fallback - convert to string
  return String(id);
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns boolean indicating if it's a valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch {
    return false;
  }
}