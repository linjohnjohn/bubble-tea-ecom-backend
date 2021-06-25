module.exports = ({ env }) => {
  let origin = ['http://localhost:3000', 'http://localhost:1337'];

  if (env('NODE_ENV') === 'production') {
    origin = env('ALLOW_ORIGIN', 'https://bubble-tea-ecommerce.herokuapp.com').split(' ');
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
