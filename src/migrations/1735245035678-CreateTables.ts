import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1735245035678 implements MigrationInterface {
    name = 'CreateTables1735245035678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "title" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "title" DROP NOT NULL`);
    }

}
