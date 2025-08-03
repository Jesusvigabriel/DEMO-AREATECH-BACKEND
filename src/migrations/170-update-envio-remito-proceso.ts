import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnvioRemitoProceso170 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "UPDATE email_proceso_config SET Proceso = 'ENVIO_REMITO' WHERE Proceso = 'ENVIAR_REMITO'"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "UPDATE email_proceso_config SET Proceso = 'ENVIAR_REMITO' WHERE Proceso = 'ENVIO_REMITO'"
        );
    }
}
