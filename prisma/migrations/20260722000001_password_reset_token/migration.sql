-- Add password reset token table
CREATE TABLE "PasswordResetToken" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "token"     TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
