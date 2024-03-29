import { DynamoDB } from 'aws-sdk';
import { addCorsHeader } from '../Shared/Utils';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY!;
const dbClient = new DynamoDB.DocumentClient();
console.log(process.env.AWS_REGION);
async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'ok',
  };
  addCorsHeader(result);
  try {
    if (
      event.queryStringParameters &&
      PRIMARY_KEY in event.queryStringParameters
    ) {
      result.body = await queryWithPrimaryPartition(
        event.queryStringParameters
      );
    } else if (
      event.queryStringParameters &&
      !(PRIMARY_KEY in event.queryStringParameters)
    ) {
      result.body = await queryWithSecondaryPartition(
        event.queryStringParameters
      );
    } else {
      result.body = await scanTable();
    }
  } catch (error: any) {
    result.body = error.message;
  }
  return result;
}

async function scanTable() {
  const queryResponse = await dbClient
    .scan({
      TableName: TABLE_NAME!,
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
}

async function queryWithPrimaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const keyValue = queryParams[PRIMARY_KEY!];
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      KeyConditionExpression: '#spacesId = :spacesId',
      ExpressionAttributeNames: {
        '#spacesId': PRIMARY_KEY!,
      },
      ExpressionAttributeValues: {
        ':spacesId': keyValue,
      },
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
}

async function queryWithSecondaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const queryKey = Object.keys(queryParams)[0];
  const queryValue = queryParams[queryKey];
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      IndexName: queryKey,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: {
        '#key': queryKey,
      },
      ExpressionAttributeValues: {
        ':value': queryValue,
      },
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
}

export { handler };
