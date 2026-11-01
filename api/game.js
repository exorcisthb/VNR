import { createFunctionServer } from '../server/serverless.mjs';

const { server } = await createFunctionServer();
export default server;
