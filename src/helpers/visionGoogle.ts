
import { Request, Response, response } from 'express';
import multer from 'multer'
const vision = require('@google-cloud/vision')
import path from 'path'
import fs from 'fs'

const CREDENTIALS  = JSON.parse(JSON.stringify({
  "type": "service_account",
  "project_id": "regal-timing-408520",
  "private_key_id": "77dcf2b687aef66c4c297fb9fb16b62089d9e695",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDSpaVgeDCsfEau\nUJmhTujLaG7RDi2UYYVok2p6IH8H309U83hdm6qVPYUlIY+lNL2ObZsV7IbfkDaP\nXNf3clMTHlTsAtG229DlNku6nsdnmuFVO6GTJ5omawtU9h74qLcBf0MV3okN3a7K\nynvLd6+TsvLVo97F/OR2yR84an6UrHDl4YLFKIULcl306MmfKfIHLVGcDyv7ZAbq\n6PFQbDzCGZ6gq8QUyBHpND8qac3i83f69YZPNx/r6JsxL+QkEGUx921DML7xb5HX\n/Bi5s/yhsZd1y2rU4P6WvsDROrU1UaVe5cD5gpnTdkLTOn2f64XlbSpRBI7C58Qq\nOYneJ9qTAgMBAAECggEAZvgaE0ItaOOHGYbE0plkKqpuITsxBKt3L1uAXRqtfgen\nG/u4BuolRLbB8xiowzU4w/rIKLtqYrZ4NTRJTehQu7PEB2qJYT2qq6ES+7LJ/tcy\n9xsjLG/bZpRFAc8d7KdsbgrrnDEgBesrmm3IffmPlj+PfOeR6m5or7g4zrcgEUQn\nELI9SfFrTQ7UaSymEVIEjlsWkFuPhldt4e+UWyEa7AqioXR0fXuCSTv06pcOiNQs\nLqETPo1XqOHTKLUJ9FjdkLPbwIOpko64ZCYmK4PY2y+D9L2cmHXPNetEERf2cYPX\nV4vdu4ppaEcBJL/4ZnXYGfZ7kdxblATA0SIwoghuYQKBgQDqrVTiS6alpU3Be3Y8\noycbegOIFwmTn1lRwMsGE51F8ZmRHfqhB3+vmDHg0LC1aWqybQ1M/yXgTplOy03s\nYFdtj6k209P7D7myzrvkqm6/FT+jA8aFNqqInC+QFn+tjJsSGmo+FJrrRkpAdRrr\n5gbTwp+GAJZpvdH1nyvZDUE3twKBgQDlyV4y/xA7BSWngIDH4N94isz8/HRZ+4TO\n+wWr/bMjlj/Qz2GH6jfcSQhDxJxqNSxrZLIHpMR0BIqv8ht7WXOXDuBAsUbilNWm\n4mTpWKz+I8KLBqOvAcLyCIowJrRy81S5+xlvdvrBvYe8FKk6qywE5HPoE0BsriPt\noQ18GwRcBQKBgQCw19FBflSkOr8vcEQXSbMsp3OF2CZlUg1S5/+WIq2/iWJ50qeN\nNUNpJT1g9qJS8o9uyXLedN8r+s7Ya6fa2nbHnxyarmHtrVn4foVkuXIfGHoN88hj\nlmBH9bp50BqCw5QPvkwVYB2l8h/+FsEkxwCaDu17Y3H1WQ+hEkNOmwhsXQKBgQDP\nYqoNxH3VhpOxVRzlSGLn2/2d5grsm0AFvjAkRdhDqfr2bfRMQmsf+Rnob63rfQoV\n8s9qbp6PRvoUSaHb9aOJFff26whavpEFCRaiM1IOHCAccWWRMTnMT0DIrGX3yP0S\nzTjrjKpL6M50RQFm3c3grH6fWaCvdYsfkFcnRwrsMQKBgQDOb+PtWyyKLZKUHNhL\nfkt10YQz5rOlH7OsrYPENBvSza3RUav0Em0RKYUTPxV3e9z0g37Z6tg2lnOtkMEM\nTLHRLCHH6zxNLsTAiHBUsm0TFEHWqGQeE6hJsBbe8gfx3Ij0wHDWoCwyVWac1ydD\n/Iuwqdm1U7jiIx+Guf7QNE6ghw==\n-----END PRIVATE KEY-----\n",
  "client_email": "area54imagenes@regal-timing-408520.iam.gserviceaccount.com",
  "client_id": "114443173704172774026",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/area54imagenes%40regal-timing-408520.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}))

const  CONFIG = {
    credentials: {
        private_key: CREDENTIALS.private_key,
        client_email: CREDENTIALS.client_email
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
            cb(null,'./uploads')
        },
          filename: (req, file, cb) =>
        {
                
          cb(null, file.originalname)
        }
    })


    export const getNumeroGuiaImage = async (): Promise <any> => {
       
        const client = new vision.ImageAnnotatorClient(CONFIG);
        console.log(client)
        const file = fs.readdirSync('uploads')
        let arrImage = []

        if(file.length>0)
        {
          for await(const image of file){

            
            let [result] = await client.textDetection('uploads/'+ image)
            const texto = result.fullTextAnnotation.text.search('Guía: ')
            const  nGuia = result.fullTextAnnotation.text.slice(texto+6,texto+13)
            
            fs.unlinkSync('uploads/'+ image)

            arrImage.push({nImage: image, nGuia: nGuia.trim()}) 
            
          }
                      

        } else 
        {
            return arrImage.push({nImage:`La Cantidad de arvhivos subidos es:  ${file.length}`, nGuia: '0' }) 
        }
        
        
        return arrImage

         
    }

    export default multer({storage})