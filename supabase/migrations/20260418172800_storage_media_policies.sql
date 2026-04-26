CREATE POLICY "authenticated_upload_media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "authenticated_read_media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "public_read_media" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'media');

CREATE POLICY "authenticated_delete_media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');
