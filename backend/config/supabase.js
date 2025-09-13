import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rfzozmwjzjqdrsmdjgga.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is required')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase