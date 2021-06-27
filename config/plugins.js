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

  const email = {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: 'no-reply@linjohnjohn.me',
      defaultReplyTo: 'jlin724@alum.mit.edu',
    }
  }
  return {
    upload,
    email
  }
};