/**
 * Cliente de Supabase con service_role key.
 * Uso: operaciones que requieran saltar RLS (storage, auth admin, etc.)
 * La capa de datos principal usa Prisma (src/db/prisma.js).
 *
 * IMPORTANTE: La service_role key NUNCA debe exponerse al frontend.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[supabaseClient] SUPABASE_URL o SUPABASE_SECRET_KEY no configuradas. ' +
    'El cliente de Supabase no estara disponible.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseServiceRoleKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
