import dotenv from 'dotenv';
dotenv.config();

const constants = {
  morganFormat: ':method :url :status :response-time ms',
  clientUrl: `${process.env.CLIENT_URL}`,
  serverUrl: `${process.env.SERVER_URL}`,
  dbName: 'pathgenie',
  RESEND_API_KEY: `${process.env.RESEND_API_KEY}`,
};

export default constants;
