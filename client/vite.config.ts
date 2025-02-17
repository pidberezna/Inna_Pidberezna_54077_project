// https://vite.dev/config/
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://rently-app-project-api.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
