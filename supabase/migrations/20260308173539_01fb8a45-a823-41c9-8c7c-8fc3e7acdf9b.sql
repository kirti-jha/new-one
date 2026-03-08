-- KYC documents table
CREATE TABLE public.kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can view own docs
CREATE POLICY "Users can view own kyc_documents"
  ON public.kyc_documents FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert own docs
CREATE POLICY "Users can insert own kyc_documents"
  ON public.kyc_documents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins full access kyc_documents"
  ON public.kyc_documents FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Uplines can view downline docs
CREATE POLICY "Uplines can view downline kyc_documents"
  ON public.kyc_documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = kyc_documents.user_id
    AND is_ancestor_of(auth.uid(), p.id)
  ));

CREATE TRIGGER set_kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for KYC docs
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage RLS: users can upload to their own folder
CREATE POLICY "Users can upload own kyc docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can view own kyc docs
CREATE POLICY "Users can view own kyc storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can view all kyc docs
CREATE POLICY "Admins can view all kyc storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'));

-- Admins can delete kyc docs
CREATE POLICY "Admins can delete kyc storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'));