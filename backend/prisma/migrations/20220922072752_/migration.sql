-- CreateTable
CREATE TABLE "Participent" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL,
    "is_moderator" BOOLEAN NOT NULL,

    CONSTRAINT "Participent_pkey" PRIMARY KEY ("id")
);
