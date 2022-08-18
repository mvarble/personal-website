module.exports = {
  plugins: {
    'postcss-import': {
      filter: (arg) => {
        if (arg && arg.slice && arg.slice(0,2) == './') {
          return true;
        } else {
          return false;
        }
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
}
