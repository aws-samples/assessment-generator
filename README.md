# Welcome to GenAssess

Assessment Generator is a sample application generating assessment questions for a provided reference material and lecture note(s).

## Features Overview

Key features (Teacher)

- Course addition: Teacher can add a new course
- Assessment template creation: Teacher can define an assessment set with the number of questions for each level (easy, medium, hard)
- Manage knowledge base: Teacher can upload reference material for a pre-defined course
- Generate assessments: Teacher can generate assessments by using a predefined assessment template and course.

Short clip depicting the teacher journey

https://github.com/aws-samples/assessment-generator/assets/5655093/d4b135a2-5b89-492e-8296-8038ac1b3c1d

Key features (Student)

- Assessments: Start and reviews assessment

Short clip depicting the student journey

https://github.com/aws-samples/assessment-generator/assets/5655093/706730e0-b167-4bd2-aa35-ce82e908a7aa

## Architecture

The architecture can be split into 3 key blocks:

- Front-end architecture
- Document ingestion architecture
- Assessment generator architecture

Architecture diagrams depicting key components in those blocks are provided below:

![Front-end architecture](https://github.com/aws-samples/assessment-generator/blob/main/media/Arch-Front-End.png)

![Document ingestion architecture](https://github.com/aws-samples/assessment-generator/blob/main/media/Arch-Document-Ingestion.png)

![Assessment generator architecture](https://github.com/aws-samples/assessment-generator/blob/main/media/Arch-Assessment-Generator.png)

## Prerequisites

Ensure you have the following installed:

- Node and npm
- Docker
- CDK

Request model access on Amazon Bedrock for the following:

- Amazon Titan Embeddings G1 - Text
- Anthropic Claude 3.5 Sonnet

## Deployment

To deploy this project in your own AWS account, ensure your AWS region is set to the same region where you have Bedrock Model access.
Then, run the following commands:

```bash
git clone git@github.com:aws-samples/assessment-generator.git
cd assessment-generator
npm ci
npx cdk bootstrap --qualifier gen-assess
npm run cdk deploy
```

After successfully deploying, you will be able to access the Frontend UI with the CloudFront URL in the CDK outputs.
Next:

1. Create an account for student using the frontend with "Create Account" tab and Role as "students"
2. Create an account for teacher using the frontend with "Create Account" tab and Role as "teachers"
3. For teacher journey: Login with the created teacher account
4. For student journey: Login with the created student account

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
