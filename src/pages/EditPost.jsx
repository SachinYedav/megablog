import React, { useEffect, useState } from "react";
import { Container, PostForm, Skeleton, SEO } from "../components";
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";
import useSubmitPost from "../hooks/useSubmitPost"; 

function EditPost() {
  const [post, setPost] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { submitPost, loading, progress, uploadStage } = useSubmitPost();

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((post) => {
        if (post) {
          setPost(post);
          setInitialLoading(false);
        } else {
            navigate("/");
        }
      });
    } else {
      navigate("/");
    }
  }, [slug, navigate]);

  if (initialLoading)
    return (
      <div className="py-8 w-full min-h-screen bg-gray-50 dark:bg-black/20">
        <Container>
           <div className="flex gap-8">
               <div className="flex-1 space-y-6">
                   <Skeleton width="100%" height="60px" className="rounded-2xl" />
                   <Skeleton width="100%" height="400px" />
               </div>
               <div className="hidden lg:block w-96 space-y-6">
                   <Skeleton width="100%" height="200px" />
                   <Skeleton width="100%" height="300px" />
               </div>
           </div>
        </Container>
      </div>
    );

  return post ? (
    <div className="py-8 w-full bg-gray-50 dark:bg-black/20 min-h-screen">
      <SEO title={`Edit: ${post.title}`} />
      <Container>
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
        </div>
        
        <PostForm 
            post={post} 
            onPostSubmit={submitPost} 
            loading={loading}
            progress={progress}
            uploadStage={uploadStage}
        />
      </Container>
    </div>
  ) : null;
}

export default EditPost;