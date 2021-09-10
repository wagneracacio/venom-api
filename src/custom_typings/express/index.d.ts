import { Whatsapp } from '@wppconnect-team/wppconnect'
declare global {
    namespace Express {
        interface Request {
            wpconnect?: Whatsapp ;
        }
    }  
}