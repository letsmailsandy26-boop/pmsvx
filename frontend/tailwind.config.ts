import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'op-primary':       '#1A67A3',
        'op-primary-dark':  '#155A8A',
        'op-primary-light': '#E8F0F8',
        'op-bg':            '#F0F0F0',
        'op-panel-header':  '#F7F7F7',
        'op-table-head':    '#F5F5F5',
        'op-border':        '#DDDDDD',
        'op-border-light':  '#EBEBEB',
        'op-hover':         '#F5F9FD',
        'op-text':          '#333333',
        'op-muted':         '#6B7280',
        'op-sidebar-bg':    '#1B3C6E',
        'op-sidebar-text':  '#D0E3F7',
        'op-sidebar-hover': '#163264',
        'op-sidebar-active':'#2563EB',
        'op-red':           '#C92A2A',
        'op-green':         '#2D7D2D',
        'op-orange':        '#C27D10',
        'op-purple':        '#6B21A8',
      },
      fontSize: {
        '2xs': '10px',
      },
      boxShadow: {
        'op': '0 1px 3px rgba(0,0,0,0.08)',
        'op-md': '0 2px 8px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
