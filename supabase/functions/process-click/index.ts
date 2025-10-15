import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClickRequest {
  clickX?: number;
  clickY?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile with current energy and stats
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('energy, stars, daily_clicks, total_clicks, level')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has enough energy
    if (profile.energy < 1) {
      return new Response(
        JSON.stringify({ error: 'Not enough energy', profile }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch shop upgrades to calculate click value
    const { data: shopPurchases } = await supabaseClient
      .from('shop_purchases')
      .select('item_id, level')
      .eq('user_id', user.id);

    // Calculate click value based on upgrades
    let clickValue = 1;
    const multitapUpgrade = shopPurchases?.find(p => p.item_id === 'multitap');
    if (multitapUpgrade) {
      clickValue = multitapUpgrade.level;
    }

    // Calculate new values
    const newStars = profile.stars + clickValue;
    const newEnergy = profile.energy - 1;
    const newDailyClicks = profile.daily_clicks + 1;
    const newTotalClicks = profile.total_clicks + 1;

    // Update profile with new values
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        stars: newStars,
        energy: newEnergy,
        daily_clicks: newDailyClicks,
        total_clicks: newTotalClicks
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update leaderboard
    const today = new Date().toISOString().split('T')[0];
    const { error: leaderboardError } = await supabaseClient
      .from('daily_leaderboard')
      .upsert({
        user_id: user.id,
        clicks_count: newDailyClicks,
        date: today
      }, {
        onConflict: 'user_id,date'
      });

    if (leaderboardError) {
      console.error('Leaderboard update error:', leaderboardError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        clickValue,
        profile: updatedProfile
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-click:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});