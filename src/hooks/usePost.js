import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../api/supabase-client";

export function usePosts() {
  const queryClient = useQueryClient();

  // Get all posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Add post
  const add = useMutation({
    mutationFn: async (post) => {
      const { error } = await supabase.from("posts").insert([post]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Edit post
  const edit = useMutation({
    mutationFn: async ({ id, ...updated }) => {
      const { error } = await supabase.from("posts").update(updated).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Delete post
  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { posts, isLoading, add, edit, remove };
}
