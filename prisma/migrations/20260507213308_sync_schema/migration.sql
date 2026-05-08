-- AlterTable
ALTER TABLE `flights` ADD COLUMN `isRoundTrip` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `returnDate` DATETIME(3) NULL;
