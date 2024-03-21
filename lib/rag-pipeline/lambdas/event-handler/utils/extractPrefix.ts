import { logger } from "./pt";

export function extractPrefix(objectKey: string) {
  //Get file paths
  const keyPaths = objectKey.split("/");
  if (keyPaths.length <= 1) {
    logger.error(`Object key has no prefix: ${objectKey}`);
    throw new Error("Unable to process files at bucket root");
  }
   //the prefix is the first part of the URL
  return keyPaths[0];
}