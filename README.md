# Welcome to GenAssess

## Prerequisites

Ensure you have the following installed:
- Node and npm
- Docker
- CDK

Request model access on Amazon Bedrock for the following:
- Amazon Titan Embeddings G1 - Text
- Anthropic Claude 3 Haiku

## Deployment


To deploy this project in your own AWS account, ensure your AWS region is set to the same region where you have Bedrock Model access. 
Then, run the following commands:
```bash
npm ci
npx cdk bootstrap --qualifier gen-assess
npm run cdk deploy
```

After successfully deploying, you will be able to access the Frontend UI with the CloudFront URL in the CDK outputs.
Next:

1. Create an account using the frontend
2. Login to the AWS Console and assign the account to the "teachers" group

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
