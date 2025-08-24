import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1756062152849 implements MigrationInterface {
    name = 'CreateTables1756062152849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "dueDate" TIMESTAMP, "members" character varying(100) array, "tasks" character varying(100) array, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "testName" character varying(100) NOT NULL, "testDescription" character varying(255) NOT NULL, "testType" character varying(50) NOT NULL, "route" character varying(50) NOT NULL, "method" character varying(10) NOT NULL, "requestBody" json, "expectedResponse" json, "actualResponse" json, "isPassed" boolean NOT NULL DEFAULT false, "errorMessage" text, "responseTime" integer NOT NULL DEFAULT '0', "status" character varying(20) NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a50ff7e5c1d51a6e3158297a5fa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "project_tests"`);
        await queryRunner.query(`DROP TABLE "projects"`);
    }

}
