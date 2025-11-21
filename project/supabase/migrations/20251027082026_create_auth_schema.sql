/*
  # Authentication Schema Setup

  1. Overview
    This migration sets up the authentication system using Supabase's built-in auth.users table.
    No custom user tables are needed as we leverage Supabase Auth.

  2. Security
    - Supabase's auth.users table already has RLS enabled by default
    - All authentication is handled securely by Supabase Auth
    
  3. Notes
    - Email confirmation is disabled by default
    - Users can sign up with email/password
    - Session management is handled automatically by Supabase
*/

-- No tables needed - using Supabase's built-in auth.users table
-- This migration file serves as documentation of our auth approach
