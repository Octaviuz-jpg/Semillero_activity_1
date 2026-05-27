import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

export const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
})

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
