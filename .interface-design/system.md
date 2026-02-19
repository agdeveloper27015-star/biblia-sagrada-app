# Design System — Bíblia Sagrada App

## Direction
Premium spiritual reading app. Feels like a high-end iOS app.
Depth through shadows + glassmorphism. Not flat.

## Tokens

### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 20, 24, 32

### Radius
- Component (buttons, inputs, chips): 12px (rounded-xl)
- Cards (main panels): 16px (rounded-2xl)
- Full (avatars, color dots): 9999px (rounded-full)

### Colors
- Primary: #2D3436
- Secondary: #6C5CE7 (violet — main brand)
- Accent: #00B894 (green)
- BG Light: #F4F3F8 (slightly purple-tinted white)
- BG Dark: #0F0E1A (deep dark)

### Typography
- Scripture: Merriweather / Source Serif 4 (serif)
- UI: Inter (sans)
- Scale: 11, 12, 13, 14, 16, 18, 20, 24px

## Depth System (PREMIUM)

### Shadows (Light)
- Subtle:   0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(108,92,231,0.06)
- Card:     0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(108,92,231,0.08)
- Elevated: 0 4px 24px rgba(0,0,0,0.10), 0 16px 48px rgba(108,92,231,0.12)
- Modal:    0 8px 40px rgba(0,0,0,0.16), 0 24px 64px rgba(108,92,231,0.16)

### Shadows (Dark)
- Subtle:   0 1px 4px rgba(0,0,0,0.3)
- Card:     0 4px 16px rgba(0,0,0,0.4), 0 8px 32px rgba(108,92,231,0.15)
- Elevated: 0 8px 32px rgba(0,0,0,0.5), 0 16px 48px rgba(108,92,231,0.2)
- Modal:    0 16px 64px rgba(0,0,0,0.6), 0 24px 80px rgba(108,92,231,0.25)

### Glass
- Nav:     backdrop-blur(24px) + bg white/80 (light) / bg #0F0E1A/75 (dark)
- Modal:   backdrop-blur(20px)
- Cards:   subtle tinted bg — NOT transparent (readability)

## Patterns

### Card (main)
- bg: var(--bg-card)
- border: 1px solid var(--border-subtle)
- radius: 16px
- shadow: var(--shadow-card)
- padding: 20px

### Card (hero/verse-of-day)
- bg: linear-gradient with violet tones
- radius: 20px
- shadow: var(--shadow-elevated)
- padding: 24px

### Button (primary)
- bg: var(--color-secondary)
- color: white
- radius: 12px
- shadow: 0 4px 16px rgba(108,92,231,0.35)
- padding: 12px 24px

### Bottom Navigation
- glass background
- shadow: 0 -8px 32px rgba(0,0,0,0.08)
- border-top: 1px solid var(--border-subtle)

## Anti-patterns
- NO flat cards with just a border
- NO bottom nav without blur
- NO buttons without depth/shadow
- NO headers without subtle background separation
