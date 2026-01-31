import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import appwriteService from "../appwrite/config";
import compressImage from "../components/utils/compress"; // Check path
import { useSelector } from "react-redux";

export default function useSubmitPost() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState(""); 
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submitPost = async ({ data, explicitStatus, existingPost }) => {
    if (!navigator.onLine) {
        toast.error("You are offline. Cannot publish now.", {
            icon: "🚫",
            duration: 4000
        });
        return; 
    }

    if (!userData) return toast.error("Session expired. Login again.");

    setLoading(true);
    setProgress(10);
    const toastId = toast.loading(existingPost ? "Updating post..." : "Publishing post...");
    let fileId = existingPost ? existingPost.featuredImage : null;
    let uploadedFile = null;

    try {
      // 1. IMAGE HANDLING
      if (data.image?.[0]) {
        setUploadStage("Compressing Image...");
        const compressedBlob = await compressImage(data.image[0]);
        const fileToUpload = new File([compressedBlob], data.image[0].name, { type: compressedBlob.type });

        setUploadStage("Uploading to Cloud...");
        setProgress(40);
        
        uploadedFile = await appwriteService.uploadFile(fileToUpload);
        if (uploadedFile) {
          fileId = uploadedFile.$id;
          // Delete old image if updating
          if (existingPost?.featuredImage) {
            await appwriteService.deleteFile(existingPost.featuredImage);
          }
        }
      }

      setUploadStage("Saving Details...");
      setProgress(80);

      // 2. PREPARE DATA
      const dbPayload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: explicitStatus || "active",
        featuredImage: fileId, 
        userId: userData.$id,
        authorName: data.authorName, 
        tags: data.tags, 
        summary: data.summary,
        searchIndex: data.searchIndex 
      };

      // 3. DB OPERATION
      let dbPost;
      if (existingPost) {
        dbPost = await appwriteService.updatePost(existingPost.$id, dbPayload);
      } else {
        dbPost = await appwriteService.createPost(dbPayload);
      }

      if (dbPost) {
        setProgress(100);
        toast.success(explicitStatus === "active" ? "Published Successfully!" : "Draft Saved!");
        localStorage.removeItem("post-auto-save"); 
        navigate(`/post/${dbPost.$id}`);
      }

    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.message || "Something went wrong");
      
      if (uploadedFile && !existingPost) {
        await appwriteService.deleteFile(uploadedFile.$id);
      }
    } finally {
      setLoading(false);
      setProgress(0);
      setUploadStage("");
      toast.dismiss(toastId);
    }
  };

  return { submitPost, loading, progress, uploadStage };
}