// src/lib/database.ts
import { supabase } from './supabase';
import { useUser } from '@clerk/nextjs';

// Type definitions based on our database schema
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  last_active: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  is_published: boolean;
  published_at?: string;
  upvotes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  description: string;
  creator_id: string;
  is_public: boolean;
  upvotes: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface IdeaCollaborator {
  id: string;
  idea_id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'admin';
  joined_at: string;
}

export interface Checklist {
  id: string;
  idea_id: string;
  title: string;
  is_shared: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  position: number;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  created_by: string;
}

export interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  idea_id: string;
  checklist_id?: string;
  item_id?: string;
  action_type: string;
  details: Record<string, any>;
  created_at: string;
}

export interface TopContributor {
  id: string;
  display_name: string;
  avatar_url: string;
  post_count: number;
  comment_count: number;
  idea_count: number;
  total_contributions: number;
}

// Helper functions for working with users
export const usersService = {
  // Get a user by ID
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get a user by email
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get all active users (online in the last 5 minutes)
  async getActiveUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .gt('last_active', fiveMinutesAgo)
      .order('display_name', { ascending: true });
      
    if (error) throw error;
    return data;
  },
  
  // Update a user's online status
  async updateOnlineStatus(userId: string, isOnline: boolean) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_online: isOnline, 
        last_active: new Date().toISOString() 
      })
      .eq('id', userId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Get user profile with their ideas and posts
  async getUserProfile(userId: string) {
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    // Get published ideas by user
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .eq('creator_id', userId)
      .eq('is_published', true)
      .order('published_at', { ascending: false });
      
    if (ideasError) throw ideasError;
    
    // Get posts by user
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
      
    if (postsError) throw postsError;
    
    return { user, ideas, posts };
  },
  
  // Fetch users who have posted ideas
  async getTopContributors(limit = 10): Promise<TopContributor[]> {
    try {
      // Get distinct users who have created ideas
      const { data, error } = await supabase
        .from('ideas')
        .select('creator_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get unique creator IDs
      const uniqueCreatorIds = [...new Set(data.map(idea => idea.creator_id))];
      const limitedCreatorIds = uniqueCreatorIds.slice(0, limit);
      
      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', limitedCreatorIds);

      if (usersError) throw usersError;

      // Map to TopContributor format for compatibility
      return usersData.map(user => ({
        id: user.id,
        display_name: user.display_name || 'Anonymous User',
        avatar_url: user.avatar_url || '',
        post_count: 0,
        comment_count: 0,
        idea_count: 1, // Just show 1 for everyone since we're just listing contributors
        total_contributions: 1
      }));
    } catch (error) {
      console.error('Error fetching top contributors:', error);
      return [];
    }
  }
};

// Client-side versions of the database service
export const ideasService = {
  // Get all ideas (optionally filtered by tag or status)
  async getIdeas(options: { tag?: string, status?: string, isPublished?: boolean } = {}) {
    let query = supabase
      .from('ideas')
      .select('*, creator:creator_id(id, display_name, avatar_url), tags');
    
    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.isPublished !== undefined) {
      query = query.eq('is_published', options.isPublished);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  // Get a single idea by ID
  async getIdea(id: string) {
    const { data, error } = await supabase
      .from('ideas')
      .select('*, creator:creator_id(id, display_name, avatar_url), tags')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get ideas created by a specific user
  async getUserIdeas(userId: string, isPublished?: boolean) {
    let query = supabase
      .from('ideas')
      .select('*, creator:creator_id(id, display_name, avatar_url), tags')
      .eq('creator_id', userId);
      
    if (isPublished !== undefined) {
      query = query.eq('is_published', isPublished);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  // Create a new idea
  async createIdea(idea: Partial<Idea>, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const { data, error } = await supabase
      .from('ideas')
      .insert([
        {
          ...idea,
          creator_id: userId,
          status: idea.status || 'draft',
          tags: idea.tags || [],
          is_published: idea.is_published || false,
          published_at: idea.is_published ? new Date().toISOString() : null
        }
      ])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update an existing idea
  async updateIdea(ideaId: string, updates: Partial<Idea>) {
    // Check if this is a publish action
    if (updates.is_published === true) {
      updates.published_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', ideaId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete an idea
  async deleteIdea(ideaId: string) {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);
      
    if (error) throw error;
    return true;
  },
  
  // Search ideas by title or description
  async searchIdeas(searchTerm: string) {
    const { data, error } = await supabase
      .from('ideas')
      .select('*, creator:creator_id(id, display_name, avatar_url), tags')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('is_published', true);
      
    if (error) throw error;
    return data;
  }
};

// Comments service for interacting with idea comments
export const commentsService = {
  // Get all comments for an idea
  async getComments(ideaId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:user_id(id, display_name, avatar_url)')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  },
  
  // Create a new comment
  async addComment(ideaId: string, content: string, userId: string, parentId?: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          idea_id: ideaId,
          user_id: userId,
          content,
          parent_id: parentId || null
        }
      ])
      .select('*, author:user_id(id, display_name, avatar_url)');
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a comment
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
      
    if (error) throw error;
    return true;
  }
};

// Checklists service for interacting with implementation checklists
export const checklistsService = {
  // Get all checklists for an idea
  async getIdeaChecklists(ideaId: string, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    // Get shared checklists
    const { data: sharedChecklists, error: sharedError } = await supabase
      .from('checklists')
      .select(`
        *,
        items:checklist_items(
          *,
          completed_by:completed_by_user_id(id, display_name, avatar_url)
        )
      `)
      .eq('idea_id', ideaId)
      .eq('is_shared', true)
      .order('created_at', { ascending: true });
      
    if (sharedError) throw sharedError;
    
    // Get personal checklists
    const { data: personalChecklists, error: personalError } = await supabase
      .from('checklists')
      .select(`
        *,
        items:checklist_items(*)
      `)
      .eq('idea_id', ideaId)
      .eq('is_shared', false)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
      
    if (personalError) throw personalError;
    
    return {
      shared: sharedChecklists,
      personal: personalChecklists
    };
  },
  
  // Create a new checklist
  async createChecklist(checklist: Partial<Checklist>, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const { data, error } = await supabase
      .from('checklists')
      .insert([
        {
          ...checklist,
          user_id: userId,
          is_shared: checklist.is_shared || false
        }
      ])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update a checklist
  async updateChecklist(checklistId: string, updates: Partial<Checklist>) {
    const { data, error } = await supabase
      .from('checklists')
      .update(updates)
      .eq('id', checklistId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a checklist
  async deleteChecklist(checklistId: string) {
    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', checklistId);
      
    if (error) throw error;
    return true;
  },
  
  // Add an item to a checklist
  async addChecklistItem(item: Partial<ChecklistItem>, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    // Get highest position number to place new item at the end
    const { data: currentItems, error: posError } = await supabase
      .from('checklist_items')
      .select('position')
      .eq('checklist_id', item.checklist_id)
      .order('position', { ascending: false })
      .limit(1);
      
    if (posError) throw posError;
    
    const nextPosition = currentItems?.length > 0 ? (currentItems[0].position + 1) : 0;
    
    const { data, error } = await supabase
      .from('checklist_items')
      .insert([
        {
          ...item,
          position: nextPosition,
          completed: false,
          completed_by_user_id: null,
          completed_at: null
        }
      ])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Mark a checklist item as complete/incomplete
  async toggleItemCompletion(itemId: string, completed: boolean, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const updates = completed 
      ? { 
          completed, 
          completed_by_user_id: userId, 
          completed_at: new Date().toISOString() 
        }
      : { 
          completed, 
          completed_by_user_id: null, 
          completed_at: null 
        };
    
    const { data, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', itemId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update a checklist item
  async updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>) {
    const { data, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', itemId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a checklist item
  async deleteChecklistItem(itemId: string) {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);
      
    if (error) throw error;
    return true;
  },
  
  // Reorder checklist items
  async reorderChecklistItems(checklistId: string, itemIds: string[]) {
    // This requires a transaction to update positions of multiple items
    // For each item ID, update its position to match its index in the array
    const updates = itemIds.map((id, index) => {
      return supabase
        .from('checklist_items')
        .update({ position: index })
        .eq('id', id);
    });
    
    // Execute all updates in parallel
    await Promise.all(updates);
    
    // Get the updated items
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('position', { ascending: true });
      
    if (error) throw error;
    return data;
  }
};

// Posts service for forum posts
export const postsService = {
  // Get all posts with optional filters
  async getPosts(options: { tag?: string, userId?: string, limit?: number, offset?: number } = {}) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        comments:post_comments(count)
      `)
      .order('created_at', { ascending: false });
      
    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }
    
    if (options.userId) {
      query = query.eq('creator_id', options.userId);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Manually format the posts with creator information since we don't have a foreign key relationship
    const formattedPosts = data.map(post => {
      return {
        ...post,
        creator: {
          id: post.creator_id,
          display_name: post.creator_name || 'Unknown User',
          avatar_url: post.creator_avatar || ''
        }
      };
    });
    
    return formattedPosts;
  },
  
  // Get a single post by id
  async getPost(id: string) {
    try {
      // First get the basic post data
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          comments:post_comments(count)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Then get the creator info separately
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .eq('id', data.creator_id)
        .single();
      
      // Construct the return object with creator info
      return {
        ...data,
        creator: userData || {
          id: data.creator_id,
          display_name: 'Unknown User',
          avatar_url: ''
        }
      };
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  },
  
  // Create a new post
  async createPost(post: Partial<Post>, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }

    try {
      // Get user details to store with the post
      let userName = 'Anonymous';
      let userAvatar = '';
      
      try {
        // Get user details from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', userId)
          .single();
          
        if (!error && userData) {
          userName = userData.display_name || 'Anonymous';
          userAvatar = userData.avatar_url || '';
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Continue with default values
      }
      
      // Create the post with creator info
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: post.title,
            content: post.content,
            description: post.description || '',
            creator_id: userId,
            creator_name: userName,
            creator_avatar: userAvatar,
            is_public: post.is_public !== false,
            upvotes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: post.tags || []
          }
        ])
        .select();
        
      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create post");
      }
      
      // Add creator info to the returned post
      const postWithCreator = {
        ...data[0],
        creator: {
          id: userId,
          display_name: userName,
          avatar_url: userAvatar
        }
      };
      
      return postWithCreator;
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  },
  
  // Update an existing post
  async updatePost(postId: string, updates: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a post
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
      
    if (error) throw error;
    return true;
  },
  
  // Get comments for a post
  async getPostComments(postId: string) {
    try {
      // First fetch the comments
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Then fetch all relevant users in one query
      const userIds = [...new Set(data.map(comment => comment.user_id))];
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', userIds);
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
      }
      
      // Map users to comments
      return data.map(comment => {
        const userData = usersData?.find(user => user.id === comment.user_id);
        return {
          ...comment,
          author: userData || {
            id: comment.user_id,
            display_name: 'Anonymous',
            avatar_url: ''
          }
        };
      });
    } catch (error) {
      console.error("Error fetching post comments:", error);
      return [];
    }
  },
  
  // Add a comment to a post
  async addPostComment(postId: string, content: string, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    try {
      // First get the user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .single();
      
      // Insert the comment without trying to select the author in the same query
      const { data, error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('*');
        
      if (error) {
        console.error("Error inserting comment:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create comment");
      }
      
      // Create the response object manually with author information
      return {
        ...data[0],
        author: {
          id: userId,
          display_name: userData?.display_name || 'Anonymous',
          avatar_url: userData?.avatar_url || ''
        }
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },
  
  // Delete a comment from a post
  async deletePostComment(commentId: string, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    try {
      // Verify the user owns this comment
      const { data: comment, error: checkError } = await supabase
        .from('post_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (checkError) {
        console.error("Error checking comment ownership:", checkError);
        throw new Error("Comment not found");
      }
      
      // Only allow deletion if user owns the comment
      if (comment.user_id !== userId) {
        throw new Error("You don't have permission to delete this comment");
      }
      
      // Delete the comment
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) {
        console.error("Error deleting comment:", error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
};

// Activity service for tracking user activity
export const activityService = {
  // Add a comment to an idea
  async addComment(ideaId: string, content: string, userId: string, parentId?: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          idea_id: ideaId,
          user_id: userId,
          content,
          parent_id: parentId || null
        }
      ])
      .select('*, author:user_id(id, display_name, avatar_url)');
      
    if (error) throw error;
    return data[0];
  },
  
  // Get recent activity for a user
  async getUserActivity(userId: string, limit = 10) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        actor:user_id(id, display_name, avatar_url),
        idea:idea_id(id, title)
      `)
      .or(`user_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  },
  
  // Get recent public activity
  async getPublicActivity(limit = 10) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        actor:user_id(id, display_name, avatar_url),
        idea:idea_id(id, title)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  },
  
  // Log an activity manually (most are logged by triggers)
  async logActivity(activity: Partial<ActivityLog>, userId: string) {
    if (!userId) {
      throw new Error("User ID not available");
    }
    
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([
        {
          ...activity,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (error) throw error;
    return data[0];
  }
};
