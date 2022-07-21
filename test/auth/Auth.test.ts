import { AuthService } from './AuthService';
import { config } from './config';
import * as AWS from 'aws-sdk';

AWS.config.region = config.REGION;

async function getBuckets() {
  let buckets;
  try {
    buckets = await new AWS.S3().listBuckets().promise();
  } catch (error) {
    buckets = undefined;
  }
  return buckets;
}

// const authService = new AuthService();

// const user = authService.login(
//   config.TEST_USER_NAME,
//   config.TEST_USER_PASSWORD
// );

async function callStuff() {
  const authService = new AuthService();

  const user = await authService.login(
    config.TEST_USER_NAME,
    config.TEST_USER_PASSWORD
  );
  const someCreds = await authService.getAWSTemporaryCreds(user);
  const buckets = await getBuckets();
  const a = 5;
}

callStuff();