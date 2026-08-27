import { UserRole } from '../generated/prisma/client.js';

export const mapClerkRole = (userRole?: string | null): UserRole => {
  const normalized = (userRole ?? 'learner').toLowerCase();

  if (normalized === 'instructor' || normalized === 'teacher') {
    return 'INSTRUCTOR';
  }

  if (normalized === 'admin') {
    return 'ADMIN';
  }

  return 'LEARNER';
};
