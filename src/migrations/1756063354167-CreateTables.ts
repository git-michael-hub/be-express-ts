import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1756063354167 implements MigrationInterface {
    name = 'CreateTables1756063354167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_tests" DROP COLUMN "route"`);
        await queryRunner.query(`ALTER TABLE "project_tests" ADD "route" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_tests" DROP COLUMN "route"`);
        await queryRunner.query(`ALTER TABLE "project_tests" ADD "route" character varying(50) NOT NULL`);
    }

}
