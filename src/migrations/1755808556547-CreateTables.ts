import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1755808556547 implements MigrationInterface {
    name = 'CreateTables1755808556547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_tests_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user_tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying(255) NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "lastLoginAt" TIMESTAMP, "role" "public"."user_tests_role_enum" NOT NULL DEFAULT 'user', "position" character varying(100) array, "team" character varying(100) array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2a0ec1f997a24f8ae07d0cfe1c4" UNIQUE ("email"), CONSTRAINT "PK_eab7a9f9435200fb332a5752f2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_tests_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."task_tests_status_enum" AS ENUM('todo', 'inprogress', 'done', 'block', 'inreview')`);
        await queryRunner.query(`CREATE TABLE "task_tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "dueDate" TIMESTAMP NOT NULL DEFAULT now(), "priority" "public"."task_tests_priority_enum" NOT NULL DEFAULT 'high', "isArchive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."task_tests_status_enum" NOT NULL DEFAULT 'todo', CONSTRAINT "PK_20ad95056d6de98a4dddd4e8226" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "position" character varying(100) array`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "team"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "team" character varying(100) array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "team"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "team" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "position" character varying(100)`);
        await queryRunner.query(`DROP TABLE "task_tests"`);
        await queryRunner.query(`DROP TYPE "public"."task_tests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_tests_priority_enum"`);
        await queryRunner.query(`DROP TABLE "user_tests"`);
        await queryRunner.query(`DROP TYPE "public"."user_tests_role_enum"`);
    }

}
