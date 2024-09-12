import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = 'CNJStore';

export const handler = async (event) => {
  if (!event.Records || !Array.isArray(event.Records)) {
    console.error('Mensagem no formato inválido.');
    return {
      statusCode: 400,
      body: JSON.stringify('Mensagem no formato inválido.')
    };
  }

  const writeRequests = [];

  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);
      const cnj = messageBody.cnj;

      const externalResponse = {
        status: "success",
        data: "mock"
      };

      writeRequests.push({
        PutRequest: {
          Item: {
            cnj,
            response: externalResponse,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Erro na mensagem:', error);
    }
  }

  if (writeRequests.length > 0) {
    const batchWriteCommand = new BatchWriteCommand({
      RequestItems: {
        [tableName]: writeRequests
      }
    });

    try {
      await docClient.send(batchWriteCommand);
      console.log('Mensagens salvas.');
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
      throw new Error('Erro ao salvar mensagens');
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Mensagens salvas!')
  };
};
