import { getSupabaseClient } from '@/template';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  budget: number;
  daily_budget?: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  objective?: string;
  target_audience?: Record<string, any>;
  keywords?: string[];
  start_date?: string;
  end_date?: string;
  creative_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignData {
  name: string;
  platform: string;
  budget: number;
  daily_budget?: number;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  objective?: string;
  target_audience?: Record<string, any>;
  keywords?: string[];
  start_date?: string;
  end_date?: string;
  creative_urls?: string[];
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {}

const supabase = getSupabaseClient();

/**
 * Helper function to handle Supabase queries and provide consistent error responses.
 * @param query The Supabase query to execute.
 * @returns A promise that resolves to an object with data or an error message.
 */
async function handleSupabaseQuery<T>(query: Promise<any>): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await query;
    if (error) {
      console.error('Supabase query error:', error.message);
      return { data: null, error: error.message };
    }
    return { data: data as T, error: null };
  } catch (err) {
    console.error('Unexpected error during Supabase query:', err);
    return { data: null, error: String(err) };
  }
}

export const campaignService = {
  /**
   * Retrieves all campaigns for the authenticated user.
   * @returns A promise that resolves to an object containing a list of campaigns or an error.
   */
  async getAll(): Promise<{ data: Campaign[] | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    return handleSupabaseQuery(
      supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    );
  },

  /**
   * Retrieves a specific campaign by its ID for the authenticated user.
   * @param id The ID of the campaign to retrieve.
   * @returns A promise that resolves to an object containing the campaign data or an error.
   */
  async getById(id: string): Promise<{ data: Campaign | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    return handleSupabaseQuery(
      supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
    );
  },

  /**
   * Creates a new campaign for the authenticated user.
   * @param campaignData The data for the new campaign.
   * @returns A promise that resolves to an object containing the newly created campaign or an error.
   */
  async create(campaignData: CreateCampaignData): Promise<{ data: Campaign | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    return handleSupabaseQuery(
      supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
    );
  },

  /**
   * Updates an existing campaign for the authenticated user.
   * @param id The ID of the campaign to update.
   * @param campaignData The data to update the campaign with.
   * @returns A promise that resolves to an object containing the updated campaign or an error.
   */
  async update(id: string, campaignData: UpdateCampaignData): Promise<{ data: Campaign | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    return handleSupabaseQuery(
      supabase
        .from('campaigns')
        .update({
          ...campaignData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
    );
  },

  /**
   * Deletes a campaign for the authenticated user.
   * @param id The ID of the campaign to delete.
   * @returns A promise that resolves to an object indicating success or an error.
   */
  async delete(id: string): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    return handleSupabaseQuery(
      supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    );
  },

  /**
   * Updates the status of a campaign for the authenticated user.
   * @param id The ID of the campaign to update.
   * @param status The new status for the campaign.
   * @returns A promise that resolves to an object containing the updated campaign or an error.
   */
  async updateStatus(id: string, status: Campaign['status']): Promise<{ data: Campaign | null; error: string | null }> {
    return this.update(id, { status });
  },
};
