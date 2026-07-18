export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, {
      Row: Record<string, unknown>;
      Insert: Record<string, unknown>;
      Update: Record<string, unknown>;
      Relationships: [];
    }>;
    Views: Record<string, never>;
    Functions: {
      public_approved_comments: {
        Args: Record<PropertyKey, never>;
        Returns: Array<{
          id: string;
          name: string;
          avatar: string | null;
          message: string;
          likes_count: number;
          admin_reply: string | null;
          pinned: boolean;
          created_at: string;
        }>;
      };
    };
    Enums: {
      publish_status: "draft" | "published" | "archived";
      admin_role: "owner" | "admin" | "editor";
      technology_category: "Frontend" | "Backend" | "Database" | "Deployment" | "Creative";
      technology_level: "Main Stack" | "Frequently Used" | "Familiar" | "Currently Learning";
      creative_category: "UI/UX Design" | "Graphic Design" | "Photography" | "Videography" | "Photo Editing" | "Video Editing";
      comment_status: "pending" | "approved" | "hidden";
      message_status: "New" | "Read" | "Replied" | "Archived";
      client_type: "Academic Project" | "Client Work" | "Personal Project";
    };
    CompositeTypes: Record<string, never>;
  };
  storage: {
    Tables: Record<string, {
      Row: Record<string, unknown>;
      Insert: Record<string, unknown>;
      Update: Record<string, unknown>;
      Relationships: [];
    }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
