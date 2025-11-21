/*
  # Create Voucher Sheets Schema

  1. New Tables
    - `voucher_sheets`
      - `id` (uuid, primary key) - Unique identifier for each sheet
      - `user_id` (uuid, foreign key) - Reference to auth.users
      - `name` (text) - Name of the voucher sheet
      - `data` (jsonb) - Spreadsheet data stored as JSON
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `voucher_sheets` table
    - Add policy for users to read their own sheets
    - Add policy for users to insert their own sheets
    - Add policy for users to update their own sheets
    - Add policy for users to delete their own sheets

  3. Notes
    - Data is stored as JSONB for flexibility with spreadsheet structure
    - Each user can have multiple voucher sheets
    - Timestamps track creation and modification
*/

CREATE TABLE IF NOT EXISTS voucher_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Sheet',
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE voucher_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own voucher sheets"
  ON voucher_sheets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voucher sheets"
  ON voucher_sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voucher sheets"
  ON voucher_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voucher sheets"
  ON voucher_sheets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_voucher_sheets_user_id ON voucher_sheets(user_id);
