import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.TOGETHER_AI_KEY;
    if (!apiKey) {
      console.error("API Key is missing!");
      return NextResponse.json(
        { error: "Server Error: API key is missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.1",
          messages: [{ role: "user", content: message }],
          max_tokens: 100,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Together AI API Error:", errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse =
      data.choices[0]?.message?.content.trim() ||
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({ message: aiResponse }, { status: 200 });
  } catch (error) {
    console.error("Together AI API Error:", error);
    return NextResponse.json(
      { message: `Error fetching AI response: ${error}` },
      { status: 500 }
    );
  }
}
