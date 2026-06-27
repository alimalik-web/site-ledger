/**
 * Active storage adapter.
 * To switch to Postgres: replace LocalStorageAdapter with your PostgresAdapter here.
 * No other file needs to change.
 */
import { LocalStorageAdapter } from './localStorage';

export const storageAdapter = new LocalStorageAdapter();
