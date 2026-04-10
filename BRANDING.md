**Winzee — Brand Guidelines (Practical Branding Document for Designers & Developers)**

---

## 1) Brand Overview
**Brand name:** Winzee  
**Brand promise:** *Play with optimism. Win with style.*  
**Emotional goals:** excitement, optimism, approachability, instant delight.  
**Primary use cases:** lottery app & website, marketing campaigns, social posts, app store listing, merchandising.

---

## 2) Logo System
- **Primary mark (full logo):** Color wordmark "Winzee" with lightning-bolt “i”, surrounded by dynamic swoosh arcs. Use on white or very dark backgrounds where color shows clearly.  
- **Wordmark (no swoosh):** Horizontal wordmark for header bars and tight horizontal layouts.  
- **Icon / App mark:** Simplified lightning-bolt + star inside a rounded square — optimized for avatars, favicons, app icons.  
- **Monochrome lockups:** Single-color black or white versions for embossing, single-color printing, or constrained contrast needs.  
- **Clearspace:** Maintain minimum clearspace equal to the height of the letter “W” on all sides of the primary mark. No other logos, copy, or UI elements should intrude into that area.  
- **Minimum sizes:**  
  - Wordmark (print/web) — min width 120 px.  
  - Icon/app mark — min 48 px square for UI; use 180–512 px PNG/SVG for App Store/Play Store export.  
- **Incorrect usage (DON’T):** distort/warp logo; recolor letters individually (except approved palette); remove lightning bolt; rotate; place on busy backgrounds without a protective container.

---

## 3) Color Palette (with suggested hex & usage)
Primary energetic triad modeled from the provided logo:

- **Purple (Primary)** — #7A2EFF  
  - Use for primary backgrounds, primary CTAs, large headings.  
- **Neon Lime (Accent)** — #C7FF00  
  - Use for highlights, tiny icon accents, success badges, emphasis.  
- **Gold (Accent / Premium)** — #D4AF37  
  - Use for premium badges, subtle gradients, reward states.  
- **Deep Outline / Dark** — #2E0057  
  - Use for outlines, icons, text on light backgrounds when needed.  
- **Neutral Background** — #FFFFFF (primary) and #F6F7FB (alt)  
- **Text Primary** — #1B1030 (dark indigo)  
- **Text Secondary** — #6B5A7F

Gradients (examples):
- Purple gradient (CTA): linear-gradient(90deg, #7A2EFF 0%, #B32AFF 100%)  
- Swoosh gradient (logo-like): linear-gradient(90deg, #7A2EFF 0%, #D4AF37 60%, #C7FF00 100%)

Accessibility note: Neon lime is very bright — avoid using it for small low-contrast text. Use it as accent only. Always check contrast (WCAG AA/AAA) for text on backgrounds.

---

## 4) Typography
- **Display / Logo style:** Custom/rounded display for the wordmark. For web headers that match logo tone use: *Fredoka* or *Baloo 2* (rounded, friendly).  
  - Example: `font-family: "Fredoka", "Baloo 2", "Poppins", sans-serif;`
- **UI / Body:** *Inter* or *Poppins* (for legibility and modern feel).  
  - Example stack: `font-family: "Inter", "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;`
- **Weights & usage:**  
  - Headings: 600–800 (semibold to bold)  
  - Body: 400 (regular)  
  - UI labels/captions: 500 (medium)  
- **Letter-spacing & rounded feel:** Use slightly increased letter-spacing on uppercase CTAs (e.g., letter-spacing: 0.02em) and keep rounded forms for buttons.

---

## 5) Iconography & Illustration
- **Icon style:** Bold strokes, rounded corners, minimal internal detail. Icons should align to a 24px/32px grid and use the purple or dark outline with lime/gold accents.  
- **Primary icon motif:** lightning bolt + star + swoosh. Use simplified bolt icon for favicons and small-resolution use-cases.  
- **Illustration style:** Flat with subtle gradients, cheerful characters or objects (tickets, coins, confetti). Avoid photorealistic imagery for core UI — use playful vector illustrations to keep vibe light and safe.

---

## 6) UI Components (examples & specs)
- **Primary CTA (Play / Buy Ticket):**  
  - Background: purple gradient (`#7A2EFF → #B32AFF`)  
  - Text color: #FFFFFF  
  - Border-radius: 28px (pill)  
  - Padding: 12px 20px  
  - Box-shadow: subtle (0 6px 18px rgba(122,46,255,0.18))
  - CSS variable example:
    ```
    --winzee-primary: #7A2EFF;
    --winzee-primary-2: #B32AFF;
    .btn-primary {
      background: linear-gradient(90deg, var(--winzee-primary), var(--winzee-primary-2));
      color: #fff;
      border-radius: 28px;
      padding: 12px 20px;
      font-weight: 600;
    }
    ```
- **Secondary CTA:** Outline with neon lime stroke and transparent background; text in dark indigo.  
- **Danger / Promo state:** Use gold accent + subtle glow for celebratory states.  
- **Forms & inputs:** Rounded inputs, 12–14px label, 16px input text, 12px radius. Focus ring: 3px lime ring outside input (use softened alpha).

---

## 7) Motion & Microinteractions
- **Swoosh animation:** When a ticket is purchased or a win occurs, animate a quick swoosh arc across the header (duration 600–900ms, ease-out).  
- **Button press:** micro-scale (0.98) transform + 150ms transition.  
- **Win celebration:** confetti burst (short particles in purple/lime/gold), coin drop animation, gentle sparkle on lightning bolt. Keep animations short and optional (user setting to disable).  
- **Performance:** Prefer CSS animations with will-change: transform; offload heavy particle effects to canvas and throttle on low-power devices.

---

## 8) Copy & Tone of Voice
- **Tone:** upbeat, clear, encouraging, trust-inspiring. Avoid gambling-centric aggressive language; emphasize play, possibility, and transparency.  
- **Headline examples:**  
  - "Spin into possibility."  
  - "Play now — dreams start here."  
  - "Winzee — small tickets, big moments."  
- **CTA examples:**  
  - Primary: "Play Now" / "Buy Ticket"  
  - Secondary: "How It Works" / "See Prizes"  
- **Microcopy:** Keep form labels friendly and concise. Use positive reinforcement for actions (e.g., "Ticket purchased — good luck!").

---

## 9) Accessibility & Legal Considerations
- **Contrast:** Ensure body and CTA text meet WCAG AA (4.5:1 for regular text). Purple-on-white works; neon-lime text must be used sparingly and checked for contrast.  
- **Keyboard & screen reader:** All interactive components must be keyboard-focusable; animated elements provide reduced-motion alternatives. Provide ARIA labels for important actions.  
- **Legal:** Display age and jurisdiction restrictions prominently where required. Include links to Terms, Privacy, Responsible Play, and licensing info. Check legal requirements for lottery/gambling in each target market before launch. Also run a trademark & domain availability check before committing to full production.

---

## 10) Asset Exports & File Naming (recommended)
- **Vector master files:** source-logo.svg, winzee-wordmark.svg, winzee-icon.svg (keep in layered vector with named groups)  
- **PNG raster exports:**  
  - icon-512.png (app store)  
  - icon-192.png (android)  
  - favicon-32.png, favicon-16.png  
  - logo-300x100.png (header)  
- **Color tokens (JSON/CSS):** `colors.json` / `:root` CSS variables for easy theming. Example:
  ```
  :root {
    --winzee-purple: #7A2EFF;
    --winzee-lime: #C7FF00;
    --winzee-gold: #D4AF37;
    --winzee-dark: #2E0057;
  }
  ```
- **Naming conventions:** `brand/logo/{variant}-{size}.{ext}`, `ui/buttons/btn-primary.{svg|png|json}`

---

## 11) Social & Marketing Adaptations
- **App store icon:** rounded square, white background, central bolt+star with purple fill and lime star highlight; keep safe margins and avoid text. Export at 1024x1024 and downscale.  
- **Social avatar:** use the icon/app mark for avatars (square/circle).  
- **Social banners:** large purple gradient background with swoosh motif, short tagline and CTA. Provide alternate versions for dark and light modes.

---

## 12) Do’s and Don’ts (quick)
- Do: Keep the lightning-bolt motif consistent across assets.  
- Do: Use neon lime as accent only.  
- Don’t: Use the full neon lime for long paragraph text.  
- Don’t: Stretch or rotate the logo, or change the bolt shape.

---

## 13) Quick-start Checklist for Designers / Developers
1. Use `winzee-wordmark.svg` for headers, `winzee-icon.svg` for avatars.  
2. Implement CSS variables from Section 9 in global styles.  
3. Use Fredoka/Baloo for playful headings, Inter for body. Load from Google Fonts or bundle locally.  
4. Export icon sizes (512/192/96/48/32/16) and the full SVG set.  
5. Implement reduced-motion preference and test animations on low-power devices.  
6. Run accessibility color-contrast tests on all UI states (hover/active/focus).

---

## 14) Example brand snippets (copy + CSS)
- Headline: **Play. Dream. Win.**  
- Tagline: *Small ticket. Big possibility.*  
- CSS snippet (primary button):
```
.btn-primary {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 28px;
  background: linear-gradient(90deg, #7A2EFF, #B32AFF);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(122,46,255,0.18);
  transition: transform .12s ease, box-shadow .12s ease;
}
.btn-primary:active { transform: scale(.98); }
```

---

## Summary — Key Points
- Winzee is a playful, optimistic, energetic brand built around a purple / neon-lime / gold palette and a lightning-bolt motif.  
- Deliverables to produce first: vector logo set (SVG), app icon at store sizes, color tokens, typography tokens, and a small UI kit with primary button and input styles.  
- Prioritize accessibility (contrast, reduced motion), consistent use of the bolt motif, and careful use of neon lime as an accent only.
