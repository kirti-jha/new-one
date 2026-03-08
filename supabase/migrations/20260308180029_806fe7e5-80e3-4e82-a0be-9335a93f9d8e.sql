
-- Add KYC and bank detail columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_image_path text,
  ADD COLUMN IF NOT EXISTS pan_image_path text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS bank_account_holder text;

-- Create storage bucket for user KYC document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Admins full access to user-documents
CREATE POLICY "Admins full access user-documents"
ON storage.objects FOR ALL
USING (bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'admin'));

-- RLS: Users can upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can view own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Uplines can view downline documents
CREATE POLICY "Uplines can view downline documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-documents' AND
  public.can_view_receipt(auth.uid(), (storage.foldername(name))[1])
);
