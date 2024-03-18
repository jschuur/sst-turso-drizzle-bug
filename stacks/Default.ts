import { Api, StackContext } from 'sst/constructs';

export function API({ stack }: StackContext) {
  const api = new Api(stack, 'api', {
    defaults: {},
    routes: {
      'GET /': 'src/hello.handler',
      'GET /users': {
        function: {
          handler: 'src/users.handler',
          environment: {
            TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL,
            TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
          },
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
