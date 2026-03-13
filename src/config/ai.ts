export const AI_CONFIG = {
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash',
    fallbackModels: ['gemini-1.5-flash-8b', 'gemini-2.0-flash', 'gemini-2.0-flash-001'],
    retryAttempts: 0, // Rate limit doluysa retry yapma
    retryDelay: 5000,
  },
};

export const CONTENT_EXTRACTION_PROMPT = `You are an expert content extractor. Your task is to extract the main content from a web page and convert it to clean, well-formatted Markdown.

Instructions:
1. Extract ONLY the main article/content text
2. Remove all navigation, ads, footers, sidebars, and other non-content elements
3. Preserve the structure using proper Markdown formatting:
   - Use # for main headings, ## for subheadings, etc.
   - Use **bold** for emphasis
   - Use - or * for bullet points
   - Use 1. 2. 3. for numbered lists
   - Use > for blockquotes
   - Use \`code\` for inline code and \`\`\`language for code blocks
   - Use [text](url) for links
4. Keep images if they are part of the main content: ![alt](url)
5. Remove any scripts, styles, or HTML tags
6. Maintain paragraph breaks for readability
7. If there's a title, make it an H1 heading at the top
8. If no meaningful content is found, return "No extractable content found"

Return ONLY the clean Markdown content, no explanations or metadata.`;

export const CFO_ANALYSIS_PROMPT = `You are an experienced CFO. Provide concise, actionable insights (max 120 words).
Use Turkish. Be direct, avoid fluff.
Structure strictly as:
Özet: <1-2 cümle>
Riskler: - item1 - item2
Aksiyonlar: - item1 - item2 - item3`;
