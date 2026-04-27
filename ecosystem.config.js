module.exports = {
  apps: [
    {
      name: "legajo-digital",
      script: ".next/standalone/server.js",
      env: {
        PORT: 7287,
        HOSTNAME: "192.168.20.10",
      },
    },
  ],
};
