/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marker: {
          text: '#101828',
          secondary: '#475467',
          tertiary: '#344054',
          muted: '#98A2B3',
          faint: '#D0D5DD',
          accent: '#196AFF',
          success: '#12B76A',
          error: '#F04438',
          'bg-card': '#F9FAFB',
          'bg-alt': '#F2F4F7',
          border: '#E4E7EC',
          'bg-edit': '#F0F4FF',
        },
      },
      fontFamily: {
        sans: ["'Google Sans'", "'Inter'", 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
