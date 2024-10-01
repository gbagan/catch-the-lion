import type { Config } from 'tailwindcss';

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      height: {
        '30': '7.5rem',
      },
      backgroundImage: {
        main: "url('../background.webp')",
        board: "url('../board.webp')",
        thinking: "url('../girl_thinking.webp')",
        happy: "url('../girl_happy.webp')",
        crying: "url('../girl_crying.webp')",
        speaking: "url('../girl_speaking.webp')",
        surprised: "url('../girl_surprised.webp')",
      },
      gridTemplateColumns: {
        '20/80': '20% 80%',
      },
      boxShadow: {
        'threat': '0 0 20px red',
      },
      animation: {
        'flip-y': 'flip-y 500ms linear forwards',
      },
      keyframes: {
        "flip-y": {
          '0%': { opacity: '0', transform: 'rotateY(180deg)' },
          '100%': { opacity: '1', transform: 'rotateY(0)' },
        }
      }
    }
  },
  plugins: [],
} satisfies Config