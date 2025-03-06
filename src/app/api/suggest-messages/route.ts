import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const response = await fetch(
      "https://api.deepinfra.com/v1/openai/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.1",
          prompt:
            "Generate exactly three engaging and thought-provoking questions for an anonymous social messaging platform. The questions should be open-ended, encourage curiosity, and be suitable for a diverse audience. Avoid personal, sensitive, or controversial topics. Instead, focus on fun, creative, and universally relatable themes. Format the questions as a single string, separated by '||'. Do not include numbering or quotes. Ensure you provide exactly three questions, each no longer than 50 characters.",
          max_tokens: 100,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepInfra API Error:", errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiMessage = data.choices[0]?.text?.trim() || "";

    aiMessage = aiMessage.replace(/^\d+\.\s*/gm, "").replace(/["']/g, "");

    let questions = aiMessage.split("||").map((q: string) => q.trim());

    questions = questions.map((q: string) =>
      q.length > 70 ? q.substring(0, 67) + "..." : q
    );

    while (questions.length < 3) {
      questions.push("What's a fun fact you recently learned?");
    }
    questions = questions.slice(0, 3);

    return NextResponse.json(
      { message: questions.join("||") },
      { status: 200 }
    );
  } catch (error) {
    console.error("DeepInfra API Error:", error);
    return NextResponse.json(
      { message: `Error fetching AI response: ${error}` },
      { status: 500 }
    );
  }
}
