const conf = {
  appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
  appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
  appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
  appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
  appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
  tinyMceApiKey: String(import.meta.env.VITE_TINYMCE_API_KEY),
  appwriteProfilesCollectionId: String(
    import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID
  ),
  appwriteCommentsCollectionId: String(
    import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID
  ),
  appwriteLikesCollectionId: String(
    import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID
  ),
  appwriteSubscriptionsCollectionId: String(
    import.meta.env.VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID
  ),
  appwriteReportsCollectionId: String(
    import.meta.env.VITE_APPWRITE_REPORTS_COLLECTION_ID
  ),
  appwriteBookmarksCollectionId: String(
    import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID
  ),
  appwriteHistoryCollectionId: String(
    import.meta.env.VITE_APPWRITE_HISTORY_COLLECTION_ID
  ),
  appwriteSearchHistoryId: String(
    import.meta.env.VITE_APPWRITE_SEARCHHISTORY_COLLECTION_ID
  ),
  appwriteNotificationsCollectionId: String(
    import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID
  ),
  appwriteFunctionAuthId: String(
    import.meta.env.VITE_APPWRITE_FUNCTION_AUTH_ID
  ),
  appwriteFunctionChatId: String(import.meta.env.VITE_APPWRITE_FUNCTION_CHAT_ID),
  appwriteSoundFileId: String(import.meta.env.VITE_APPWRITE_SOUND_FILE_ID),
  appwriteCollectionChatsId: String(import.meta.env.VITE_APPWRITE_COLLECTION_CHATS_ID),
  appwriteCollectionMessagesId: String(import.meta.env.VITE_APPWRITE_COLLECTION_MESSAGES_ID),
  appwriteSupportCollectionId: String(import.meta.env.VITE_APPWRITE_SUPPORT_COLLECTION_ID),
  appwriteRatingsCollectionId: String(import.meta.env.VITE_APPWRITE_RATINGS_COLLECTION_ID),


      // firebase.js config
  firebaseApiKey: String(import.meta.env.VITE_FIREBASE_API_KEY),
  firebaseAuthDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  firebaseProjectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  firebaseStorageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  firebaseMessagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  firebaseAppId: String(import.meta.env.VITE_FIREBASE_APP_ID),
  firebaseMeasurementId: String(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),

};

export default conf;

export function notificationSound() {
  return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${conf.appwriteSoundFileId}/view?project=${conf.appwriteProjectId}`;
}