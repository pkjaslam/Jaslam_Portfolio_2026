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
            voice: body.voice || "ash",
            speed: 0.94,
            instructions:
              "Voice: a calm, warm, lower-register man in his early thirties — soft, intimate, close-mic feel. Tone reference: friendly JP-style portfolio welcome, natural South Asian English warmth, relaxed and real, as if personally saying thank you for visiting. Pacing: unhurried but conversational, gentle pauses, smooth rounded diction, never theatrical or announcer-like. Mood: cinematic warmth, quiet confidence, and genuine excitement about AI, machine learning, forestry, projects, and publications.",
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
