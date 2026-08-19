export interface AuditLog {
  id: string; // uuid, primary key
  user_id: string | null; // uuid, the admin who performed the action
  action: string; // free text, e.g. 'created', 'updated', 'status_changed'
  entity_type: string | null; // free text, e.g. 'resident', 'household', 'request', 'document'
  entity_id: string | null; // uuid of the affected row — no enforced FK since it can point to different tables
  metadata: Record<string, any> | null; // jsonb — arbitrary extra detail about what changed
  created_at: string; // timestamptz, ISO 8601 string
}