module.exports = ({ env }) => {
  let upload = {};

  if (env('NODE_ENV') === 'production') {
    upload = {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    }
  }

  return {
    upload,
  }
};