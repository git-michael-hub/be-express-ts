import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1735244800150 implements MigrationInterface {
    name = 'CreateTables1735244800150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "title" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "title" SET NOT NULL`);
    }

}
