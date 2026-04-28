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
          'accent-deep': '#0B1B3F',
          'accent-50': '#EDF2FF',
          'accent-100': '#DCE6FF',
          success: '#12B76A',
          'success-50': '#E5F7EE',
          warn: '#D9821A',
          'warn-50': '#FBF1E1',
          'warn-text': '#6E4F1E',
          error: '#F04438',
          'error-50': '#FAE7E2',
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
