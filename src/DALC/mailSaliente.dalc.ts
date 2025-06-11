import {getRepository} from "typeorm"
import {MailSaliente} from "../entities/MailSaliente"

export const mailSaliente_send_DALC = async (mailSalienteAMandar: MailSaliente) => {
    const resultToSave = getRepository(MailSaliente).create(mailSalienteAMandar)
    const result = await getRepository(MailSaliente).save(resultToSave)
    return result
}
