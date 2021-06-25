module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('API_DOMAIN'),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '2131f5399fd4e0ab647b55774ed49880'),
    },
  },
});
