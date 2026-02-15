import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Parse points per question string into array
 * Example: "10,10,20,30,30" -> [10, 10, 20, 30, 30]
 */
export function parsePointsPerQuestion(pointsStr: string): number[] {
  return pointsStr.split(',').map((p) => parseInt(p.trim(), 10));
}

/**
 * Format points array back to string
 */
export function formatPointsPerQuestion(points: number[]): string {
  return points.join(',');
}
