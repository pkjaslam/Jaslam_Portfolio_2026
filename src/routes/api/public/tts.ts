import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI not configured", { status: 500 });

        let body: { text?: string; voice?: string };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const text = (body.text || "").trim();
        if (!text) return new Response("Missing text", { status: 400 });
        if (text.length > 1200) return new Response("Text too long", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice: body.voice || "ash",
            speed: 1.08,
            instructions:
              "Voice: a calm, warm, intelligent man in his early thirties with a soft, neutral Indian-English accent — articulate, gentle, and grounded. Tone: thoughtful and personal, like a researcher quietly sharing his world. Slightly lower register; never theatrical. Pacing: natural and conversational, flowing smoothly with light pauses at commas, never dragging. Diction: clean, crisp consonants and steady cadence. Mood: cinematic but human — confidence without performance, warmth without sweetness. Avoid robotic monotone, breathy whispers, and over-dramatic narration.",
            response_format: "mp3",
            stream_format: "audio",
          }),
        });

        if (!upstream.ok) {
          const msg = await upstream.text().catch(() => "");
          return new Response(`TTS failed: ${msg}`, { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
