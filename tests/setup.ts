import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { deleteDatabase } from '@shared/storage/database';

afterEach(async () => {
  await deleteDatabase();
});
