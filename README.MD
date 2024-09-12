# Arquitetura do Projeto

## Desenho da arquitetura.
   ![Arquitetura ideal para 100 requisições por minuto](/images/arq.png)
   ![Arquitetura ideal para 1 requisição por hora](/images/arq-simples.png)

## Estrutura Geral

1. **API Gateway**:
   - **RestApi**: Cria um novo API Gateway com o nome `SaveAndProcessCnj`.
   - **Resource**: Adiciona um recurso `save-cnj` à API, que representa um endpoint.
   - **Method**: Define o método POST para o recurso `/save-cnj`. Esse método é configurado para interagir com a fila SQS.

2. **SQS Queue**:
   - **Queue**: Cria uma fila SQS chamada `CNJMessageQueue` que armazena as mensagens recebidas pea API Gateway.

3. **IAM Role**:
   - **APIGatewaySQSIntegration**: Cria uma função IAM para permitir que o API Gateway envie mensagens para a fila SQS. Inclui as políticas `AmazonSQSFullAccess` e `AmazonAPIGatewayPushToCloudWatchLogs`.

4. **Lambda Function**:
   - **Function**: Cria uma função Lambda chamada `SaveCNJ`, que processa as mensagens da fila SQS e armazena dados no DynamoDB.

5. **Lambda Event Source Mapping**:
   - **Mapping**: Configura a fila SQS como uma fonte de eventos para a função Lambda, permitindo que a função seja acionada quando mensagens chegam à fila.

6. **DynamoDB Table**:
   - **Table**: Cria uma tabela DynamoDB chamada `CNJStore` para armazenar os dados processados pela função Lambda.

## Detalhamento do API Gateway

- **Integration**:
  - **Type: AWS**: Indica que a integração é com um serviço AWS (SQS neste caso).
  - **Uri**: Define o ARN da fila SQS. Usa o formato `arn:aws:apigateway:${AWS::Region}:sqs:path/${AWS::AccountId}/CNJMessageQueue`.
  - **Credentials**: Especifica a função IAM (`APIGatewaySQSIntegration`) que o API Gateway deve usar para acessar a fila.
  - **RequestTemplates**: Define um modelo de mapeamento para transformar a solicitação HTTP em uma mensagem SQS. O modelo converte o corpo da solicitação em um formato que o SQS pode entender (`Action=SendMessage&MessageBody=$input.body`).

- **IntegrationResponses**:
  - **StatusCode: 200**: Configura a resposta da integração para retornar um código de status 200 quando a mensagem for enviada com sucesso. O corpo da resposta é definido como `{"status":"Message sent successfully"}`.

- **MethodResponses**:
  - **StatusCode: 200**: Define a resposta do método API Gateway, incluindo o código de status 200 e um modelo de resposta. Inclui também o cabeçalho `Content-Type` na resposta.

## Fluxo de Dados

1. **Cliente** envia uma solicitação POST para o endpoint `/save-cnj` da API Gateway.
2. **API Gateway** usa o modelo de mapeamento para transformar a solicitação em uma mensagem SQS.
3. **API Gateway** responde ao cliente com um status 200, indicando que a mensagem foi enviada com sucesso.
4. **Mensagem** é enviada para a fila `CNJMessageQueue`.
5. **Lambda Function** é acionada quando uma mensagem chega à fila.
6. **Lambda** processa a mensagem e a armazena no banco.

Este modelo integra várias AWS services para criar uma solução completa para processar e armazenar dados recebidos através de uma API RESTful.
