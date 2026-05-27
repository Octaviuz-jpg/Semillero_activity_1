import { supabase } from './lib/supabase'
import bcrypt from 'bcryptjs'

async function setup() {
  const hash = await bcrypt.hash('admin123', 10)

  const { data, error } = await supabase
    .from('users')
    .upsert({
      email: 'admin@soporte.com',
      username: 'admin',
      password_hash: hash,
      role: 'admin',
      name: 'Admin Principal',
    }, { onConflict: 'email' })
    .select()
    .single()

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log('Admin user ready:', data.email, '- Password: admin123')

  const { data: agentData, error: agentError } = await supabase
    .from('users')
    .upsert({
      email: 'agente@soporte.com',
      username: 'agente1',
      password_hash: await bcrypt.hash('agente123', 10),
      role: 'agent',
      name: 'Agente Uno',
    }, { onConflict: 'email' })
    .select()
    .single()

  if (agentError) {
    console.error('Error creating agent:', agentError.message)
    return
  }

  console.log('Agent user ready:', agentData.email, '- Password: agente123')
}

setup()
