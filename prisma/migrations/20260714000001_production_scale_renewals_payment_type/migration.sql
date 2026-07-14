-- Add production scale to certification applications (LARGE, MEDIUM, SMALL)
ALTER TABLE "CertificationApplication" ADD COLUMN "productionScale" TEXT;

-- Add expiry date to certificates for renewal tracking
ALTER TABLE "Certificate" ADD COLUMN "expiresAt" DATETIME;

-- Add payment type to distinguish company vs product payments
ALTER TABLE "Payment" ADD COLUMN "paymentType" TEXT NOT NULL DEFAULT 'COMPANY';
