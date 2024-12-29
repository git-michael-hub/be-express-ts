import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1735244976096 implements MigrationInterface {
    name = 'CreateTables1735244976096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "title" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "title" DROP NOT NULL`);
    }

}
