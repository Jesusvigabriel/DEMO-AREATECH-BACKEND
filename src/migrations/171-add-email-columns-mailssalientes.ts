import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailColumnsMailssalientes171 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "mailssalientes",
            new TableColumn({
                name: "IdEmailServer",
                type: "int",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "mailssalientes",
            new TableColumn({
                name: "IdEmailTemplate",
                type: "int",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("mailssalientes", "IdEmailTemplate");
        await queryRunner.dropColumn("mailssalientes", "IdEmailServer");
    }
}
