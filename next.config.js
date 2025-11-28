const withTM = require("next-transpile-modules")([
  "@fullcalendar/common",
  "@babel/preset-react",
  "@fullcalendar/common",
  "@fullcalendar/daygrid",
  "@fullcalendar/interaction",
  "@fullcalendar/react",
  "@fullcalendar/timegrid",
  "react-github-btn",
]);

module.exports = withTM({
  reactStrictMode: true,
  // Redirection supprimée - la page d'accueil est maintenant dans pages/index.js
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/pages/widgets",
  //       permanent: true,
  //     },
  //   ];
  // },
});
