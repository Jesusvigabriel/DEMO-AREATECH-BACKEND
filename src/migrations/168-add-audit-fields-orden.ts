import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAuditFieldsOrden168 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "ordenes",
            new TableColumn({
                name: "usuario_creacion",
                type: "varchar",
                length: "100",
                isNullable: true,
            })
        );
        await queryRunner.addColumn(
            "ordenes",
            new TableColumn({
                name: "usuario_modificacion",
                type: "varchar",
                length: "100",
                isNullable: true,
            })
        );
        await queryRunner.addColumn(
            "ordenes",
            new TableColumn({
                name: "fecha_modificacion",
                type: "timestamp",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("ordenes", "fecha_modificacion");
        await queryRunner.dropColumn("ordenes", "usuario_modificacion");
        await queryRunner.dropColumn("ordenes", "usuario_creacion");
    }
}
