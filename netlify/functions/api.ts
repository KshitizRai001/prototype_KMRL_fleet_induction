import serverless from "serverless-http";
import { createServer } from "../../server";

// Wrap the existing Express app as a Netlify Function
export const handler = serverless(createServer());

import { createServer } from "../../server";

export const handler = serverless(createServer());
