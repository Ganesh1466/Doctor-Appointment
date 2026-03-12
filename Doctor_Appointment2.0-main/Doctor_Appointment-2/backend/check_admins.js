
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, './.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdmins() {
  const { data, error } = await supabase
    .from('admins')
    .select('email, password')

  if (error) {
    console.error('Error:', error.message)
  } else {
    data.forEach(admin => {
      console.log(`Email: ${admin.email} | Password: ${admin.password}`)
    })
  }
}

checkAdmins()
