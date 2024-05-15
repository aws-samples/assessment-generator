# Welcome to GenAssess

To deploy this project in your own AWS account, please run the following commands.

Change region to us-west-2

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
