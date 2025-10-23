import { getSupabaseClient } from '@/template';

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  user_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  roas: number;
  date: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalCost: number;
  avgCTR: number;
  avgROAS: number;
}

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

export const analyticsService = {
  /**
   * Retrieves analytics data for a specific campaign for the authenticated user.
   * @param campaignId The ID of the campaign to retrieve analytics for.
   * @returns A promise that resolves to an object containing a list of campaign analytics or an error.
   */
  async getByCampaign(campaignId: string): Promise<{ data: CampaignAnalytics[] | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    return handleSupabaseQuery(
      supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
    );
  },

  /**
   * Retrieves a summary of all analytics data for the authenticated user.
   * @returns A promise that resolves to an object containing the analytics summary or an error.
   */
  async getSummary(): Promise<{ data: AnalyticsSummary | null; error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data: analytics, error } = await handleSupabaseQuery<CampaignAnalytics[]>(
      supabase
        .from('campaign_analytics')
        .select('*')
        .eq('user_id', user.id)
    );

    if (error) {
      return { data: null, error };
    }

    if (!analytics || analytics.length === 0) {
      return {
        data: {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalCost: 0,
          avgCTR: 0,
          avgROAS: 0,
        },
        error: null,
      };
    }

    const summary: AnalyticsSummary = {
      totalImpressions: analytics.reduce((sum, a) => sum + Number(a.impressions), 0),
      totalClicks: analytics.reduce((sum, a) => sum + Number(a.clicks), 0),
      totalConversions: analytics.reduce((sum, a) => sum + Number(a.conversions), 0),
      totalCost: analytics.reduce((sum, a) => sum + Number(a.cost), 0),
      avgCTR: analytics.reduce((sum, a) => sum + Number(a.ctr), 0) / analytics.length,
      avgROAS: analytics.reduce((sum, a) => sum + Number(a.roas), 0) / analytics.length,
    };

    return { data: summary, error: null };
  },

  /**
   * Creates mock analytics data for a given campaign for the authenticated user.
   * This function is typically used for development or testing purposes.
   * @param campaignId The ID of the campaign to generate mock data for.
   * @returns A promise that resolves to an object indicating success or an error.
   */
  async createMockData(campaignId: string): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const mockData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const impressions = Math.floor(Math.random() * 10000) + 5000;
      const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.02));
      const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.05));
      const cost = Number((clicks * (Math.random() * 2 + 0.5)).toFixed(2));
      const ctr = Number(((clicks / impressions) * 100).toFixed(2));
      const roas = conversions > 0 ? Number(((conversions * 50) / cost).toFixed(2)) : 0;

      mockData.push({
        campaign_id: campaignId,
        user_id: user.id,
        impressions,
        clicks,
        conversions,
        cost,
        ctr,
        roas,
        date: date.toISOString().split('T')[0],
      });
    }

    return handleSupabaseQuery(
      supabase
        .from('campaign_analytics')
        .insert(mockData)
    );
  },
};
