import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1755974901866 implements MigrationInterface {
    name = 'CreateTables1755974901866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "dueDate"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."task_tests_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "isArchive"`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "testName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "testDescription" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "testType" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "route" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "method" character varying(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "requestBody" json`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "expectedResponse" json`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "actualResponse" json`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "isPassed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "errorMessage" text`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "responseTime" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."task_tests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "status" character varying(20) NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."task_tests_status_enum" AS ENUM('todo', 'inprogress', 'done', 'block', 'inreview')`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "status" "public"."task_tests_status_enum" NOT NULL DEFAULT 'todo'`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "responseTime"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "errorMessage"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "isPassed"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "actualResponse"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "expectedResponse"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "requestBody"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "method"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "route"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "testType"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "testDescription"`);
        await queryRunner.query(`ALTER TABLE "task_tests" DROP COLUMN "testName"`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "isArchive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."task_tests_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "priority" "public"."task_tests_priority_enum" NOT NULL DEFAULT 'high'`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "dueDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "task_tests" ADD "title" character varying(255) NOT NULL`);
    }

}
