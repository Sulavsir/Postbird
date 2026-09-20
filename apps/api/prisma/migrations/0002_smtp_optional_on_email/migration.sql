-- Allow deleting SMTP connections while keeping sent-mail history.

ALTER TABLE "Email" ALTER COLUMN "smtpConfigurationId" DROP NOT NULL;

ALTER TABLE "Email" DROP CONSTRAINT "Email_smtpConfigurationId_fkey";

ALTER TABLE "Email" ADD CONSTRAINT "Email_smtpConfigurationId_fkey" FOREIGN KEY ("smtpConfigurationId") REFERENCES "SmtpConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
