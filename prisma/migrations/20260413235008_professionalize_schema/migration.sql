-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "matchScore" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "yearsExperience" INTEGER;

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'IMMEDIATE',
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "employmentType" TEXT[],
ADD COLUMN     "expectedSalary" DOUBLE PRECISION,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "graduationYear" INTEGER,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "salaryExpected" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "university" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "city" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "appliedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "benefits" TEXT[],
ADD COLUMN     "department" TEXT,
ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "requiredExperience" INTEGER,
ADD COLUMN     "requiredSkills" TEXT[],
ADD COLUMN     "salaryMax" DOUBLE PRECISION,
ADD COLUMN     "salaryMin" DOUBLE PRECISION,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
