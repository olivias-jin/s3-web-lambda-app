const AWS = require("aws-sdk");
const sharp = require("sharp"); // 이미지 리사징을 위한 라이브러리

const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log("Lambda triggered with event:" , JSON.stringify(event, null, 2 ));
    try {
        // Fetching file information from S3 event
        console.log("Event received:", JSON.stringify(event, null, 2))
        const record = event.Records[0];
        if (!record || !record.s3 || !record.s3.bucket || !record.s3.object || !record.s3.object.key) {
          console.error("Event structure is invalid:", JSON.stringify(record, null, 2));
          throw new Error('Invalid event structure');
      }

        const sourceBucket = record.s3.bucket.name;
        const sourceKey = decodeURIComponent(
            record.s3.object.key.replace(/\+/g, "")
    );

    console.log(
      `Processing file from bucket: ${sourceBucket}, key:${sourceKey}`
    );
    // Fetching original images from S3
    const originalImage = await s3
      .getObject({ Bucket: sourceBucket, Key: sourceKey })
      .promise();
    console.log("Original image fetched succesfully");

    // Resizing images
    const resizedImage = await sharp(originalImage.Body)
      .resize(700)
      .toFormat("jpeg")
      .toBuffer();
    console.log("Image resized successfully");

    // Set the save path
    const resizedKey = `resized-images/${sourceKey.replace(
      "original-images/",
      ""
    )}`;
    console.log(`Uploading resized image to: ${resizedKey}`);

    // Save the Resized images on S3
    await s3
      .putObject({
        Bucket: sourceBucket,
        Key: resizedKey,
        Body: resizedImage,
        ContentType: "image/jpeg",
      })
      .promise();

    console.log(
      `Successfully resized ${sourceKey} and uploaded to ${resizedKey}`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Image resized and uploaded to ${resizedKey}`,
      }),
    };
  } catch (error) {
    console.error("Error processing image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing image",
        error: error.message,
      }),
    };
  }
};
