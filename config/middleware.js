module.exports = ({ env }) => {
  let origin = ['http://localhost:3000', 'http://localhost:1337'];

  if (env('NODE_ENV') === 'production') {
    origin = env('ALLOW_ORIGIN').split(' ') || 'https://bubble-tea-ecommerce.herokuapp.com';
  }

  return {
    settings: {
      cors: {
        enabled: true,
        origin,
      },
    },
  }
};
