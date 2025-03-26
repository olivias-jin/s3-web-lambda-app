const express = require("express");
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const fileUpload = require("express-fileupload");
const cors = require('cors');
const app = express();
const PORT = 3001;
const fs = require("fs");
const path = require("path");

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "mytask-2.6";
const S3_URL = `http://mytask-2.6.s3-website-us-east-1.amazonaws.com`;

// https://${BUCKET_NAME}.s3.amazonaws.com/


app.use(
  cors({
    origin: "*", // 모든 도메인 허용 (보안상 필요한 경우 특정 도메인만 허용)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload()); // 기본 설정으로 간단하게

// S3 이미지 목록 가져오기
app.get("/images", async (req, res) => {
  try {
    const { Contents } = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET_NAME })
    );
    res.setHeader("Access-Control-Allow-Origin", "*"); // 수동으로 추가해도 됨
    res.json({
      files:
        Contents?.map(({ Key }) => ({ Key, Url: `${S3_URL}${Key}` })) || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// S3 파일 업로드
app.post("/images", async (req, res) => {
  const file = req.files?.image;
  if (!file) return res.status(400).json({ error: "No file uploaded." });

  const key = `original-images/${file.name}`;
  console.log(`Uploading file with Key: ${key}`);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key, //파일 경로 추간
        Body: file.data,
        ContentType:file.mimetype,
      })
    );

    const imageUrl = `http://${bucketName}.s3-website-us-east-1.amazonaws.com/${key}`;// Static website URL

    console.log(`Upload successful: &{key}`);
    res.json({
      message: "Upload successful!",
      imageUrl,
    });
} catch (err) {
    console.error("S3 upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// S3 파일 다운로드
app.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };

  try {
     // S3에서 파일 가져오기
    const data = await s3.send(new GetObjectCommand(params));

 // 파일 데이터를 메모리로 읽기
 const chunks = [];
 data.Body.on("data", (chunk) => {
   chunks.push(chunk);
 });

 data.Body.on("end", () => {
   const fileBuffer = Buffer.concat(chunks);  // 파일 데이터를 버퍼로 결합


    // 클라이언트로 파일 전송
    res.setHeader("Content-Type", data.ContentType); // 콘텐츠 타입 설정 (파일의 종류에 따라)
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`); // 파일 다운로드를 위한 헤더
    data.Body.pipe(res); // 파일 데이터를 스트림으로 클라이언트에 전달
  });
 } catch (err) {
    console.error("Error downloading file:", err);
    res.status(500).json({ error: "Error downloading file", details: err.message });
  }
});

// 서버 실행
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
