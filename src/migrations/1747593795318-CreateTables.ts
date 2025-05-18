import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1747593795318 implements MigrationInterface {
    name = 'CreateTables1747593795318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "date" TO "dueDate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "dueDate" TO "date"`);
    }

}
