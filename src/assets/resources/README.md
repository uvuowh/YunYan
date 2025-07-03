# Resources Directory

This directory contains static resources used by the YunYan application.

## Structure

```
resources/
├── fonts/                    # Font files
│   ├── MapleMono-*.ttf      # Maple Mono font family
├── config.json              # Maple Mono font configuration
├── MapleMono-TTF.zip        # Original font archive
├── MapleMono-LICENSE.txt    # Font license (SIL Open Font License)
└── README.md               # This file
```

## Fonts

### Maple Mono Font Family

The Maple Mono font family is a monospace font designed for coding and terminal use. It includes:

**Weights:**
- Thin (100)
- Extra Light (200)
- Light (300)
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)
- Extra Bold (800)

**Styles:**
- Normal
- Italic

**Features:**
- Programming ligatures
- Optimized for code readability
- Multiple OpenType features
- Excellent terminal compatibility

### Usage

The fonts are automatically loaded via `@font-face` declarations in `src/assets/scss/_fonts.scss`. They are available throughout the application using the CSS font-family:

```css
font-family: 'Maple Mono', monospace;
```

### License

The Maple Mono font is licensed under the SIL Open Font License, Version 1.1. See `MapleMono-LICENSE.txt` for full license text.

## Configuration

The `config.json` file contains the original configuration used to generate the Maple Mono font variants. This includes:

- Font feature settings
- Ligature configuration
- Nerd Font integration settings
- Chinese character support options

## Maintenance

When updating fonts:

1. Replace font files in the `fonts/` directory
2. Update `@font-face` declarations in `_fonts.scss` if needed
3. Update this README if the font family changes
4. Ensure license compliance

## Performance

- All fonts use `font-display: swap` for better loading performance
- Fonts are loaded on-demand based on usage
- Consider subsetting fonts if bundle size becomes an issue
