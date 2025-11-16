import { callOpenAI, callGrok, callGemini } from '../src/lib/ai-clients';

describe('AI API Key Fallback Mechanism', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a clean copy of process.env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv;
  });

  describe('OpenAI API Key', () => {
    it('should use OPENAI_API_KEY when available', async () => {
      process.env.OPENAI_API_KEY = 'openai-key';
      process.env.CHATGPT_API_KEY = 'chatgpt-key';

      // Mock fetch to avoid actual API calls
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '{"test": "response"}' } }]
          })
        })
      ) as jest.Mock;

      const result = await callOpenAI({
        systemPrompt: 'test',
        userPrompt: 'test',
        schema: { name: 'test', schema: {} }
      });

      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer openai-key'
          })
        })
      );
    });

    it('should fallback to CHATGPT_API_KEY when OPENAI_API_KEY is not set', async () => {
      process.env.OPENAI_API_KEY = '';
      process.env.CHATGPT_API_KEY = 'chatgpt-key';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '{"test": "response"}' } }]
          })
        })
      ) as jest.Mock;

      const result = await callOpenAI({
        systemPrompt: 'test',
        userPrompt: 'test',
        schema: { name: 'test', schema: {} }
      });

      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer chatgpt-key'
          })
        })
      );
    });

    it('should return null when neither API key is available', async () => {
      process.env.OPENAI_API_KEY = '';
      process.env.CHATGPT_API_KEY = '';

      const result = await callOpenAI({
        systemPrompt: 'test',
        userPrompt: 'test',
        schema: { name: 'test', schema: {} }
      });

      expect(result).toBeNull();
    });
  });

  describe('Grok API Key', () => {
    it('should use GROK_API_KEY when available', async () => {
      process.env.GROK_API_KEY = 'grok-key';
      process.env.XAI_API_KEY = 'xai-key';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'test response' } }]
          })
        })
      ) as jest.Mock;

      const result = await callGrok({
        systemPrompt: 'test',
        userPrompt: 'test'
      });

      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer grok-key'
          })
        })
      );
    });

    it('should fallback to XAI_API_KEY when GROK_API_KEY is not set', async () => {
      process.env.GROK_API_KEY = '';
      process.env.XAI_API_KEY = 'xai-key';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'test response' } }]
          })
        })
      ) as jest.Mock;

      const result = await callGrok({
        systemPrompt: 'test',
        userPrompt: 'test'
      });

      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer xai-key'
          })
        })
      );
    });

    it('should return null when neither API key is available', async () => {
      process.env.GROK_API_KEY = '';
      process.env.XAI_API_KEY = '';

      const result = await callGrok({
        systemPrompt: 'test',
        userPrompt: 'test'
      });

      expect(result).toBeNull();
    });
  });

  describe('Gemini API Key', () => {
    it('should use GEMINI_API_KEY when available', async () => {
      process.env.GEMINI_API_KEY = 'gemini-key';
      process.env.GOOGLE_AI_API_KEY = 'google-key';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'test response' }] } }]
          })
        })
      ) as jest.Mock;

      const result = await callGemini({
        systemPrompt: 'test',
        userPrompt: 'test'
      });

      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-key'),
        expect.any(Object)
      );
    });

    it('should fallback to GOOGLE_AI_API_KEY when GEMINI_API_KEY is not set', async () => {
      process.env.GEMINI_API_KEY = '';
      process.env.GOOGLE_AI_API_KEY = 'google-key';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'test response' }] } }]
          })
        })
      ) as jest.Mock;

      const result = await callGemini({
        systemPrompt: 'test',
        userPrompt: 'test'
      });

      expect(result).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('google-key'),
        expect.any(Object)
      );
    });

    it('should return null when neither API key is available', async () => {
      process.env.GEMINI_API_KEY = '';
      process.env.GOOGLE_AI_API_KEY = '';

      const result = await callGemini({
        systemPrompt: 'test',
        userPrompt: 'test'
      });

      expect(result).toBeNull();
    });
  });
});