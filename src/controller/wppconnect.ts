import wppconnect from '@wppconnect-team/wppconnect';
import { Request, Response } from 'express';
import { base64MimeType, resendMessages } from '../express/helper';
import path from 'path';
import axios from 'axios';
import { matchedData} from 'express-validator';
import fileUpload from 'express-fileupload';

export default class WppConnect {
    connection:wppconnect.Whatsapp
    constructor(wppconnect:wppconnect.Whatsapp) {
        this.connection = wppconnect;
    }
    private async data_file(to:string, base64:string, caption:string, mimetype:any, filename:any, file:fileUpload.FileArray|undefined, type:string){
        
        var src:any = '';
        if(base64.startsWith('http')){
            let download = await axios.get(base64, {
                responseType: 'arraybuffer'
                })
                mimetype = download.headers['content-type']
            let body = Buffer.from(download.data, 'binary').toString('base64')
            base64 = "data:"+mimetype+";base64,"+body
        }
        if (!!file){
            if(type == 'image'){
                src = file.image;
            }
            else if(type == 'audio'){
                src = file.audio;
            }
            else if(type == 'video'){
                src = file.video
            }
            else if(type == 'file'){
                src = file.file
            }
            if (!!file && !!src && !Array.isArray(src)){
                base64 = "data:"+src.mimetype+";base64,"+src.data.toString('base64');
                mimetype = src.mimetype;
                filename = src.name;
            }
        }
        
        if (!mimetype && !!filename && !!path.extname(filename))
            mimetype = 'image/'+path.extname(filename).slice(1);

        let base64HasMime = base64MimeType(base64);
        mimetype = !!base64HasMime ? base64HasMime : mimetype;

        if (!base64HasMime && !!mimetype){
            base64 = "data:"+mimetype+";base64,"+base64;
        }
        if (type != 'audio'){
            if (!filename && !!mimetype)
                filename = 'arquivo.'+mimetype.split('/')[1];
        }

        return { to, base64, filename, caption, mimetype}
    }
    useHere(){
        return async (req:Request, res:Response) => {
            try {
                console.log("Use Here Action");
                const wppconnectReturn = await this.connection.useHere();
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    qrCode(){
        return async (req:Request, res:Response) => {
            try{
                console.log("qrCode");
                const wppconnectReturn = await this.connection.getQrCode();
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    qrCodeImage(){
        return async (req:Request, res:Response) => {
            try{
                console.log("qrCode");
                const wppconnectReturn = await this.connection.getQrCode();
                res.status(200).send(`<img src='${wppconnectReturn.base64Image}'>`);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    allunreadmessages(){
        return async (req:Request, res:Response) => {
            try{
                console.log("AllUnreadMessages");
                const resend = req.query.resend;
                const wppconnectReturn = await this.connection.getAllUnreadMessages()
                console.log(wppconnectReturn)
                if(!!resend){
                    resendMessages(wppconnectReturn)
                    res.status(201).send();
                } else {
                    res.status(200).send(wppconnectReturn);
                }
    
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    restart(){
        return async (req:Request, res:Response) => {
            try {
                console.log("Restart Service Action");
                const wppconnectReturn = await this.connection.restartService();
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    disconnect(){
        return async (req:Request, res:Response) => {}
    }
    
    status(){
        return async (req:Request, res:Response) => {
            try {
                console.log("Restart Service Action");
                const wppconnectReturn = await this.connection.getConnectionState();
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    restoreSession(){
        return async (req:Request, res:Response) => {}
    }
    //Mensagens
    sendText(){
        return async (req:Request, res:Response) => {
            try{
                const to = req.body.to;
                const content = req.body.content;
                const quotedMsg = req.body.quotedMsg;
                
                let wppconnectReturn
                if (!!quotedMsg){                
                    wppconnectReturn = await this.connection.reply(to, content, quotedMsg);
                } else {
                    wppconnectReturn = await this.connection.sendText(to, content);
                }
                res.status(200).send(wppconnectReturn);
            } catch(error){
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendStatusText(){
        return async (req:Request, res:Response) => {
            try{
                const content = req.body.content;
    
                let wppconnectReturn = await this.connection.sendText('status@broadcast', content);
                res.status(200).send(wppconnectReturn);
            } catch(error){
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendTextOptions(){
        return async (req:Request, res:Response) => {
            try{
                const to = req.body.to;
                const content = req.body.content;
                const quotedMsg = req.body.quotedMsg;
                
                let wppconnectReturn
                if (!!quotedMsg){                
                    wppconnectReturn = await this.connection.reply(to, content, quotedMsg);
                } else {
                    wppconnectReturn = await this.connection.sendMessageOptions(to, content, {  textColor: 4294967295,
                        backgroundColor: 4286237605,
                        font: 2});
                }
                res.status(200).send(wppconnectReturn);
            } catch(error){
                res.status(500).send({"error":error});
            }
        }
    }
    sendContact(){
        return async (req:Request, res:Response) => {
            try{
                const to = req.body.to;
                const contactsId = <string> req.body.contactsId;
                const name = req.body.name;
    
                const valid = await this.connection.checkNumberStatus(contactsId);
                if (valid.status != 200) {
                    res.status(500).send({"error":valid})
                    return
                }
            
                const wppconnectResponse = await this.connection.sendContactVcard(to,contactsId,name);
                res.status(200).send(wppconnectResponse)
            } catch(error) {
                res.status(500).send({"error":error})
            }
    
        }
    }
    
    sendImage(){
        return async (req:Request, res:Response) => {
            try{
                let { to, base64, filename, caption, mimetype} = await this.data_file(req.body.to, req.body.base64,
                                                                                    req.body.caption,req.body.mimetype,
                                                                                    req.body.filename, req.files, 'image')
    
                if (!mimetype){
                    res.status(400).send({
                        "errors": [
                          {
                            "location": "body",
                            "msg": "Invalid value",
                            "param": "mimetype"
                          }
                        ]
                      }
                      );
                    return;
                }
                console.log("mimetype :",mimetype);
                console.log("filename :",filename);
                console.log("sendImage :",base64.slice(0,30)+'...');
                const wppconnectReturn = await this.connection.sendImageFromBase64(to, base64, filename, caption);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendImageAsSticker(){
        return async (req:Request, res:Response) => {
            try{
                let to = req.body.to;
                let base64:string = req.body.base64;
    
                console.log("sendImage :",base64.slice(0,30)+'...');
                const wppconnectReturn = await this.connection.sendImageAsSticker(to, base64);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    sendImageAsStickerGif(){
        return async (req:Request, res:Response) => {
            try{
                let to = req.body.to;
                let base64:string = req.body.base64;
    
                console.log("sendImage :",base64.slice(0,30)+'...');
                const wppconnectReturn = await this.connection.sendImageAsStickerGif(to, base64);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendAudio(){
        return async (req:Request, res:Response) => {
            try{

                let { to, base64, filename, caption, mimetype} = await this.data_file(req.body.to, req.body.base64,
                                                                                    req.body.caption,req.body.mimetype,
                                                                                    req.body.filename, req.files, 'audio')
    
                if (!mimetype){
                    res.status(400).send({
                        "errors": [
                            {
                            "location": "body",
                            "msg": "Invalid value",
                            "param": "mimetype"
                            }
                        ]
                        }
                        );
                    return;
                }
    
                console.log("mimetype :",mimetype);
                console.log("audio :",base64.slice(0,30)+'...');
                const wppconnectReturn = await this.connection.sendPttFromBase64(to, base64, 'Voice Audio');
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendVideo(){
        return async (req:Request, res:Response) => {
            try{
                let { to, base64, filename, caption, mimetype} = await this.data_file(req.body.to, req.body.base64,
                                                                                    req.body.caption,req.body.mimetype,
                                                                                    req.body.filename, req.files, 'video')
    
                console.log("mimetype :",mimetype);
                console.log("video :",base64.slice(0,30)+'...');
                const wppconnectReturn = await this.connection.sendFileFromBase64(to, base64, 'video', caption);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendDocument(){
        return async (req:Request, res:Response) => {
            try{
                let { to, base64, filename, caption, mimetype} = await this.data_file(req.body.to, req.body.base64,
                                                                                    req.body.caption,req.body.mimetype,
                                                                                    req.body.filename, req.files, 'file')

                if (!mimetype){
                    res.status(400).send({
                        "errors": [
                          {
                            "location": "body",
                            "msg": "Invalid value",
                            "param": "mimetype"
                          }
                        ]
                      }
                      );
                    return;
                }
    
                console.log("mimetype :",mimetype);
                console.log("file :",base64.slice(0,30)+'...');
                const wppconnectReturn = await this.connection.sendFileFromBase64(to, base64, 'file', caption);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    sendLink(){
        return async (req:Request, res:Response) => {
            try {
                let chatId = req.body.chatId;
                let url=req.body.url;
                let title = req.body.title;
    
                const wppconnectReturn = await this.connection.sendLinkPreview(chatId, url, title);
                res.status(200).send(wppconnectReturn);
            } catch(error){
                res.status(500).send({"error":error});
            }
        }
    }
    
    readMessage(){
        return async (req:Request, res:Response) => {
        try{
            const chatId = req.body.chatId;
            const wppconnectReturn = await this.connection.sendSeen(chatId);
            res.status(200).send(wppconnectReturn);
        } catch(error) {
            res.status(500).send({"error":error});
        }
            
        }
    }
    
    //#TODO: Issue Open 'https://github.com/orkestral/wppconnect/issues/977'
    messagesDelete(){
        return async (req:Request, res:Response) => {
            try {
                const chatId = req.body.chatId;
                const messageId = req.body.messageId; 
                console.log("messagesDelete")
                console.log("chatId",chatId)
                console.log("messageId",messageId)
                const wppconnectReturn = await this.connection.deleteMessage(chatId,messageId);
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error}); 
            }
    
        }
    }
    //working???
    sendTextStatus(){
        return async (req:Request, res:Response) => {
            try{
                const status = req.body.status
                const wppconnectReturn = await this.connection.setProfileStatus(status);
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error}); 
            }
    
        }
    }
    //TODO: Feito mas não funciona retorna sem erro sem alteração
    sendImageStatus(){
        return async (req:Request, res:Response) => {
            try{
                let { to, base64, filename, caption, mimetype} = await this.data_file(req.body.to, req.body.base64,
                                                                                    req.body.caption,req.body.mimetype,
                                                                                    req.body.filename, req.files, 'image')
                    
                if (!mimetype){
                    res.status(400).send({
                        "errors": [
                          {
                            "location": "body",
                            "msg": "Invalid value",
                            "param": "mimetype"
                          }
                        ]
                      }
                      );
                    return;
                }
                console.log("mimetype :",mimetype);
                console.log("filename :",filename);
                console.log("sendImage :",base64.slice(0,30)+'...');
                console.log("to :",to);
                console.log("setProfilePic");
                const wppconnectReturn = await this.connection.setProfilePic(base64, to);
                console.log("wppconnectReturn: ", wppconnectReturn);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    //Chats
    chats(){
        return async (req:Request, res:Response) => {
            try{
                const wppconnectReturn = await this.connection.getAllChats();
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    chatsPhone(){
        return async (req:Request, res:Response) => {
            try{
                console.log("chatsPhone");
                const { 'phone': contactId } = matchedData(req);
                const wppconnectReturn = await this.connection.getChatById(contactId);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
            
        }
    }
    chatMessages(){
        return async (req:Request, res:Response) => {}
    }
    
    //Contatos
    contacts(){
        return async (req:Request, res:Response) => {
            try {
                console.log("");
                const wppconnectReturn = await this.connection.getAllContacts();
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    contactsPhone(){
        return async (req:Request, res:Response) => {}
    }
    
    profilePicture(){
        return async (req:Request, res:Response) => {}
    }
    
    phoneExists(){
        return async (req:Request, res:Response) => {}
    } 
    
    //Grupo not working!?
    createGroup(){
        return async (req:Request, res:Response) => {
            try{
                const groupName = req.body.name;
                const contacts = req.body.contacts;
                console.log("chatsPhone")
                const wppconnectReturn = await this.connection.createGroup(groupName, contacts);
                res.status(200).send(wppconnectReturn);
            } catch(error) {
                res.status(500).send({"error":error});
            }
            
        }
    }
    allgroups(){
        return async (req:Request, res:Response) => {
            try {
                const wppconnectReturn = await this.connection.getAllGroups(false);
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    updateGroupName(){
        return async (req:Request, res:Response) => {
            try {
                const groupid = req.body.groupid;
                const title = req.body.title;
                const wppconnectReturn = await this.connection.setGroupSubject(groupid, title);
                res.status(200).send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    addAdmin(){
        return async (req:Request, res:Response) => {
            try {
                const groupid = req.body.groupid;
                const participantid = req.body.participant;
                const wppconnectReturn = await this.connection.promoteParticipant(groupid, participantid)
                res.status(200). send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    removeAdmin(){
        return async (req:Request, res:Response) => {
            try {
                const groupid = req.body.groupid;
                const participantid = req.body.participant;
                const wppconnectReturn = await this.connection.demoteParticipant(groupid, participantid)
                res.status(200). send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    addParticipant(){
        return async (req:Request, res:Response) => {
            try {
                const groupid = req.body.groupid;
                const participantid = req.body.participant;
                const wppconnectReturn = await this.connection.addParticipant(groupid,participantid);
                res.status(200). send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    removeParticipant(){
        return async (req:Request, res:Response) => {
            try {
                const groupid = req.body.groupid;
                const participantid = req.body.participant;
                const wppconnectReturn = await this.connection.removeParticipant(groupid,participantid);
                res.status(200). send(wppconnectReturn);
            } catch (error) {
                res.status(500).send({"error":error});
            }
        }
    }
    
    leaveGroup(){
        return async (req:Request, res:Response) => {}
    }
    
    groupMetadataPhone(){
        return async (req:Request, res:Response) => {}
    }
     
    //Fila
    queue(){
        return async (req:Request, res:Response) => {}
    }
    
    queueDelete(){
        return async (req:Request, res:Response) => {}
    }
         
    //Webhooks
    updateWebhookDelivery(){
        return async (req:Request, res:Response) => {}
    }
    
    updateWebhookDisconnected(){
        return async (req:Request, res:Response) => {}
    }
    
    updateWebhookReceived(){
        return async (req:Request, res:Response) => {}
    }
    
    updateWebhookMessageStatus(){
        return async (req:Request, res:Response) => {}
    }
    
}

