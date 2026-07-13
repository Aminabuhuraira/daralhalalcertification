-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "applicationId" TEXT,
    "tier" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CertificationApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificate" ("courseId", "id", "issuedAt", "serial", "tier", "userId") SELECT "courseId", "id", "issuedAt", "serial", "tier", "userId" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE UNIQUE INDEX "Certificate_applicationId_key" ON "Certificate"("applicationId");
CREATE UNIQUE INDEX "Certificate_serial_key" ON "Certificate"("serial");
CREATE INDEX "Certificate_serial_idx" ON "Certificate"("serial");
CREATE UNIQUE INDEX "Certificate_userId_courseId_tier_key" ON "Certificate"("userId", "courseId", "tier");
CREATE TABLE "new_CertificationApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "productList" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "certIssueMode" TEXT NOT NULL DEFAULT 'MANUAL',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CertificationApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CertificationApplication" ("businessName", "createdAt", "id", "notes", "productList", "reviewNotes", "reviewedBy", "sector", "status", "updatedAt", "userId") SELECT "businessName", "createdAt", "id", "notes", "productList", "reviewNotes", "reviewedBy", "sector", "status", "updatedAt", "userId" FROM "CertificationApplication";
DROP TABLE "CertificationApplication";
ALTER TABLE "new_CertificationApplication" RENAME TO "CertificationApplication";
CREATE INDEX "CertificationApplication_status_idx" ON "CertificationApplication"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
