# Natureverse · 60-second demo script

Use the production preview for the recording:

```bash
npm run build
npm run start -- --port 3001
```

Record at 1280 × 720 or 1440 × 900. Start from a fresh page load so the opening sequence plays.

| Time | On screen | Narration / action |
| --- | --- | --- |
| 0–4s | “Waking the world” loader | “Natureverse makes ecological cause and effect visible.” |
| 4–10s | Region selection | “I begin by choosing a field site. Every site has its own species, weather, and pressures.” Select **Rainforest** and choose **Begin in Rainforest**. |
| 10–18s | Cascadian Rainforest scene | Slowly orbit the scene. “This is a living 3D model, not a static map.” |
| 18–28s | Species selection | Select a visible trout, frog, or deer. “Every animal is connected to habitat and to other species.” Close the detail panel. |
| 28–38s | Field Guide question | Ask: **Why are the fish struggling?** “The Field Guide translates the current simulation into an ecological explanation.” |
| 38–50s | Field Guide intervention | Ask: **Make it warmer**. Hold on the health indicator and the updated guide response. “A natural-language change drives the same drought model that changes the scene and species health.” |
| 50–58s | Recovery prompt | Ask: **Bring rain**. “Then I can test a recovery path and see the system respond.” |
| 58–60s | Wide scene + Field Guide | “Natureverse turns environmental systems into something you can explore, question, and understand.” |

## Recording notes

- Keep the right-hand Field Guide visible on desktop; it is the narrative anchor.
- Use one deliberate slow orbit rather than constant camera motion.
- If a selected animal is hard to click in the recording, use the **Explore** tray on mobile or select another visible species.
- The current Field Guide uses a local deterministic intent layer for reliable offline demos. Do not enter a Gemini key in the browser; the future integration belongs behind a server-side endpoint.
