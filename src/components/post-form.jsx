// src/components/PostForm.jsx
import React, { useState, useRef } from "react";
import { supabase } from "../api/supabase-client";
import { usePosts } from "../hooks/usePost";

export default function PostForm() {
  const { posts, isLoading, add, edit, remove } = usePosts();

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Ref for file input so we can reset its value on submit
  const fileInputRef = useRef(null);

  // Upload image to Supabase Storage
  const uploadImage = async () => {
    if (!file) return "";
    const filePath = `posts/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("images").upload(filePath, file);
    if (error) {
      console.error("Upload failed:", error.message);
      return "";
    }
    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    let imageUrl = form.image_url;
    if (file) imageUrl = await uploadImage();

    const payload = { ...form, image_url: imageUrl };

    if (editingId) {
      edit.mutate({ ...payload, id: editingId });
      setEditingId(null);
    } else {
      add.mutate(payload);
    }

    setForm({ title: "", description: "", content: "", image_url: "" });
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({ ...post });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id) => remove.mutate(id);

  if (isLoading) return <p className="text-center mt-6">Loading posts...</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        {editingId ? "Edit Post" : "Add Post"}
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white p-4 rounded shadow"
      >
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="border p-2 rounded"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Content"
          rows="4"
          className="border p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
          ref={fileInputRef}
        />

        <button
          type="submit"
          className={`p-2 text-white rounded ${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {editingId ? "Update Post" : "Add Post"}
        </button>
      </form>

      {/* Success message */}
      {(add.isSuccess || edit.isSuccess) && (
        <p className="text-green-600 text-center mt-4">
          {add.isSuccess ? "Post added successfully!" : "Post updated successfully!"}
        </p>
      )}

      {/* Post list */}
      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-3 border rounded bg-gray-50 shadow-sm"
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h2 className="font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-600">{post.description}</p>
              <p className="mt-1">{post.content}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(post)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
