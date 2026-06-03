export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("Full Anthropic response:", JSON.stringify(data));

    if (data.type === "error") {
      return res.status(200).json({ 
        error: data.error?.message || "Anthropic error", 
        raw: JSON.stringify(data) 
      });
    }

    let text = "";
    if (data.content && Array.isArray(data.content)) {
      const textBlock = data.content.find(b => b.type === "text");
      if (textBlock) text = textBlock.text;
    }

    if (!text) {
      return res.status(200).json({ 
        error: "No text in response", 
        raw: JSON.stringify(data) 
      });
    }

    res.status(200).json({ text });
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
