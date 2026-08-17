# Fixaur Instagram Images v2 - Design Guide

## Files Created

All images are in `/v2/` folder:

| File | Template Used | Description |
|------|---------------|-------------|
| `01-launch.svg` | Headline Statement | Brand intro with services grid |
| `02-no-start.svg` | Problem/Solution | Red problem section → Blue solution |
| `03-battery.svg` | Stat Callout | Large battery icon + checklist |
| `04-brakes.svg` | Us vs Them | Left: ignored problems, Right: Fixaur solution |
| `05-diagnostics.svg` | Feature Spotlight | Check engine light + 3 feature cards |
| `06-maintenance.svg` | Lifestyle Hero | Clean oil services with benefits |
| `07-tires.svg` | Headline Statement | Winter theme with snow effect |
| `08-roadside.svg` | Problem/Solution | Stranded → We come to you |
| `09-fleet.svg` | Feature Spotlight | Fleet services with business focus |
| `10-service-area.svg` | Grid Layout | 3 city cards + service types |

## Design System

### Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | `#0f172a` | Primary background |
| Background Mid | `#1e293b` | Cards, sections |
| Blue Primary | `#3b82f6` | CTAs, accents |
| Cyan Accent | `#06b6d4` | Gradients, highlights |
| Green Success | `#22c55e` | Checkmarks, positive |
| Red Warning | `#ef4444` | Problem sections |
| Yellow Alert | `#fbbf24` | Warning icons |
| Gold Business | `#eab308` | Fleet, business |

### Typography
- **Headlines:** System UI Bold, 64-72px
- **Subheads:** System UI SemiBold, 36-48px  
- **Body:** System UI Regular, 24-32px
- **Small:** System UI Regular, 20-24px

## How to Convert SVG to PNG

### Option 1: Drag to Browser (Easiest)
1. Open any `.svg` file in Chrome/Firefox/Safari
2. Right-click → "Save image as" → Choose PNG

### Option 2: Online Converter
1. Go to [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png)
2. Upload all 10 SVG files
3. Set output size: **1080x1080 pixels**
4. Convert and download ZIP

### Option 3: macOS Preview
1. Open SVG in Preview
2. Export as PNG at 1080x1080

### Option 4: Command Line (ImageMagick)
```bash
cd /Users/diacre/Documents/Fixaur/assets/instagram/v2
for f in *.svg; do
  sips -s format png "$f" --out "${f%.svg}.png"
done
```

## Design Improvements in v2

Based on **ad-creative** skill templates:
- ✅ Professional dark theme (better mobile feed appearance)
- ✅ Gradient accents for depth
- ✅ Clear visual hierarchy
- ✅ Problem/Solution layouts for engagement
- ✅ Consistent branding (phone number, location)
- ✅ Grid layouts for scannable info
- ✅ Strong CTAs with contrasting colors

## Image Specs
- **Dimensions:** 1080x1080 pixels (Instagram square)
- **Format:** SVG (vector, infinitely scalable)
- **Color mode:** RGB
- **Theme:** Dark professional with blue/cyan accents
