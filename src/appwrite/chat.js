import { Client, Databases, Storage, ID, Query, Functions } from "appwrite";
import conf from "../conf/conf";

export class ChatService {
    client = new Client();
    databases;
    storage;
    functions;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
        this.functions = new Functions(this.client);
    }

    // ============================================================
    // SECTION 1: SESSION MANAGEMENT 
    // ============================================================

    async createChatSession({ type, userId, entityId = null, participants = [] }) {
        try {
            const execution = await this.functions.createExecution(
                conf.appwriteFunctionChatId,
                JSON.stringify({
                    action: "createChat",
                    type, userId, entityId, participants
                })
            );

            const response = JSON.parse(execution.responseBody);
            
            if (response.success) {
                return response.doc;
            } else {
                throw new Error(response.error || "Failed to create chat session");
            }
        } catch (error) {
            return this.handleError("createChatSession", error);
        }
    }

    async getArticleChat(articleId) {
        return await this.createChatSession({ type: 'article', entityId: articleId });
    }

    async getCollabChat(draftId, currentUserId, editorsList) {
        return await this.createChatSession({ type: 'collab', userId: currentUserId, entityId: draftId, participants: editorsList });
    }

   //  UPDATED: Retry Logic (Fast Fail on 404)
    async getChatFallback(chatId, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.databases.getDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionChatsId,
                    chatId
                );
            } catch (error) {
                if (error.code === 404) return null; 
                
                // Agar koi aur error hai (Network issue), to Retry karo
                if (i === retries - 1) return null; 
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    }

    // ============================================================
    //  SECTION 2: MESSAGING 
    // ============================================================

    async sendMessage({ chatId, senderId, text, image = null, senderName = "User", senderAvatar = null }) {
        let finalImageId = null; 

        try {
            if (image) {
                try {
                    const upload = await this.storage.createFile(conf.appwriteBucketId, ID.unique(), image);
                    finalImageId = upload.$id;
                } catch (err) { console.error("Image upload failed", err); }
            }

            const execution = await this.functions.createExecution(
                conf.appwriteFunctionChatId, 
                JSON.stringify({
                    action: "sendMessage",
                    chatId,
                    userId: senderId,
                    text,
                    imageId: finalImageId, 
                    senderName,
                    senderAvatar
                })
            );

            const response = JSON.parse(execution.responseBody);
            if (response.success) return response.doc;
            throw new Error(response.error || "Failed to send message");

        } catch (error) {
            return this.handleError("sendMessage", error);
        }
    }

    async getMessages(chatId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteCollectionMessagesId,
                [Query.equal("chatId", chatId), Query.orderDesc("timestamp"), Query.limit(100)]
            );
        } catch (error) {
            return this.handleError("getMessages", error);
        }
    }

    async deleteMessage(messageId) {
        try {
            return await this.databases.deleteDocument(
                conf.appwriteDatabaseId, conf.appwriteCollectionMessagesId,
                messageId
            );
        } catch (error) { return this.handleError("deleteMessage", error); }
    }

    // ============================================================
    //  SECTION 3: ACCESS & COLLABORATION
    // ============================================================

    async manageCollaborator({ type, chatId, entityId, currentUserId, targetUserId }) {
        try {
            const execution = await this.functions.createExecution(
                conf.appwriteFunctionChatId,
                JSON.stringify({
                    action: "manageAccess",
                    type, chatId, entityId, 
                    userId: currentUserId, targetUserId 
                })
            );
            
            const response = JSON.parse(execution.responseBody);
            if (response.success) return response.participants;
            
            console.error("Backend Error:", response.error);
            throw new Error(response.message || "Failed to update access");
        } catch (error) {
            throw error; 
        }
    }

    async searchUsers(query) {
        try {
            if (!query) return { documents: [] };
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteProfilesCollectionId,
                [Query.search("name", query), Query.limit(5)]
            );
        } catch (error) { return { documents: [] }; }
    }

    async getChatProfiles(userIds) {
        if(!userIds || userIds.length === 0) return { documents: [] };
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteProfilesCollectionId,
                [Query.equal("userId", userIds)]
            );
        } catch (error) { return { documents: [] }; }
    }

    handleError(method, error) {
        console.error(`ChatService :: ${method} :: error`, error);
        return false;
    }

    //  NEW: Send Support Message 
    async sendSupportMessage({ firstName, lastName, email, message, userId = null }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteSupportCollectionId, 
                ID.unique(),
                {
                    firstName,
                    lastName,
                    email,
                    message,
                    userId, 
                    status: "open", 
                }
            );
        } catch (error) {
            console.log("ChatService :: sendSupportMessage :: error", error);
            return false;
        }
    }
}

const chatService = new ChatService();
export default chatService;