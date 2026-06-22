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
        if (text.length > 1600) return new Response("Text too long", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice: body.voice || "sage",
            speed: 0.96,
            instructions:
              "Voice: a calm, warm, lower-register man in his early thirties — soft, intimate, almost a whisper-close mic feel. Tone: thoughtful, grounded, audience-friendly; speaks like a researcher quietly sharing his world with a friend. Pacing: relaxed and unhurried, gentle pauses at commas and full stops; never rushed, never theatrical. Diction: clean, smooth, rounded — no hard consonants, no breathy whisper, no robotic monotone. Mood: cinematic warmth, confidence without performance. Imagine narrating a documentary about a forest at dawn.",
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
