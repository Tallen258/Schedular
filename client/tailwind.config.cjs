module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        'itin-sand': {
          10: '#fffdfa',
          50: '#faf3e7',
          100: '#f2e4cc',
          200: '#e6d3ae',
          300: '#d9c196',
          400: '#c8a97a',
          500: '#b18557',
          600: '#91653c',
          700: '#744e30',
          800: '#563a25',
          900: '#3a2818',
          950: '#22170f'
        },
        'brand-purple': {
          50: '#E3DCF4',
          400: '#8774B3'
        },
        'brand-teal': {
          50: '#eaefef',
          100: '#b8cfce',
          200: '#a0c1bf',
          300: '#8cafac',
          400: '#709994',
          500: '#4e756e',
          600: '#365650',
          700: '#2c3f3c',
          800: '#243330',
          900: '#1c2322'
        },
        'custom-red': {
          50: '#FFF7F7',
          500: '#B37171',
          700: '#8F4C4C'
        },
        'custom-white': '#fffdfa',
        'custom-black': '#0e0f16'
      }
    }
  },
  plugins: []
};
