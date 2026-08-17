import { Injectable } from '@angular/core';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

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

  console.log('AUTH USER:', user);
  console.log('AUTH USER ID:', user?.id);

  if (!user) {
    console.error('No authenticated user found.');
    return null;
  }

  const { data, error } = await this.supabaseService.client
    .from('profiles')
    .select('id, role, full_name, is_active')
    .eq('id', user.id)
    .maybeSingle();

  console.log('PROFILE QUERY DATA:', data);
  console.log('PROFILE QUERY ERROR:', error);

  if (error) {
    console.error('Error getting profile:', error);
    return null;
  }

  return data;
}
}