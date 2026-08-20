const express=require("express");
const multer=require("multer");
const path=require("path");
const fs=require("fs");

const app=express();
const PORT=process.env.PORT||3000;
const uploadDir=path.join(__dirname,"uploads");
fs.mkdirSync(uploadDir,{recursive:true});

const storage=multer.diskStorage({
 destination:(req,file,cb)=>cb(null,uploadDir),
 filename:(req,file,cb)=>{
   const safe=Date.now()+"-"+file.originalname.replace(/[^a-zA-Z0-9._-]/g,"_");
   cb(null,safe);
 }
});
const upload=multer({
 storage,
 limits:{fileSize:200*1024*1024},
 fileFilter:(req,file,cb)=>{
   cb(null, file.mimetype.startsWith("video/"));
 }
});

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use("/uploads",express.static(uploadDir));

let videos=[];

app.get("/api/videos",(req,res)=>res.json(videos));

app.post("/api/upload",upload.single("video"),(req,res)=>{
 if(!req.file) return res.status(400).json({error:"Please upload a video."});
 const video={
   id:Date.now().toString(),
   title:req.body.title||"Untitled video",
   creator:req.body.creator||"@you",
   url:"/uploads/"+req.file.filename,
   likes:0,
   comments:0,
   createdAt:new Date().toISOString()
 };
 videos.unshift(video);
 res.json(video);
});

app.post("/api/videos/:id/like",(req,res)=>{
 const v=videos.find(x=>x.id===req.params.id);
 if(!v)return res.status(404).json({error:"Video not found"});
 v.likes++;
 res.json(v);
});

app.listen(PORT,()=>console.log(`YOUR VIDEO XR running on port ${PORT}`));