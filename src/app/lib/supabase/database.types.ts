export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          last_login_at: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string
          category: string
          content: Json
          cover_alt: string
          cover_path: string | null
          created_at: string
          display_order: number
          excerpt: string
          featured: boolean
          id: string
          published_at: string | null
          reading_time: number
          seo_description: string
          seo_title: string
          slug: string
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          status: Database["public"]["Enums"]["publish_status"]
          tags: string[]
          title: string
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author?: string
          category?: string
          content?: Json
          cover_alt?: string
          cover_path?: string | null
          created_at?: string
          display_order?: number
          excerpt?: string
          featured?: boolean
          id?: string
          published_at?: string | null
          reading_time?: number
          seo_description?: string
          seo_title?: string
          slug: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          status?: Database["public"]["Enums"]["publish_status"]
          tags?: string[]
          title: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author?: string
          category?: string
          content?: Json
          cover_alt?: string
          cover_path?: string | null
          created_at?: string
          display_order?: number
          excerpt?: string
          featured?: boolean
          id?: string
          published_at?: string | null
          reading_time?: number
          seo_description?: string
          seo_title?: string
          slug?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          status?: Database["public"]["Enums"]["publish_status"]
          tags?: string[]
          title?: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          credential_id: string | null
          credential_url: string | null
          display_order: number
          featured: boolean
          id: string
          image_path: string | null
          issue_date: string | null
          issuer: string
          published: boolean
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          title: string
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          credential_id?: string | null
          credential_url?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_path?: string | null
          issue_date?: string | null
          issuer: string
          published?: boolean
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          title: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          credential_id?: string | null
          credential_url?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_path?: string | null
          issue_date?: string | null
          issuer?: string
          published?: boolean
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          title?: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          visitor_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          visitor_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "visitor_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          budget_range: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          project_type: string
          status: Database["public"]["Enums"]["message_status"]
          subject: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          budget_range: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          project_type: string
          status?: Database["public"]["Enums"]["message_status"]
          subject: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          budget_range?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          project_type?: string
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      creative_works: {
        Row: {
          after_image_path: string | null
          before_image_path: string | null
          brief: string
          category: Database["public"]["Enums"]["creative_category"]
          client: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          duration: string | null
          featured: boolean
          gallery: Json
          id: string
          role: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          tools: Json
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json | null
          updated_at: string
          updated_by: string | null
          video_url: string | null
          year: string
        }
        Insert: {
          after_image_path?: string | null
          before_image_path?: string | null
          brief: string
          category: Database["public"]["Enums"]["creative_category"]
          client?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          duration?: string | null
          featured?: boolean
          gallery?: Json
          id?: string
          role: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          tools?: Json
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          year: string
        }
        Update: {
          after_image_path?: string | null
          before_image_path?: string | null
          brief?: string
          category?: Database["public"]["Enums"]["creative_category"]
          client?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          duration?: string | null
          featured?: boolean
          gallery?: Json
          id?: string
          role?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          tools?: Json
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          year?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          experience_type: string
          id: string
          location: string
          organization: string
          period: string
          published: boolean
          related_project_id: string | null
          responsibilities: Json
          role: string
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          technologies: Json
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          experience_type: string
          id?: string
          location: string
          organization: string
          period: string
          published?: boolean
          related_project_id?: string | null
          responsibilities?: Json
          role: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          technologies?: Json
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          experience_type?: string
          id?: string
          location?: string
          organization?: string
          period?: string
          published?: boolean
          related_project_id?: string | null
          responsibilities?: Json
          role?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          technologies?: Json
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt: string | null
          bucket_id: string
          created_at: string
          created_by: string | null
          height: number | null
          id: string
          media_type: string
          mime_type: string
          name: string
          notes: string | null
          object_path: string
          public: boolean
          size_bytes: number
          updated_at: string
          updated_by: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          bucket_id: string
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          media_type: string
          mime_type: string
          name: string
          notes?: string | null
          object_path: string
          public?: boolean
          size_bytes?: number
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          bucket_id?: string
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          media_type?: string
          mime_type?: string
          name?: string
          notes?: string | null
          object_path?: string
          public?: boolean
          size_bytes?: number
          updated_at?: string
          updated_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      project_technologies: {
        Row: {
          created_at: string
          display_order: number
          project_id: string
          technology_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          project_id: string
          technology_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          project_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          architecture: string
          background: string
          category: string
          challenges: Json
          client_type: Database["public"]["Enums"]["client_type"]
          cover_path: string | null
          created_at: string
          created_by: string | null
          data_structure: string
          decisions: Json
          deployment: string
          display_order: number
          featured: boolean
          features: Json
          full_description: string
          full_name: string
          gallery: Json
          hero_path: string | null
          id: string
          live_url: string | null
          mobile_preview_path: string | null
          objectives: Json
          overview: string
          process: Json
          project_type: string
          related_project_slug: string | null
          responsibilities: Json
          result: string
          role: string
          short_description: string
          slug: string
          solution: string
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          source_url: string | null
          status: Database["public"]["Enums"]["publish_status"]
          target_users: Json
          testing: string
          title: string
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json
          updated_at: string
          updated_by: string | null
          video_url: string | null
          year: string
        }
        Insert: {
          architecture: string
          background: string
          category: string
          challenges?: Json
          client_type: Database["public"]["Enums"]["client_type"]
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          data_structure: string
          decisions?: Json
          deployment: string
          display_order?: number
          featured?: boolean
          features?: Json
          full_description: string
          full_name: string
          gallery?: Json
          hero_path?: string | null
          id?: string
          live_url?: string | null
          mobile_preview_path?: string | null
          objectives?: Json
          overview: string
          process?: Json
          project_type: string
          related_project_slug?: string | null
          responsibilities?: Json
          result: string
          role: string
          short_description: string
          slug: string
          solution: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          target_users?: Json
          testing: string
          title: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          year: string
        }
        Update: {
          architecture?: string
          background?: string
          category?: string
          challenges?: Json
          client_type?: Database["public"]["Enums"]["client_type"]
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          data_structure?: string
          decisions?: Json
          deployment?: string
          display_order?: number
          featured?: boolean
          features?: Json
          full_description?: string
          full_name?: string
          gallery?: Json
          hero_path?: string | null
          id?: string
          live_url?: string | null
          mobile_preview_path?: string | null
          objectives?: Json
          overview?: string
          process?: Json
          project_type?: string
          related_project_slug?: string | null
          responsibilities?: Json
          result?: string
          role?: string
          short_description?: string
          slug?: string
          solution?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          target_users?: Json
          testing?: string
          title?: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          video_url?: string | null
          year?: string
        }
        Relationships: []
      }
      site_profiles: {
        Row: {
          about_content: string
          availability: string
          biography: string
          created_at: string
          cv_path: string | null
          description: string
          display_name: string
          email: string
          favicon_path: string | null
          full_name: string
          github_url: string | null
          greeting: string
          headline: string
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string
          logo_path: string | null
          professional_character_path: string | null
          profile_image_path: string | null
          singleton_key: string
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          spider_character_path: string | null
          tiktok_url: string | null
          title: string
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json
          updated_at: string
          updated_by: string | null
          whatsapp: string
          youtube_url: string | null
        }
        Insert: {
          about_content: string
          availability: string
          biography: string
          created_at?: string
          cv_path?: string | null
          description: string
          display_name: string
          email: string
          favicon_path?: string | null
          full_name: string
          github_url?: string | null
          greeting: string
          headline: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location: string
          logo_path?: string | null
          professional_character_path?: string | null
          profile_image_path?: string | null
          singleton_key?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          spider_character_path?: string | null
          tiktok_url?: string | null
          title: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          whatsapp: string
          youtube_url?: string | null
        }
        Update: {
          about_content?: string
          availability?: string
          biography?: string
          created_at?: string
          cv_path?: string | null
          description?: string
          display_name?: string
          email?: string
          favicon_path?: string | null
          full_name?: string
          github_url?: string | null
          greeting?: string
          headline?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string
          logo_path?: string | null
          professional_character_path?: string | null
          profile_image_path?: string | null
          singleton_key?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          spider_character_path?: string | null
          tiktok_url?: string | null
          title?: string
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          whatsapp?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          animation_settings: Json
          comments_enabled: boolean
          contact_enabled: boolean
          copyright: string
          created_at: string
          default_mode: string
          description: string
          google_site_verification: string | null
          id: string
          keywords: string
          language: string
          navigation_settings: Json
          professional_settings: Json
          section_settings: Json
          seo_description: string
          seo_image_path: string | null
          seo_title: string
          singleton_key: string
          site_url: string
          smooth_scroll: boolean
          social_preview_path: string | null
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          spider_settings: Json
          splash_enabled: boolean
          three_enabled: boolean
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json
          updated_at: string
          updated_by: string | null
          website_name: string
        }
        Insert: {
          animation_settings?: Json
          comments_enabled?: boolean
          contact_enabled?: boolean
          copyright: string
          created_at?: string
          default_mode?: string
          description: string
          google_site_verification?: string | null
          id?: string
          keywords: string
          language?: string
          navigation_settings?: Json
          professional_settings?: Json
          section_settings?: Json
          seo_description: string
          seo_image_path?: string | null
          seo_title: string
          singleton_key?: string
          site_url?: string
          smooth_scroll?: boolean
          social_preview_path?: string | null
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          spider_settings?: Json
          splash_enabled?: boolean
          three_enabled?: boolean
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          website_name: string
        }
        Update: {
          animation_settings?: Json
          comments_enabled?: boolean
          contact_enabled?: boolean
          copyright?: string
          created_at?: string
          default_mode?: string
          description?: string
          google_site_verification?: string | null
          id?: string
          keywords?: string
          language?: string
          navigation_settings?: Json
          professional_settings?: Json
          section_settings?: Json
          seo_description?: string
          seo_image_path?: string | null
          seo_title?: string
          singleton_key?: string
          site_url?: string
          smooth_scroll?: boolean
          social_preview_path?: string | null
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          spider_settings?: Json
          splash_enabled?: boolean
          three_enabled?: boolean
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          website_name?: string
        }
        Relationships: []
      }
      submission_rate_limits: {
        Row: {
          action: string
          attempts: number
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          attempts?: number
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          attempts?: number
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      technologies: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["technology_category"]
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          featured: boolean
          icon_key: string
          id: string
          level: Database["public"]["Enums"]["technology_level"]
          logo_path: string | null
          name: string
          source_language:
            | Database["public"]["Enums"]["content_language"]
            | null
          translation_error: string | null
          translation_source_hash: string | null
          translation_status: Database["public"]["Enums"]["translation_state"]
          translation_updated_at: string | null
          translation_version: number
          translations: Json
          updated_at: string
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["technology_category"]
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          featured?: boolean
          icon_key: string
          id?: string
          level: Database["public"]["Enums"]["technology_level"]
          logo_path?: string | null
          name: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["technology_category"]
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          featured?: boolean
          icon_key?: string
          id?: string
          level?: Database["public"]["Enums"]["technology_level"]
          logo_path?: string | null
          name?: string
          source_language?:
            | Database["public"]["Enums"]["content_language"]
            | null
          translation_error?: string | null
          translation_source_hash?: string | null
          translation_status?: Database["public"]["Enums"]["translation_state"]
          translation_updated_at?: string | null
          translation_version?: number
          translations?: Json
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      translation_jobs: {
        Row: {
          attempts: number
          available_at: string
          completed_at: string | null
          created_at: string
          entity_id: string
          entity_type: string
          entity_version: number
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          source_hash: string
          source_payload: Json
          status: Database["public"]["Enums"]["translation_job_state"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          available_at?: string
          completed_at?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          entity_version: number
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          source_hash: string
          source_payload: Json
          status?: Database["public"]["Enums"]["translation_job_state"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          available_at?: string
          completed_at?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          entity_version?: number
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          source_hash?: string
          source_payload?: Json
          status?: Database["public"]["Enums"]["translation_job_state"]
          updated_at?: string
        }
        Relationships: []
      }
      visitor_comment_contacts: {
        Row: {
          comment_id: string
          created_at: string
          email: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          email: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          email?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_comment_contacts_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: true
            referencedRelation: "visitor_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_comments: {
        Row: {
          admin_reply: string | null
          approved_at: string | null
          approved_by: string | null
          avatar: string | null
          created_at: string
          id: string
          likes_count: number
          message: string
          name: string
          parent_comment_id: string | null
          pinned: boolean
          status: Database["public"]["Enums"]["comment_status"]
          updated_at: string
        }
        Insert: {
          admin_reply?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          message: string
          name: string
          parent_comment_id?: string | null
          pinned?: boolean
          status?: Database["public"]["Enums"]["comment_status"]
          updated_at?: string
        }
        Update: {
          admin_reply?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          message?: string
          name?: string
          parent_comment_id?: string | null
          pinned?: boolean
          status?: Database["public"]["Enums"]["comment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "visitor_comments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_translation_jobs: {
        Args: { p_limit?: number }
        Returns: {
          attempts: number
          available_at: string
          completed_at: string | null
          created_at: string
          entity_id: string
          entity_type: string
          entity_version: number
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          source_hash: string
          source_payload: Json
          status: Database["public"]["Enums"]["translation_job_state"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "translation_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_active_admin: { Args: never; Returns: boolean }
      is_portfolio_admin: { Args: never; Returns: boolean }
      is_portfolio_owner: { Args: never; Returns: boolean }
      portfolio_admin_role: { Args: never; Returns: string }
      portfolio_translation_hash: { Args: { p_payload: Json }; Returns: string }
      portfolio_translation_payload: {
        Args: { p_entity_type: string; p_row: Json }
        Returns: Json
      }
      public_approved_comments: {
        Args: never
        Returns: {
          admin_reply: string
          avatar: string
          created_at: string
          id: string
          likes_count: number
          message: string
          name: string
          pinned: boolean
        }[]
      }
      public_like_comment: {
        Args: { target_comment_id: string; target_visitor_id: string }
        Returns: number
      }
      touch_admin_login: { Args: never; Returns: undefined }
    }
    Enums: {
      admin_role: "owner" | "admin" | "editor"
      client_type: "Academic Project" | "Client Work" | "Personal Project"
      comment_status: "pending" | "approved" | "hidden"
      content_language: "id" | "en"
      creative_category:
        | "UI/UX Design"
        | "Graphic Design"
        | "Photography"
        | "Videography"
        | "Photo Editing"
        | "Video Editing"
      message_status: "New" | "Read" | "Replied" | "Archived"
      publish_status: "draft" | "published" | "archived"
      technology_category:
        | "Frontend"
        | "Backend"
        | "Database"
        | "Deployment"
        | "Creative"
      technology_level:
        | "Main Stack"
        | "Frequently Used"
        | "Familiar"
        | "Currently Learning"
      translation_job_state:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "stale"
      translation_state: "pending" | "processing" | "ready" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["owner", "admin", "editor"],
      client_type: ["Academic Project", "Client Work", "Personal Project"],
      comment_status: ["pending", "approved", "hidden"],
      content_language: ["id", "en"],
      creative_category: [
        "UI/UX Design",
        "Graphic Design",
        "Photography",
        "Videography",
        "Photo Editing",
        "Video Editing",
      ],
      message_status: ["New", "Read", "Replied", "Archived"],
      publish_status: ["draft", "published", "archived"],
      technology_category: [
        "Frontend",
        "Backend",
        "Database",
        "Deployment",
        "Creative",
      ],
      technology_level: [
        "Main Stack",
        "Frequently Used",
        "Familiar",
        "Currently Learning",
      ],
      translation_job_state: [
        "pending",
        "processing",
        "completed",
        "failed",
        "stale",
      ],
      translation_state: ["pending", "processing", "ready", "failed"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
