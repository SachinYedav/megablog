/* eslint-env node */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ------------------------------------------------------------------
// 1. ENVIRONMENT CONFIGURATION
// ------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ------------------------------------------------------------------
// 2. EXPORT CONFIG OBJECT
// ------------------------------------------------------------------
const confNode = {
    appwriteUrl: String(process.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(process.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(process.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(process.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteBucketId: String(process.env.VITE_APPWRITE_BUCKET_ID),
};

if (!process.env.VITE_APPWRITE_URL) {
    console.warn("⚠️  WARNING: Environment variables are missing in conf-node.js! Check .env path.");
}

export default confNode;