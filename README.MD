# Final Task For Cloud Computing

# Image resize by using AWS Lambda function

## Install Dependencies Locally:

```
npm init -y
npm install aws-sdk
npm install --arch=x64 --platform=linux sharp
```

## Create S3 Bucket:

1. AWS Console → S3
2. Create New Bucket
3. Create folders → "original-images" & "resize-images"
4. Edit static website hosting → Enable →  Index document: index.html
5. Add Event Nofitication → prefix (original-images/) → event type (All object events) → Trigger (Lambda function) → SAVE



## Create Lambda function:

1. AWS Console → Lambda
2. Create New Lambda

- Node.js 14.x runtime
- x86_64 architecture
- a new role with basic Lambda permissions

3. Create Lambda Code → see the resize.js
4. Package with Zip

Mac

- `zip -r function.zip resize.js node_modules package.json index.js`

Window

- `Compress-Archive -Path index.js, node_modules, package.json -DestinationPath function.zip`

5. Upload Lambda Code

- AWS Console → Code → Upload → select function.zip

## Add S3 event trigger

Lambda Console → Add Trigger → Select S3

Select Bucket → Event types = All Object Create Events → Prefix → Add

## Execution Role

Lambda Console → Configuration → Permissions → "Execution Role" → Navigate to the IAM

Create a new policy to grants read and write access to the S3 bucket.

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "Statement1",
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:GetObject",
				"s3:DeleteObject",
				"s3:ListBucket"
			],
			"Resource": [
				"arn:aws:s3:::bucket-name",
				"arn:aws:s3:::bucket-name/*"
			]
		}
	]
}
```

Add created permissions in the Roles. SAVE

버킷: source-bucket
이벤트 유형: PUT (새 파일 업로드 시 실행)
3️⃣ 저장 후 Lambda 배포

## Test

1. Upload the image to S3
2. When Lambda executes, the resized image will be stored in the resized-images/ folder
3. Check the result in S3 🚀


## Source:

Lambda Offical Document:
https://docs.aws.amazon.com/lambda/latest/dg/welcome.html

AWS Lambda Sample Code:
https://github.com/aws-samples

AWS Serverless Application Repository
https://serverlessrepo.aws.amazon.com/applications

AWS Offical Blog & Community:
https://aws.amazon.com/blogs/compute/category/serverless/aws-lambda/
https://stackoverflow.com/questions/tagged/aws-lambda
