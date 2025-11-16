import { callOpenAI, callGrok, callGemini } from '../src/lib/ai-clients';

describe('LLM Integration Tests', () => {
  const testPrompt = {
    systemPrompt: 'You are a helpful assistant. Keep responses brief and clear.',
    userPrompt: 'Say "Hello from [Your Name]" where [Your Name] is the name of your AI model/company.'
  };

  const testSchema = {
    name: 'SimpleResponse',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      },
      required: ['message']
    }
  };

  it('should test OpenAI API', async () => {
    console.log('\n🧪 Testing OpenAI API...');
    const startTime = Date.now();

    try {
      const result = await callOpenAI({
        ...testPrompt,
        schema: testSchema
      });

      const duration = Date.now() - startTime;

      if (result) {
        console.log(`✅ OpenAI (${result.model}): ${result.content.substring(0, 100)}...`);
        console.log(`⏱️  Response time: ${duration}ms`);
      } else {
        console.log('❌ OpenAI: No API key configured or API call failed');
      }
    } catch (error) {
      console.log(`❌ OpenAI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, 30000); // 30 second timeout

  it('should test Grok API', async () => {
    console.log('\n🧪 Testing Grok API...');
    const startTime = Date.now();

    try {
      const result = await callGrok(testPrompt);

      const duration = Date.now() - startTime;

      if (result) {
        console.log(`✅ Grok (${result.model}): ${result.content.substring(0, 100)}...`);
        console.log(`⏱️  Response time: ${duration}ms`);
      } else {
        console.log('❌ Grok: No API key configured or API call failed');
      }
    } catch (error) {
      console.log(`❌ Grok Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, 30000);

  it('should test Gemini API', async () => {
    console.log('\n🧪 Testing Gemini API...');
    const startTime = Date.now();

    try {
      const result = await callGemini(testPrompt);

      const duration = Date.now() - startTime;

      if (result) {
        console.log(`✅ Gemini (${result.model}): ${result.content.substring(0, 100)}...`);
        console.log(`⏱️  Response time: ${duration}ms`);
      } else {
        console.log('❌ Gemini: No API key configured or API call failed');
      }
    } catch (error) {
      console.log(`❌ Gemini Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, 30000);
});