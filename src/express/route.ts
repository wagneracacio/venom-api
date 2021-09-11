import wppconnect from '@wppconnect-team/wppconnect'
import { Router } from 'express'
import { body, param } from 'express-validator';
import { considerAlias, phoneSanitizer, validationResultReturn } from './helper';
import fileUpload from 'express-fileupload';
import { WppConnect } from '../controller';

function routeBuilder(wppconnect:wppconnect.Whatsapp): Router {
    const wppconnectRoutes = Router();
    const connection = new WppConnect(wppconnect);

    //https://api.z-api.io/instances/MINHA_INSTANCE/token/MEU_TOKEN
    //Instância
    wppconnectRoutes.get('/use-here', connection.useHere());
    wppconnectRoutes.get('/qr-code', connection.qrCode());
    wppconnectRoutes.get('/qr-code/image', connection.qrCodeImage());
    wppconnectRoutes.get('/restart', connection.restart());
    wppconnectRoutes.get('/disconnect', connection.disconnect());
    wppconnectRoutes.get('​/status', connection.status());
    wppconnectRoutes.get('/restore-session', connection.restoreSession());
    wppconnectRoutes.get('/all-unread-messages', connection.allunreadmessages());
    //Mensagens
    wppconnectRoutes.post('/send-text', [
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('content').customSanitizer(considerAlias('message')).notEmpty(),
        validationResultReturn(),
        connection.sendText()
    ]);
    wppconnectRoutes.post('/send-text-options', [
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('content').customSanitizer(considerAlias('message')).notEmpty(),
        body('options'),
        validationResultReturn(),
        connection.sendTextOptions()
    ]);
    wppconnectRoutes.post('/send-contact',[
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('contactsId').customSanitizer(considerAlias('contactId')).customSanitizer(phoneSanitizer('contactPhone')).notEmpty(),
        validationResultReturn(),
        connection.sendContact()
    ]);
    wppconnectRoutes.post('/send-image',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('caption').customSanitizer(considerAlias('content')).customSanitizer(considerAlias('message')),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('image')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendImage()
    ]);
    wppconnectRoutes.post('/send-status-image',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('caption').customSanitizer(considerAlias('content')).customSanitizer(considerAlias('message')),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('image')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendImage()
    ]);
    wppconnectRoutes.post('/send-image-sticker',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('image')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendImageAsSticker()
    ]);
    wppconnectRoutes.post('/send-image-stickergif',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('image')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendImageAsStickerGif()
    ]);
    wppconnectRoutes.post('/send-audio',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('caption').customSanitizer(considerAlias('content')).customSanitizer(considerAlias('message')),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('audio')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendAudio()
    ]);
    wppconnectRoutes.post('/send-video',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('caption').customSanitizer(considerAlias('content')).customSanitizer(considerAlias('message')),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('video')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendVideo()
    ]);
    wppconnectRoutes.post('/send-document',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
        body('to').customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('caption').customSanitizer(considerAlias('content')).customSanitizer(considerAlias('message')),
        body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('video')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendDocument()
    ]);
    wppconnectRoutes.post('/send-link',[
        body('chatId').customSanitizer(considerAlias('to')).customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('url').customSanitizer(considerAlias('linkUrl')).notEmpty(),
        body('title').customSanitizer(considerAlias('content')).customSanitizer(considerAlias('message')),
        validationResultReturn(),
        connection.sendLink()
    ]);
    wppconnectRoutes.post('/read-message',[
        body('chatId').customSanitizer(considerAlias('to')).customSanitizer(phoneSanitizer('phone')).notEmpty(),
        validationResultReturn(),
        connection.readMessage()
    ]);
    //#TODO: Issue Open 'https://github.com/orkestral/wppconnect/issues/977'
    wppconnectRoutes.delete('/messages',[
        body('chatId').customSanitizer(considerAlias('to')).customSanitizer(phoneSanitizer('phone')).notEmpty(),
        body('messageId').notEmpty(),
        validationResultReturn(),
        connection.messagesDelete()
    ]);
    //Status
    wppconnectRoutes.post('/send-text-status',[
        body('status').customSanitizer(considerAlias('message')).customSanitizer(considerAlias('content')).notEmpty(),
        validationResultReturn(),
        connection.sendStatusText()
    ]);
    //TODO: Feito mas não funciona retorna sem erro sem alteração
    wppconnectRoutes.post('/send-image-status',[
        fileUpload({
            limits: { fileSize: 16 * 1024 * 1024 },
          }),
          body('to').customSanitizer(considerAlias('chatId')).customSanitizer(phoneSanitizer('phone')),
          body('base64').customSanitizer(considerAlias('url')).customSanitizer(considerAlias('image')).customSanitizer(considerAlias('file')),
        validationResultReturn(),
        connection.sendImageStatus()
    ]);
    //Chats
    wppconnectRoutes.get('/chats', connection.chats());
    wppconnectRoutes.get('/chats/:phone',[
        param('phone').customSanitizer(phoneSanitizer()).notEmpty(),
        connection.chatsPhone()
    ]);
    wppconnectRoutes.get('​/chat-messages/:phone', connection.chatMessages());
    //Contatos
    wppconnectRoutes.get('​/contacts', connection.contacts());
    wppconnectRoutes.get('​/contacts/:phone', connection.contactsPhone());
    wppconnectRoutes.get('​/profile-picture', connection.profilePicture());
    wppconnectRoutes.get('​/phone-exists/:phone', connection.phoneExists());
    //Grupo
    wppconnectRoutes.post('​/create-group', connection.createGroup());
    wppconnectRoutes.post('​/update-group-name', connection.updateGroupName());
    wppconnectRoutes.post('​/add-admin', connection.addAdmin());
    wppconnectRoutes.post('​/remove-admin', connection.removeAdmin());
    wppconnectRoutes.post('​/add-participant', connection.addParticipant());
    wppconnectRoutes.post('​/remove-participant', connection.removeParticipant());
    wppconnectRoutes.post('​/leave-group', connection.leaveGroup());
    wppconnectRoutes.get('​​/group-metadata​/{phone}', connection.groupMetadataPhone());
    //Fila
    wppconnectRoutes.get('​​/queue', connection.queue());
    wppconnectRoutes.delete('​​/queue', connection.queueDelete());
    //Webhooks
    wppconnectRoutes.put('​​​/update-webhook-delivery', connection.updateWebhookDelivery());
    wppconnectRoutes.put('​​​/update-webhook-disconnected', connection.updateWebhookDisconnected());
    wppconnectRoutes.put('​​​/update-webhook-received', connection.updateWebhookReceived());
    wppconnectRoutes.put('​​​/update-webhook-message-status', connection.updateWebhookMessageStatus());

    return wppconnectRoutes
}

export {
    routeBuilder
}