# Natureverse · 60-second demo script

Use the production preview for the recording:

```bash
npm run build
npm run start -- --port 3001
```

Record at 1280 × 720 or 1440 × 900. Start from a fresh page load so the opening sequence plays.

| Time | On screen | Narration / action |
| --- | --- | --- |
| 0–4s | Natureverse logo wall opens | “Natureverse makes ecological cause and effect visible.” |
| 4–10s | Interactive Earth model | “I begin by choosing a place on the Earth itself. Every numbered beacon is a distinct field site with its own species, weather, and pressures.” Select **Rainforest** and choose **Enter Rainforest**. |
| 10–18s | Cascadian Rainforest scene | Slowly orbit the scene. “This is a living 3D model, not a static map.” |
| 18–28s | Species selection | Select a visible trout, frog, or deer. “Every animal is connected to habitat and to other species.” Close the detail panel. |
| 28–38s | Field Guide question | Press the **Field Guide** side tool and ask: **Why are the fish struggling?** “The guide is there when I want conversation, not in the way when I want to explore.” |
| 38–48s | Field Guide intervention | Ask: **Make it warmer**. Hold on the health indicator and the updated guide response. “A natural-language change drives the same drought model that changes the scene and species health.” |
| 48–56s | Manual conditions | Switch to **Conditions**, lower rainfall, then raise it again. “The same model is also available as a direct, legible environmental control.” |
| 56–60s | Wide scene | “Natureverse turns environmental systems into something you can explore, question, and understand.” |

## Recording notes

- Keep the Field Guide closed until its moment in the narration; the clear scene is the first visual anchor.
- Use one deliberate slow orbit rather than constant camera motion.
- If a selected animal is hard to click in the recording, use the **Explore** tray on mobile or select another visible species.
- The current Field Guide uses a local deterministic intent layer for reliable offline demos. Do not enter a Gemini key in the browser; the future integration belongs behind a server-side endpoint.
