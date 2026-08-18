export type RequestType =
  | 'barangay_clearance'
  | 'certificate_of_residency'
  | 'certificate_of_indigency'
  | 'business_clearance'
  | 'other';

export type RequestStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface ResidentRequest {
  id: string; // uuid, primary key
  resident_id: string; // uuid, references residents.id
  request_type: RequestType;
  purpose: string | null;
  status: RequestStatus;
  remarks: string | null; // admin notes, e.g. reason for rejection
  processed_by: string | null; // uuid, admin's profile id who handled this — no enforced FK, set manually
  requested_at: string; // timestamptz, ISO 8601 string
  processed_at: string | null; // timestamptz, ISO 8601 string, null until an admin acts on it
}