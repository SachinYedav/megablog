import React from "react";
import { Container, PostForm, SEO } from "../components";
import useSubmitPost from "../hooks/useSubmitPost";

function AddPost() {
  const { submitPost, loading, progress, uploadStage } = useSubmitPost();

  return (
    <div className="py-8 w-full bg-gray-50 dark:bg-black/20 min-h-screen">
      <SEO title="Add Post" />
      <Container>
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
           <p className="text-sm text-gray-500">Craft your masterpiece.</p>
        </div>

        <PostForm 
           onPostSubmit={submitPost} 
           loading={loading}
           progress={progress}
           uploadStage={uploadStage}
        />
      </Container>
    </div>
  );
}

export default AddPost;