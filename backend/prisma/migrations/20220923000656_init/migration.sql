-- AlterTable
CREATE SEQUENCE "participant_id_seq";
ALTER TABLE "Participant" ALTER COLUMN "id" SET DEFAULT nextval('participant_id_seq');
ALTER SEQUENCE "participant_id_seq" OWNED BY "Participant"."id";
