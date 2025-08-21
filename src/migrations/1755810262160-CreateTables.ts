import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1755810262160 implements MigrationInterface {
    name = 'CreateTables1755810262160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP CONSTRAINT "UQ_2a0ec1f997a24f8ae07d0cfe1c4"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "isEmailVerified"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_tests_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "team"`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "testName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "testDescription" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "testType" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "route" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "method" character varying(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "requestBody" json`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "expectedResponse" json`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "actualResponse" json`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "isPassed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "errorMessage" text`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "responseTime" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "status" character varying(20) NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "responseTime"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "errorMessage"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "isPassed"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "actualResponse"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "expectedResponse"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "requestBody"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "method"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "route"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "testType"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "testDescription"`);
        await queryRunner.query(`ALTER TABLE "user_tests" DROP COLUMN "testName"`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "team" character varying(100) array`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "position" character varying(100) array`);
        await queryRunner.query(`CREATE TYPE "public"."user_tests_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "role" "public"."user_tests_role_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "lastLoginAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "email" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD CONSTRAINT "UQ_2a0ec1f997a24f8ae07d0cfe1c4" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "user_tests" ADD "name" character varying(100) NOT NULL`);
    }

}
