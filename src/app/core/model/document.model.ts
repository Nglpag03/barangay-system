export type DocumentStatus = 'issued' | 'revoked';

export interface ResidentDocument {
  id: string; // uuid, primary key
  resident_id: string; // uuid, references residents.id
  request_id: string | null; // uuid, references requests.id — optional link to the request that generated this document
  document_type: string; // free text, no enum constraint in the database
  document_number: string | null;
  issued_by: string | null; // uuid, admin's profile id — no enforced FK, set manually
  issued_at: string; // timestamptz, ISO 8601 string
  file_path: string | null; // path within Supabase Storage, e.g. 'resident-id/document-id/filename.pdf'
  status: DocumentStatus;
}