import e, { Request, Response, NextFunction } from "express";
import fs from 'fs';
import path from 'path';


export const uploadFileFunc = (req: Request, filePath: string): Promise<string | Error> => {
    return new Promise((resolve, reject) => {
        let mp3_file = fs.createWriteStream(filePath);

        mp3_file.on('open', function (fd) {
            req.on('data', function (data) {
                console.log("loading... \n");
                mp3_file.write(data);
            });
            req.on('error',(err)=>{
                resolve(err);
            })
            req.on('end', function () {
                console.log("finalizing...");
                mp3_file.end();
                resolve(filePath);
            });
        });
    })
}