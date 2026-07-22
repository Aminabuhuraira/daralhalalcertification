-- Add application number field (auto-generated at application creation)
ALTER TABLE "CertificationApplication" ADD COLUMN "applicationNumber" TEXT;
CREATE UNIQUE INDEX "CertificationApplication_applicationNumber_key" ON "CertificationApplication"("applicationNumber");
