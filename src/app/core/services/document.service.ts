import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ResidentService } from './resident.service';
import { ResidentDocument } from '../model/document.model';

const BUCKET_NAME = 'documents';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService,
    private readonly residentService: ResidentService
  ) {}

  /**
   * Admin-only: uploads a file to Storage under {residentId}/{randomId}/{filename},
   * then creates the matching metadata row in the documents table.
   */
  async uploadDocumentForResident(
    residentId: string,
    file: File,
    documentType: string,
    documentNumber: string | null,
    requestId: string | null
  ): Promise<ResidentDocument | null> {
    const user = await this.authService.getUser();

    // Create the metadata row first so we have an id to use in the file path
    const { data: created, error: insertError } = await this.supabaseService.client
      .from('documents')
      .insert({
        resident_id: residentId,
        request_id: requestId,
        document_type: documentType,
        document_number: documentNumber,
        issued_by: user?.id ?? null,
        file_path: null,
        status: 'issued'
      })
      .select()
      .maybeSingle();

    if (insertError || !created) {
      console.error('Error creating document record:', insertError);
      return null;
    }

    const filePath = `${residentId}/${created.id}/${file.name}`;

    const { error: uploadError } = await this.supabaseService.client
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return created as ResidentDocument;
    }

    const { data: updated, error: updateError } = await this.supabaseService.client
      .from('documents')
      .update({ file_path: filePath })
      .eq('id', created.id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error saving file path:', updateError);
      return created as ResidentDocument;
    }

    return updated as ResidentDocument;
  }

  async getMyDocuments(): Promise<ResidentDocument[]> {
    const resident = await this.residentService.getMyResidentRecord();

    if (!resident) {
      return [];
    }

    const { data, error } = await this.supabaseService.client
      .from('documents')
      .select('*')
      .eq('resident_id', resident.id)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Error fetching my documents:', error);
      return [];
    }

    return data as ResidentDocument[];
  }

  async getAllDocuments(): Promise<ResidentDocument[]> {
    const { data, error } = await this.supabaseService.client
      .from('documents')
      .select('*')
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Error fetching all documents:', error);
      return [];
    }

    return data as ResidentDocument[];
  }

  /**
   * Generates a temporary signed URL to view/download a private file.
   * Expires after the given number of seconds (default 60).
   */
  async getDocumentDownloadUrl(filePath: string, expiresInSeconds = 60): Promise<string | null> {
    const { data, error } = await this.supabaseService.client
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }
}