import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1756929151333 implements MigrationInterface {
    name = 'CreateTables1756929151333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationToken" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationToken"`);
    }

}
