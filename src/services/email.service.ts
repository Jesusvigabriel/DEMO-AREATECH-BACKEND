import { getRepository, QueryFailedError } from 'typeorm'
import nodemailer from 'nodemailer'
import { emailServer_getByEmpresa } from '../DALC/emailServers.dalc'
import { MailSaliente } from '../entities/MailSaliente'
import { EmailServer } from '../entities/EmailServer'

interface SendEmailOptions {
  idEmpresa: number
  destinatarios: string
  titulo: string
  cuerpo: string
  conCopia?: string
  conCopiaOculta?: string
  adjuntos?: { filename: string; path: string }[]
  nombreRemitente?: string
  emailRemitente?: string
  idEmailServer?: number
  idEmailTemplate?: number
}

export class EmailService {
  private static instance: EmailService
  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  public async sendEmail(options: SendEmailOptions): Promise<MailSaliente> {
    const servidor = options.idEmailServer
      ? await getRepository(EmailServer).findOne({ where: { Id: options.idEmailServer } as any })
      : await emailServer_getByEmpresa(options.idEmpresa)
    const defaults = {
      Host: 'localhost',
      Puerto: 25,
      Seguro: false,
      Usuario: '',
      Password: '',
      DesdeEmail: 'noreply@example.com',
      DesdeNombre: 'Sistema'
    }

    const cfg = servidor || (defaults as any)

    const host = cfg.Host || cfg.host
    const port = cfg.Puerto ?? cfg.Port ?? 25
    const secure = cfg.Seguro ?? cfg.Secure ?? false
    const user = cfg.Usuario ?? cfg.Username ?? ''
    const pass = cfg.Password ?? ''
    const fromEmail = options.emailRemitente || cfg.DesdeEmail || cfg.FromEmail
    const fromName = options.nombreRemitente || cfg.DesdeNombre || cfg.FromName

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined
    })

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.destinatarios,
      cc: options.conCopia,
      bcc: options.conCopiaOculta,
      subject: options.titulo,
      html: options.cuerpo,
      attachments: options.adjuntos
    }

    const repo = getRepository(MailSaliente)
    const registro = repo.create({
      Destinatarios: options.destinatarios,
      Titulo: options.titulo,
      Cuerpo: options.cuerpo,
      Adjuntos: JSON.stringify(options.adjuntos || []),
      ConCopia: options.conCopia || '',
      ConCopiaOculta: options.conCopiaOculta || '',
      NombreRemitente: fromName,
      EmailRemitente: fromEmail,
      IdEmailServer: servidor?.Id,
      IdEmailTemplate: options.idEmailTemplate,
      Enviado: false,
      CantidadIntentos: 0,
      FechaEnvio: new Date()
    })

    try {
      console.log('Sending email', {
        fromEmail,
        fromName,
        to: options.destinatarios,
        subject: options.titulo,
        bodyPreview: options.cuerpo.slice(0, 100),
        attachments: mailOptions.attachments?.map(a => a.filename)
      })
      await transporter.sendMail(mailOptions)
      registro.Enviado = true
    } catch (err) {
      console.error('SendMail error:', err)
      registro.Enviado = false
    } finally {
      registro.CantidadIntentos += 1
      registro.FechaEnvio = new Date()
      try {
        await repo.save(registro)
      } catch (error) {
        if (error instanceof QueryFailedError) {
          console.error('Error saving MailSaliente record:', error.message, {
            registro
          })
        } else {
          console.error('Unexpected error saving MailSaliente record:', error)
        }
      }
    }

    return registro
  }
}

export const emailService = EmailService.getInstance()
