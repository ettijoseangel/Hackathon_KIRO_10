import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
    port: process.env.PORT || 3001,
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    env: process.env.NODE_ENV || 'development',
    db: {
        databaseUrl: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL
    },
    supabase: {
        url: process.env.SUPABASE_URL,
        secretKey: process.env.SUPABASE_SECRET_KEY
    },
    ia: {
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY
    },
    docs: {
        urlDocs: process.env.DOCS_URL || `http://localhost:${process.env.PORT || 3001}/api/docs`,
        apiEndpoint: process.env.API_ENDPOINT || `http://localhost:${process.env.PORT || 3001}`
    }
}
