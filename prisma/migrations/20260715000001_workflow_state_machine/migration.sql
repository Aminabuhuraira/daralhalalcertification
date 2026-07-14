-- Add workflow state machine fields to CertificationApplication
ALTER TABLE "CertificationApplication" ADD COLUMN "schemeCode" TEXT;
ALTER TABLE "CertificationApplication" ADD COLUMN "referenceNumber" TEXT;
ALTER TABLE "CertificationApplication" ADD COLUMN "deficiencyNotes" TEXT;
ALTER TABLE "CertificationApplication" ADD COLUMN "auditDate" DATETIME;
