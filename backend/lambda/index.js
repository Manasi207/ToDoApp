// // backend/lambda/index.js
// const {
//   DynamoDBClient,
//   ScanCommand,
//   PutItemCommand,
//   DeleteItemCommand,
//   UpdateItemCommand
// } = require('@aws-sdk/client-dynamodb');
// const { unmarshall } = require('@aws-sdk/util-dynamodb');
// const { v4: uuidv4 } = require('uuid');

// const client = new DynamoDBClient({ region: 'eu-north-1' });
// const TABLE_NAME = process.env.TABLE_NAME || 'TodoTasks';

// const corsHeaders = {
//   'Content-Type': 'application/json',
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
//   'Access-Control-Allow-Headers': '*'
// };

// exports.handler = async (event) => {
//   console.log('Received event:', JSON.stringify(event));

//   const method = event.httpMethod;
//   const path = event.path.replace(/^\/prod/, '');
//   const body = event.body ? JSON.parse(event.body) : null;

//   try {
//     if (method === 'OPTIONS') {
//       return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'CORS OK' }) };
//     }

//     if (method === 'GET' && path === '/tasks') {
//       const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
//       const tasks = result.Items.map(item => unmarshall(item));
//       return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ tasks }) };
//     }

//     if (method === 'POST' && path === '/tasks') {
//       const id = uuidv4();
//       const { text, completed = false } = body;
//       await client.send(new PutItemCommand({
//         TableName: TABLE_NAME,
//         Item: {
//           id: { S: id },
//           text: { S: text },
//           completed: { BOOL: completed }
//         }
//       }));
//       return { statusCode: 201, headers: corsHeaders, body: JSON.stringify({ id, text, completed }) };
//     }

//     if (method === 'PUT' && path.startsWith('/tasks/')) {
//       const id = path.split('/').pop();
//       const { text, completed } = body;
//       await client.send(new UpdateItemCommand({
//         TableName: TABLE_NAME,
//         Key: { id: { S: id } },
//         UpdateExpression: 'SET #t = :t, completed = :c',
//         ExpressionAttributeNames: { '#t': 'text' },
//         ExpressionAttributeValues: {
//           ':t': { S: text },
//           ':c': { BOOL: completed }
//         }
//       }));
//       return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Updated successfully' }) };
//     }

//     if (method === 'DELETE' && path.startsWith('/tasks/')) {
//       const id = path.split('/').pop();
//       await client.send(new DeleteItemCommand({
//         TableName: TABLE_NAME,
//         Key: { id: { S: id } }
//       }));
//       return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Deleted successfully' }) };
//     }

//     return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Unsupported operation' }) };

//   } catch (err) {
//     console.error('Lambda error:', err);
//     return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
//   }
// };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// backend/lambda/index.js
const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'eu-north-1' });
const TABLE_NAME = process.env.TABLE_NAME || 'TodoTasks';

// ✅ CORS headers
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*'
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));

  const method = event.httpMethod || 'GET';
  const path = event.path || '/';
  let body = null;

  // Parse JSON safely
  try {
    if (event.body) body = JSON.parse(event.body);
  } catch (err) {
    console.error('Body parse error:', err);
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // ✅ Handle preflight CORS request
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'CORS OK' }) };
  }

  try {
    // ✅ GET /dev/tasks
    if (method === 'GET' && path === '/dev/tasks') {
      const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
      const tasks = result.Items.map(item => unmarshall(item));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ tasks }) };
    }

    // ✅ POST /dev/tasks
    if (method === 'POST' && path === '/dev/tasks') {
      if (!body || !body.text) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Task text required' }) };
      }
      const id = uuidv4();
      const { text, completed = false } = body;
      await client.send(new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          id: { S: id },
          text: { S: text },
          completed: { BOOL: completed }
        }
      }));
      return { statusCode: 201, headers: corsHeaders, body: JSON.stringify({ id, text, completed }) };
    }

    // ✅ PUT /dev/tasks/{id}
    if (method === 'PUT' && path.startsWith('/dev/tasks/')) {
      const id = path.split('/').pop();
      if (!body || typeof body.text === 'undefined' || typeof body.completed === 'undefined') {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Task text and completed required' }) };
      }
      await client.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: id } },
        UpdateExpression: 'SET #t = :t, completed = :c',
        ExpressionAttributeNames: { '#t': 'text' },
        ExpressionAttributeValues: {
          ':t': { S: body.text },
          ':c': { BOOL: body.completed }
        }
      }));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Updated successfully' }) };
    }

    // ✅ DELETE /dev/tasks/{id}
    if (method === 'DELETE' && path.startsWith('/dev/tasks/')) {
      const id = path.split('/').pop();
      await client.send(new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: id } }
      }));
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: 'Deleted successfully' }) };
    }

    // Unsupported
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: 'Unsupported operation' }) };

  } catch (err) {
    console.error('Lambda execution error:', err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};

