-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "citation" TEXT,
    "court" TEXT,
    "year" INTEGER,
    "docType" TEXT NOT NULL DEFAULT 'CASE',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);
