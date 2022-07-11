import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Create';

const event: APIGatewayProxyEvent = {
  // queryStringParameters: {
  //   spaceId: 'e25ad9f9-a4e0-4740-acef-4c2a0978f08f',
  // },
  body: {
    name: 'someName',
    location: 'someLocation',
  },
} as any;

const result = handler(event as any, {} as any).then((apiResult) => {
  // const items = JSON.parse(apiResult.body);
  console.log(123);
});
