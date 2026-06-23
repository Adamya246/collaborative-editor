async function ask(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'cohere/north-mini-code:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error?.message || 'OpenRouter API error');
    err.status = response.status;
    throw err;
  }

  return data.choices[0].message.content;
}

async function askJSON(prompt) {
  const raw = await ask(prompt);
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

module.exports = { ask, askJSON };