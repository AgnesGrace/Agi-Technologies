import db from '../db/db.js';

interface ISyncClerkUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
}

export const syncClerkUser = async ({
  id,
  email,
  name,
  imageUrl,
}: ISyncClerkUser) => {
  return db.user.upsert({
    where: { id },
    update: {
      email,
      name,
      imageUrl: imageUrl ?? null,
    },
    create: {
      id,
      email,
      name,
      imageUrl: imageUrl ?? null,
      role: 'STUDENT',
    },
  });
};
