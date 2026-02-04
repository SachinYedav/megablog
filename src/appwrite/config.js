import conf from "../conf/conf.js";
import { Client, Databases, ID, Storage, Query, Functions } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;
  functions;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
    this.functions = new Functions(this.client);
  }

  // ============================================================
  // PROFILE SERVICES 
  // ============================================================
async checkUsernameAvailability(username) {
    console.log("🕵️ Checking Availability for:", username);
    try {
        const result = await this.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteProfilesCollectionId,
            [Query.equal("username", username), Query.limit(1)]
        );
        return result.documents.length === 0;

    } catch (error) {
        console.error("❌ API ERROR (Check this!):", error);
        return false;
    }
}
  //  1. Create Profile
  async createUserProfile({ userId, name, email, username }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteProfilesCollectionId, 
        userId, 
        {
          userId: userId,
          name: name,
          email: email,
          username: username || userId,
          bio: "",
          avatarId: null,
          isPro: false,
          subscribersCount: 0,
          prefs: JSON.stringify({})
        }
      );
    } catch (error) {
      console.log("Appwrite service :: createUserProfile :: error", error);
      throw error;
    }
  }

  //  2. Get Profile
  async getUserProfile(userId) {
     try {
        return await this.databases.getDocument(
            conf.appwriteDatabaseId,
            conf.appwriteProfilesCollectionId, 
            userId
        );
     } catch (error) {
        return null;
     }
  }

  async getUserProfileByUsername(username) {
    try {
      const result = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProfilesCollectionId,
        [Query.equal("username", username), Query.limit(1)]
      );
      
      return result.documents.length > 0 ? result.documents[0] : null;
    } catch (error) {
      console.log("Appwrite service :: getUserProfileByUsername :: error", error);
      return null;
    }
  }

  //  3. Update Profile (Safe)
  async updateUserProfile({ userId, documentId, ...data }) {
    try {

        const docId = documentId || userId; 
        
        const { userId: _, email: __, $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...cleanData } = data;

        const result = await this.databases.updateDocument(
            conf.appwriteDatabaseId,
            conf.appwriteProfilesCollectionId,
            docId,
            cleanData
        );
        return result;

    } catch (error) {
        console.error("❌ DB Update FAILED:", error); 
        throw error;
    }
}

  // ============================================================
  // POST SERVICES
  // ============================================================

  async createPost({ title, slug, content, featuredImage, status, userId, authorName, tags, searchIndex }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId, 
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          userId,
          authorName,
          tags,
          searchIndex,
          slug,
          views: 0,
          isPinned: false
        }
      );
    }catch (error) {
      console.log("Appwrite service :: createPost :: error", error);
      if (error.code === 409) {
        throw new Error("A post with this title already exists. Please choose a unique title.");
      }
      throw error;
    }
  }

  async updatePost(slug, { title, content, featuredImage, status, tags, views, isPinned, searchIndex }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          tags,
          searchIndex,
          slug,
          views,
          isPinned,
        }
      );
    } catch (error) {
      console.log("Appwrite service :: updatePost :: error", error);
    }
  }

  async getPost(slug) {
    if (!slug) return null;
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
    } catch (error) {
      console.log("Appwrite service :: getPost :: error", error);
      return null;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
    } catch (error) {
      console.log("Appwrite service :: getPosts :: error", error);
      return false;
    }
  }

  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return true;
    } catch (error) {
      console.log("Appwrite service :: deletePost :: error", error);
      return false;
    }
  }

  // Related Posts Logic
  async getRelatedPosts(currentPostId, userId) {
    try {
      // 1. Same Author 
      let posts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [
          Query.equal("userId", userId),
          Query.equal("status", "active"), 
          Query.notEqual("$id", currentPostId),
          Query.limit(4),
        ]
      );

      // 2. Fallback Recent 
      if (posts.documents.length < 4) {
        const limitNeeded = 4 - posts.documents.length;
        const morePosts = await this.databases.listDocuments(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          [
            Query.equal("status", "active"),
            Query.notEqual("$id", currentPostId),
            Query.notEqual("userId", userId),
            Query.limit(limitNeeded),
            Query.orderDesc("$createdAt"),
          ]
        );
        posts.documents = [...posts.documents, ...morePosts.documents];
      }
      return posts;
    } catch (error) {
      console.log("Appwrite service :: getRelatedPosts :: error", error);
      return false;
    }
  }

  // ============================================================
  // COMMENTS SERVICES
  // ============================================================

  async createComment({ content, postId, userId, authorName, parentId = null }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        ID.unique(),
        {
          content,
          postId,
          userId,
          authorName,
          parentId,
        }
      );
    } catch (error) {
      console.log("Appwrite service :: createComment :: error", error);
      return false;
    }
  }

  async getComments(postId) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        [Query.equal("postId", postId), Query.orderDesc("$createdAt")]
      );
    } catch (error) {
      console.log("Appwrite service :: getComments :: error", error);
      return false;
    }
  }


// RECURSIVE DELETE COMMENT WITH CHILDREN
async deleteComment(commentId) {
    try {
        // Find children (Replies)
        const children = await this.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteCommentsCollectionId,
            [Query.equal("parentId", commentId), Query.limit(100)] 
        );
        
        // Recursively delete children first
        if (children.total > 0) {
            await Promise.all(
                children.documents.map(child => 
                    this.deleteComment(child.$id).catch(e => console.warn("Child delete skip", e))
                )
            );
        }

        // Now delete the parent
        await this.databases.deleteDocument(
            conf.appwriteDatabaseId,
            conf.appwriteCommentsCollectionId,
            commentId
        );
        return true;
    } catch (error) {
        if (error.code === 404) return true;
        
        console.log("Appwrite service :: deleteComment :: error", error);
        return false;
    }
}

  async updateComment(commentId, content) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        commentId,
        { content }
      );
    } catch (error) {
      console.log("Appwrite service :: updateComment :: error", error);
      return false;
    }
  }

  // ============================================================
  //  REACTION SERVICES
  // ============================================================

  async toggleReaction(collectionId, documentId, userId, reactionType, currentLikes = [], currentDislikes = []) {
    try {
      let newLikes = [...currentLikes];
      let newDislikes = [...currentDislikes];

      if (reactionType === "like") {
        if (newLikes.includes(userId)) {
          newLikes = newLikes.filter((id) => id !== userId);
        } else {
          newLikes.push(userId);
          newDislikes = newDislikes.filter((id) => id !== userId);
        }
      } else if (reactionType === "dislike") {
        if (newDislikes.includes(userId)) {
          newDislikes = newDislikes.filter((id) => id !== userId);
        } else {
          newDislikes.push(userId);
          newLikes = newLikes.filter((id) => id !== userId);
        }
      }

      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        collectionId, 
        documentId,
        {
          likes: newLikes,
          dislikes: newDislikes,
        }
      );
    } catch (error) {
      console.log("Appwrite service :: toggleReaction :: error", error);
      throw error;
    }
  }

  // ============================================================
  //  SUBSCRIPTION SERVICES
  // ============================================================

  async getSubscription(subscriberId, authorId) {
    if (!subscriberId || !authorId) return null;
    try {
      const result = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteSubscriptionsCollectionId,
        [
          Query.equal("subscriberId", subscriberId),
          Query.equal("authorId", authorId),
        ]
      );
      return result.documents.length > 0 ? result.documents[0] : null;
    } catch (error) {
      return null;
    }
  }

  async getUserSubscriptions(subscriberId) {
    if (!subscriberId) return [];
    try {
      const result = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteSubscriptionsCollectionId,
        [Query.equal("subscriberId", subscriberId)]
      );
      return result.documents;
    } catch (error) {
      console.log("Appwrite service :: getUserSubscriptions :: error", error);
      return [];
    }
  }

  async toggleSubscribe(subscriberId, authorId) {
    if (!subscriberId || !authorId) return false;
    try {
      const existingSub = await this.getSubscription(subscriberId, authorId);
      if (existingSub) {
        await this.databases.deleteDocument(
          conf.appwriteDatabaseId,
          conf.appwriteSubscriptionsCollectionId,
          existingSub.$id
        );
        return false; // Unsubscribed
      } else {
        await this.databases.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteSubscriptionsCollectionId,
          ID.unique(),
          { subscriberId, authorId }
        );
        return true; // Subscribed
      }
    } catch (error) {
      console.log("Service :: toggleSubscribe :: error", error);
      throw error;
    }
  }

  // ============================================================
  //  REPORT SERVICES
  // ============================================================

  async createReport({ reporterId, targetId, targetType, reason, details }) {
        try {
            return await this.functions.createExecution(
                conf.appwriteFunctionAuthId, 
                JSON.stringify({
                    action: "reportContent",
                    reporterId,
                    targetId,
                    targetType,
                    reason,
                    details
                })
            );
        } catch (error) {
            console.log("Appwrite service :: createReport :: error", error);
            return false;
        }
    }

  // ============================================================
  //  STORAGE & UTILS
  // ============================================================

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      console.log("Appwrite service :: uploadFile :: error", error);

      if (error.code === 413) {
          throw new Error("Image file is too large (Max 10MB allowed).");
      }
      throw error; 
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.log("Appwrite service :: deleteFile :: error", error);
      return false;
    }
  }

  getFilePreview(fileId) {
    if (!fileId) return "";
    try {
      return this.bucket.getFileView(conf.appwriteBucketId, fileId);
    } catch (error) {
      console.log("Appwrite service :: getFilePreview :: error", error);
      return "";
    }
  }

  // ============================================================
  // NOTIFICATIONS (Database + Function)
  // ============================================================

  async getNotifications(userId, limit = 100) {
    if (!userId) return { documents: [], total: 0 };
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteNotificationsCollectionId,
        [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ]
      );
    } catch (error) {
      console.log("Appwrite service :: getNotifications :: error", error);
      return { documents: [], total: 0 };
    }
  }

  //  Create Notification (Direct DB for UI)
  async createNotification({ userId, message, link, senderName, senderAvatar, postTitle, postImage, type = "general" }) {
    if (!userId) return;
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteNotificationsCollectionId,
        ID.unique(),
        {
          userId,
          message,
          link,
          senderName: senderName || "Anonymous",
          senderAvatar: senderAvatar || "",
          postTitle: postTitle || "", 
          postImage: postImage || "",
          type,
          isRead: false,
        }
      );
    } catch (error) {
      console.error("Appwrite service :: createNotification :: error", error);
    }
  }

  async markNotificationRead(notificationId) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteNotificationsCollectionId,
        notificationId,
        { isRead: true }
      );
    } catch (error) {
      console.log("Appwrite service :: markNotificationRead :: error", error);
    }
  }

  // ============================================================
  // BOOKMARKS & HISTORY SERVICES
  // ============================================================

  // 1. ADD BOOKMARK (Create)
  async addBookmark({ userId, postId }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteBookmarksCollectionId,
        ID.unique(),
        { userId, postId }
      );
    } catch (error) {
      console.log("Appwrite service :: addBookmark :: error", error);
      return false;
    }
  }

  // 2. DELETE BOOKMARK (Remove)
  async deleteBookmark(documentId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteBookmarksCollectionId,
        documentId
      );
      return true;
    } catch (error) {
      console.log("Appwrite service :: deleteBookmark :: error", error);
      return false;
    }
  }

  // 3. GET BOOKMARKS 
  async getBookmarks(userId, queries = []) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteBookmarksCollectionId,
        [
            Query.equal("userId", userId),
            Query.orderDesc("$createdAt"), 
            ...queries 
        ]
      );
    } catch (error) {
      console.log("Appwrite service :: getBookmarks :: error", error);
      return false;
    }
  }

  // 4. CHECK IF POST IS BOOKMARKED
  async isPostBookmarked(userId, postId) {
    try {
      const res = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteBookmarksCollectionId,
        [
          Query.equal("userId", userId),
          Query.equal("postId", postId),
          Query.limit(1),
        ]
      );
      return res.documents.length > 0 ? res.documents[0] : null;
    } catch (error) {
      return null;
    }
  }

  // 5. ADD TO HISTORY 
  async addToHistory({ userId, postId }) {
    try {
      const existing = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteHistoryCollectionId,
        [Query.equal("userId", userId), Query.equal("postId", postId)]
      );

      if (existing.documents.length > 0) {
        await Promise.all(
          existing.documents.map((doc) =>
            this.databases.deleteDocument(
              conf.appwriteDatabaseId,
              conf.appwriteHistoryCollectionId,
              doc.$id
            )
          )
        );
      }

      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteHistoryCollectionId,
        ID.unique(),
        { userId, postId }
      );
    } catch (error) {
      console.log("Appwrite service :: addToHistory :: error", error);
      return false;
    }
  }

  // 6. GET HISTORY 
  async getUserHistory(userId, queries = []) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteHistoryCollectionId,
        [
            Query.equal("userId", userId),
            Query.orderDesc("$createdAt"),
            ...queries 
        ]
      );
    } catch (error) {
      console.log("Appwrite service :: getUserHistory :: error", error);
      return false;
    }
  }

  // 7. DELETE SINGLE HISTORY ITEM 
  async deleteHistoryItem(documentId) {
      try {
          await this.databases.deleteDocument(
              conf.appwriteDatabaseId,
              conf.appwriteHistoryCollectionId,
              documentId
          );
          return true;
      } catch (error) {
          console.log("Appwrite service :: deleteHistoryItem :: error", error);
          return false;
      }
  }

  // 8. CLEAR ALL HISTORY
  async clearUserHistory(userId) {
    try {
        let deletedCount = 0;
        let loopCount = 0;
        const MAX_LOOPS = 20; 

        while (loopCount < MAX_LOOPS) {
            const list = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteHistoryCollectionId,
                [Query.equal("userId", userId), Query.limit(100)]
            );

            if (list.documents.length === 0) break;

            // Delete batch
            await Promise.all(
                list.documents.map((doc) =>
                    this.databases.deleteDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteHistoryCollectionId,
                        doc.$id
                    ).catch(e => console.warn(`Failed to delete doc ${doc.$id}`, e)) 
                )
            );
            
            deletedCount += list.documents.length;
            loopCount++;
        }
        
        return deletedCount;
    } catch (error) {
        console.log("Appwrite service :: clearUserHistory :: error", error);
        return false;
    }
  }

  async updatePostPinStatus(slug, isPinned) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        { isPinned }
      );
    } catch (error) {
      console.log("Appwrite service :: updatePost :: error", error);
      throw error; 
    }
  }

  async pinPost(userId, newPostId) {
    try {
      const pinnedPosts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [Query.equal("userId", userId), Query.equal("isPinned", true)]
      );

      if (pinnedPosts.documents.length > 0) {
        await Promise.all(
          pinnedPosts.documents.map((post) =>
            this.updatePostPinStatus(post.$id, false)
          )
        );
      }
      return await this.updatePostPinStatus(newPostId, true);
    } catch (error) {
      return false;
    }
  }

  // ============================================================
    //  SEARCH HISTORY SERVICES 
    // ============================================================

    // 1. Add to History
    async addToSearchHistory(userId, query) {
        if (!query || !userId) return;
        try {
            const existing = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteSearchHistoryId,
                [Query.equal("userId", userId), Query.equal("query", query)]
            );

            if (existing.documents.length > 0) {
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteSearchHistoryId,
                    existing.documents[0].$id
                );
            }

            // Create New Entry 
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteSearchHistoryId,
                ID.unique(),
                {
                    userId,
                    query
                }
            );
        } catch (error) {
            console.log("Search History Add Error (Non-fatal):", error);
        }
    }

    //  Get Recent History
    async getSearchHistory(userId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteSearchHistoryId,
                [
                    Query.equal("userId", userId),
                    Query.orderDesc("$createdAt"), 
                    Query.limit(5)
                ]
            );
        } catch (error) {
            console.log("Search History Fetch Error:", error);
            return null;
        }
    }

    //  Remove Single History Item 
    async deleteSearchHistoryItem(documentId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteSearchHistoryId,
                documentId
            );
            return true;
        } catch (error) {
            return false;
        }
    }

async getSearchSuggestions(query) {
        if (!query || query.trim().length === 0) {
            return { documents: [] };
        }

        try {
            const smartQuery = query.trim() + "*"; 
            const queries = [
                Query.limit(5),
                Query.search("searchIndex", smartQuery) 
            ];

            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
        } catch (error) {
            console.log("Appwrite service :: getSearchSuggestions :: error", error);
            return { documents: [] };
        }
    }
    
  // Trigger Cloud Function 
  async sendNotification(payload) {
    try {
      return await this.functions.createExecution(
        conf.appwriteFunctionAuthId,
        JSON.stringify({
          action: "triggerNotification",
          ...payload,
        })
      );
    } catch (error) {
      console.log("Notification Function Error:", error);
      return false;
    }
  }


    async getRatings() {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                [
                    Query.limit(1000) 
                ]
            );
        } catch (error) {
            console.log("Appwrite serive :: getRatings :: error", error);
            return false;
        }
    }

    async getUserReview(userId) {
        try {
            const res = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                [Query.equal("userId", userId)]
            );
            return res.documents.length > 0 ? res.documents[0] : null;
        } catch (error) {
            console.log("Appwrite serive :: getUserReview :: error", error);
            return null;
        }
    }

    async addReview({ userId, rating, review, userName, userAvatar }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                ID.unique(),
                {
                    userId,
                    rating,
                    review,
                    userName,
                    userAvatar
                }
            );
        } catch (error) {
            console.log("Appwrite serive :: addReview :: error", error);
            throw error;
        }
    }

    async deleteReview(reviewId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                reviewId
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteReview :: error", error);
            return false;
        }
    }

    async updateReview(reviewId, { rating, review }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                reviewId,
                {
                    rating,
                    review
                }
            );
        } catch (error) {
            console.log("Appwrite service :: updateReview :: error", error);
            throw error;
        }
    }

    async getUserCount() {
    try {
      const result = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProfilesCollectionId, 
        [
            Query.limit(1) 
        ]
      );
      return result.total;
    } catch (error) {
      console.log("Appwrite service :: getUserCount :: error", error);
      return 0; 
    }
  }
}

const service = new Service();
export default service;