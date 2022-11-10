import e, { Request, Response, NextFunction, Router } from 'express';
import db from '../models';
import path from 'path';
import fs from 'fs';
import mime from 'mime';
import {musicUploadModule,albumCoverUploadModule,isLoggedIn,checkProperUser} from './middleware';

const RouterForMusicData = Router();

/* RouterForMusicData.use(isLoggedIn); */
RouterForMusicData.post('/deleteMusic',isLoggedIn,async(req:Request,resp:Response,next:NextFunction)=>{
    try{
        const {
            musicId,url,
            albumCoverUrl
        } = req.body;
        const albumCoverPath = path.join(__dirname,'../static','albumImage',`${albumCoverUrl}`);
        const musicPath = path.join(__dirname,'../static','music',`${url}`);

        console.log(albumCoverPath);
        console.log(musicPath);

        await fs.unlinkSync(albumCoverPath);
        await fs.unlinkSync(musicPath);

        await db.music.destroy({
            where:{musicId}
        })
        resp.status(200).json({message:'삭제 성공!'});
        
    }catch(err){
        console.error(err);
        resp.status(500).json({message:'파일 삭제 오류 발생!'});
    }
})

RouterForMusicData.get('/getMusicList/:limit/:pageNum',isLoggedIn,async(req:Request,resp:Response,next:NextFunction)=>{
    try{
        const {userId}=req.user!;
        const {limit,pageNum} = req.params;
        console.log(`limit : ${limit}`);
        console.log(`pageNum : ${pageNum}`);
        const musicList = await db.music.findAll({
            where:{uploader:userId},
            attributes:["musicId","artist","title","url","genre","albumCoverUrl"],
            offset:Number(limit)*(Number(pageNum)-1),
            limit:Number(limit),
            order: [["musicId","DESC"]],        
        })
        const isLast = musicList.length===0?
            true:(musicList.length%Number(limit)!==0?true:false);
        resp.status(200).json({musicList,isLast});
    }catch(err){
        console.error(err);
        resp.status(500).json({message:'데이터 베이스 오류 발생!'});
    }
})

RouterForMusicData.post('/upload_music_db',isLoggedIn,async(req:Request,resp:Response,next:NextFunction)=>{
    if(!req.user){
        resp.status(401).json({message:'세션 만료! 로그인을 해주세요!'});
    }
    try{
        const {userId} = req.user!;
        const {artist,title,url,albumCoverUrl,size,genre} = req.body;
        const music = await db.music.create({artist,title,url,albumCoverUrl,size,genre,uploader:userId});
        console.log(music);
        resp.status(200).json({message:'db 추가 성공',music});
    }catch(err){
        console.error(err);
        resp.status(500).json({message:'db crud 오류!'});
    }
})

RouterForMusicData.post('/upload_music',isLoggedIn,musicUploadModule.single('music_file'),(req:Request, res, next) => {
    console.log(req.file);
    res.status(200).json({message:'파일저장 완료!',filename:req.file!.filename});
})

RouterForMusicData.post('/upload_album_cover',isLoggedIn,albumCoverUploadModule.single('album_cover'),(req:Request,res:Response,next)=>{
    console.log(req.file);
    res.status(200).json({message:'이미지 파일 저장 완료!',filename:req.file!.filename});
})

RouterForMusicData.get('/get_music_data', (req: Request, resp: Response) => {
    const filePath = path.join(__dirname, '../static', '/music', 'sample.mp3');
    const contentType = mime.getType(filePath)! as string;
    const fileStat = fs.statSync(filePath);
    const fileSize = fileStat.size;

    const range = req.headers.range;
    if (!range) {
        const header = { 'Content-Type': 'audio/mpeg' };
        resp.writeHead(200, header);
        resp.end();
    } else {
        const MAX_CHUNK_SIZE = 1000 * 1000;
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const _end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const end = Math.min(_end, start + MAX_CHUNK_SIZE);
        console.log(`start : ${start}`);
        console.log(`end : ${end}`);
        let header = {};
        if (start < end-1 && start !== fileSize) {
            header = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Type': contentType,
                'Content-Length': (end - start) - 1,
            }
            resp.writeHead(206, header);
            const readStream = fs.createReadStream(filePath, { start, end });
            readStream.pipe(resp);
        } else if(start===fileSize){
            header = {
                'Content-Range': `bytes ${start-1}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Type': contentType,
                'Content-Length': fileSize-1,
            }
            resp.writeHead(200,header);
            const readStream = fs.createReadStream(filePath,{highWaterMark:MAX_CHUNK_SIZE});
            readStream.pipe(resp);
        }


    }

})

export default RouterForMusicData;