import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MoveDespachoPlazaToOrdenDetalle169 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "orderdetalle",
            new TableColumn({
                name: "despacho_plaza",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.query(
            `UPDATE orderdetalle od
             INNER JOIN ordenes o ON od.ordenId = o.id
             SET od.despacho_plaza = o.despacho_plaza`
        );

        await queryRunner.dropColumn("ordenes", "despacho_plaza");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "ordenes",
            new TableColumn({
                name: "despacho_plaza",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.query(
            `UPDATE ordenes o
             INNER JOIN orderdetalle od ON od.ordenId = o.id
             SET o.despacho_plaza = od.despacho_plaza`
        );

        await queryRunner.dropColumn("orderdetalle", "despacho_plaza");
    }
}
