export interface Household {
  id: string; // uuid, primary key
  household_number: string;
  house_number: string | null;
  street: string | null;
  purok: string; // small administrative subdivision within a barangay
  barangay: string;
  municipality: string;
  province: string;
  created_at: string; // timestamptz, ISO 8601 string
  updated_at: string; // timestamptz, ISO 8601 string
}