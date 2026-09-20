import { Injectable } from '@angular/core';
import { AuthChangeEvent, Session, User, createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private readonly supabaseService: SupabaseService
  ) {}

  async signIn(
    email: string,
    password: string
  ) {
    return await this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    return await this.supabaseService.client.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data, error } =
      await this.supabaseService.client.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return data.session;
  }

  async getUser(): Promise<User | null> {
    const { data, error } =
      await this.supabaseService.client.auth.getUser();

    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return data.user;
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabaseService.client.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
  }

  async getCurrentProfile() {
    const user = await this.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('id, role, full_name, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting profile:', error);
      return null;
    }

    return data;
  }

  async resetPasswordForEmail(email: string) {
    return await this.supabaseService.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  }

  async updatePassword(newPassword: string) {
    return await this.supabaseService.client.auth.updateUser({
      password: newPassword
    });
  }

  /**
   * Admin-only: creates a login account for a resident who doesn't have one yet.
   *
   * Uses a SEPARATE, temporary Supabase client (not this.supabaseService.client)
   * so that signing up the new resident does not disturb the currently logged-in
   * admin's own session. persistSession: false means this temporary client never
   * touches localStorage at all — it exists only for this one call.
   */
  async createResidentAccount(
    email: string,
    password: string,
    residentId: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> {

    const tempClient = createClient(
      environment.supabaseUrl,
      environment.supabasePublishableKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
      email,
      password
    });

    if (signUpError || !signUpData.user) {
      console.error('Error creating resident account:', signUpError);
      return { success: false, error: signUpError?.message ?? 'Account creation failed.' };
    }

    const newUserId = signUpData.user.id;

    // Confirm the email ourselves via a secure database function, rather than
    // relying on Supabase's dashboard "Confirm email" setting (which we found
    // does not reliably apply). This uses the ADMIN's real session to call a
    // security-definer function that verifies admin status before touching
    // auth.users directly.
    const { error: confirmError } = await this.supabaseService.client
      .rpc('confirm_resident_email', { target_user_id: newUserId });

    if (confirmError) {
      console.error('Error confirming resident email:', confirmError);
      // Not fatal — the account still exists, just continue. Worth noting
      // to staff that this specific account may need manual confirmation.
    }

    // Back on the ADMIN's real, still-logged-in client from here on —
    // this insert relies on the "Admins can insert profiles" RLS policy.
    const { error: profileError } = await this.supabaseService.client
      .from('profiles')
      .insert({
        id: newUserId,
        role: 'resident',
        full_name: fullName,
        is_active: true
      });

    if (profileError) {
      console.error('Error creating profile for new resident account:', profileError);
      return { success: false, error: 'Account was created but profile setup failed. Please contact support.' };
    }

    // Link the resident record to this new login.
    const { error: linkError } = await this.supabaseService.client
      .from('residents')
      .update({ profile_id: newUserId })
      .eq('id', residentId);

    if (linkError) {
      console.error('Error linking resident to new account:', linkError);
      return { success: false, error: 'Account was created but could not be linked to the resident record.' };
    }

    return { success: true };
  }
}