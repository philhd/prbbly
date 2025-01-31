# prbbly
What are you doing?

This is a playground for getting an LLM to show you what it's doing with token outputs as you change temperature and top_p

## Setup

1. Create a .env file in the repo root with an OpenAI API key
   ``` .env
   OPENAI_API_KEY={your-API-key}
   ```
3. `npm i`
4. `npm run dev`

### Debugging the back-end
Run `npm run devslow` instead of `npm run dev`. This will run without turbopack.
