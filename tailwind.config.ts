import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        winzee: {
          purple: '#7A2EFF',
          purple2: '#B32AFF',
          lime: '#C7FF00',
          gold: '#D4AF37',
          dark: '#2E0057',
          indigo: '#1B1030',
          muted: '#6B5A7F',
          bg: '#F6F7FB',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'Baloo 2', 'Poppins', 'sans-serif'],
        body: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        pill: '28px',
      },
      boxShadow: {
        winzee: '0 6px 18px rgba(122,46,255,0.18)',
        'winzee-lg': '0 12px 32px rgba(122,46,255,0.22)',
        card: '0 2px 12px rgba(27,16,48,0.08)',
        'card-hover': '0 6px 24px rgba(27,16,48,0.14)',
      },
      backgroundImage: {
        'winzee-gradient': 'linear-gradient(90deg, #7A2EFF 0%, #B32AFF 100%)',
        'winzee-swoosh': 'linear-gradient(90deg, #7A2EFF 0%, #D4AF37 60%, #C7FF00 100%)',
      },
      ringWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}

export default config
