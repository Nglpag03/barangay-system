export type Sex = 'male' | 'female';

export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated';

export interface Resident {
  id: string; // uuid, primary key
  profile_id: string | null; // uuid, nullable — resident may not be linked to an auth account yet
  household_id: string | null; // uuid, nullable — resident may not be assigned to a household yet
  resident_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  birth_date: string; // date column, returned by Supabase as 'YYYY-MM-DD'
  birth_place: string | null;
  sex: Sex;
  civil_status: CivilStatus;
  contact_number: string | null;
  occupation: string | null;
  is_active: boolean;
  created_at: string; // timestamptz, ISO 8601 string
  updated_at: string; // timestamptz, ISO 8601 string
}