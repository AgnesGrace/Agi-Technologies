import db from '../db/db.js';
import { UserRole } from '../generated/prisma/client.js';

interface ISyncClerkUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  role: UserRole;
}

export const syncClerkUser = async ({
  id,
  email,
  name,
  imageUrl,
  role,
}: ISyncClerkUser) => {
  return db.user.upsert({
    where: { id },
    update: {
      email,
      name,
      imageUrl: imageUrl ?? null,
      role,
    },
    create: {
      id,
      email,
      name,
      imageUrl: imageUrl ?? null,
      role,
    },
  });
};
