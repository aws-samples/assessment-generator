import { Logger } from "@aws-lambda-powertools/logger";
import { Metrics } from "@aws-lambda-powertools/metrics";
import { Tracer } from "@aws-lambda-powertools/tracer";

/**
 * Creating a global instance for the Powertools logger
 * to be used across the different applications.
 */
export const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME,
});

/**
 * Creating a global instance for the Powertools metrics
 * to be used across the different applications.
 */
export const metrics = new Metrics({
  defaultDimensions: {
    region: process.env.AWS_REGION ?? 'N/A',
    executionEnv: process.env.AWS_EXECUTION_ENV ?? 'N/A',
  },
});

/**
 * Creating a global instance for the Powertools tracer
 * to be used across the different applications.
 */
export const tracer = new Tracer();
