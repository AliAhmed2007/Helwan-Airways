-- CreateTable
CREATE TABLE `airports` (
    `airportId` VARCHAR(191) NOT NULL,
    `iataCode` VARCHAR(3) NOT NULL,
    `airportName` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'UTC',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `airports_iataCode_key`(`iataCode`),
    PRIMARY KEY (`airportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aircrafts` (
    `aircraftId` VARCHAR(191) NOT NULL,
    `registrationNum` VARCHAR(20) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `manufacturer` VARCHAR(100) NOT NULL,
    `totalSeats` INTEGER NOT NULL,
    `firstClassSeats` INTEGER NOT NULL DEFAULT 0,
    `businessSeats` INTEGER NOT NULL DEFAULT 0,
    `economySeats` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'MAINTENANCE', 'RETIRED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `aircrafts_registrationNum_key`(`registrationNum`),
    PRIMARY KEY (`aircraftId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `staffId` VARCHAR(191) NOT NULL,
    `clerkUserId` VARCHAR(191) NULL,
    `firstName` VARCHAR(50) NOT NULL,
    `lastName` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `role` ENUM('ADMIN', 'AGENT', 'GATE_AGENT', 'MANAGER', 'PILOT', 'CABIN_CREW') NOT NULL DEFAULT 'AGENT',
    `department` VARCHAR(100) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `hireDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `staff_clerkUserId_key`(`clerkUserId`),
    UNIQUE INDEX `staff_email_key`(`email`),
    PRIMARY KEY (`staffId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flights` (
    `flightId` VARCHAR(191) NOT NULL,
    `flightNumber` VARCHAR(10) NOT NULL,
    `depAirportId` VARCHAR(191) NOT NULL,
    `arrAirportId` VARCHAR(191) NOT NULL,
    `aircraftId` VARCHAR(191) NOT NULL,
    `schedDeparture` DATETIME(3) NOT NULL,
    `schedArrival` DATETIME(3) NOT NULL,
    `basePrice` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `createdByStaff` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `flights_flightNumber_key`(`flightNumber`),
    INDEX `flights_depAirportId_idx`(`depAirportId`),
    INDEX `flights_arrAirportId_idx`(`arrAirportId`),
    INDEX `flights_aircraftId_idx`(`aircraftId`),
    INDEX `flights_schedDeparture_idx`(`schedDeparture`),
    PRIMARY KEY (`flightId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flight_schedules` (
    `scheduleId` VARCHAR(191) NOT NULL,
    `flightId` VARCHAR(191) NOT NULL,
    `departureDate` DATETIME(3) NOT NULL,
    `actualDeparture` DATETIME(3) NULL,
    `actualArrival` DATETIME(3) NULL,
    `scheduleStatus` ENUM('SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
    `daysOfWeek` VARCHAR(50) NULL,
    `gate` VARCHAR(10) NULL,
    `terminal` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `flight_schedules_flightId_idx`(`flightId`),
    INDEX `flight_schedules_departureDate_idx`(`departureDate`),
    PRIMARY KEY (`scheduleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flight_status_history` (
    `statusHistId` VARCHAR(191) NOT NULL,
    `flightId` VARCHAR(191) NOT NULL,
    `oldStatus` ENUM('SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED') NOT NULL,
    `newStatus` ENUM('SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED') NOT NULL,
    `changedBy` VARCHAR(191) NULL,
    `changeTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` TEXT NULL,

    INDEX `flight_status_history_flightId_idx`(`flightId`),
    INDEX `flight_status_history_changeTime_idx`(`changeTime`),
    PRIMARY KEY (`statusHistId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passengers` (
    `passengerId` VARCHAR(191) NOT NULL,
    `clerkUserId` VARCHAR(191) NULL,
    `firstName` VARCHAR(50) NOT NULL,
    `lastName` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `dateOfBirth` DATE NULL,
    `passportNum` VARCHAR(20) NULL,
    `nationality` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `passengers_clerkUserId_key`(`clerkUserId`),
    UNIQUE INDEX `passengers_email_key`(`email`),
    INDEX `passengers_clerkUserId_idx`(`clerkUserId`),
    PRIMARY KEY (`passengerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seats` (
    `seatId` VARCHAR(191) NOT NULL,
    `aircraftId` VARCHAR(191) NOT NULL,
    `seatNumber` VARCHAR(5) NOT NULL,
    `class` ENUM('FIRST', 'BUSINESS', 'ECONOMY') NOT NULL DEFAULT 'ECONOMY',
    `isAisle` BOOLEAN NOT NULL DEFAULT false,
    `isWindow` BOOLEAN NOT NULL DEFAULT false,
    `extraPrice` DECIMAL(8, 2) NOT NULL DEFAULT 0,

    INDEX `seats_aircraftId_idx`(`aircraftId`),
    UNIQUE INDEX `seats_aircraftId_seatNumber_key`(`aircraftId`, `seatNumber`),
    PRIMARY KEY (`seatId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `reservationId` VARCHAR(191) NOT NULL,
    `bookingRef` VARCHAR(10) NOT NULL,
    `clerkUserId` VARCHAR(191) NOT NULL,
    `passengerId` VARCHAR(191) NOT NULL,
    `flightId` VARCHAR(191) NOT NULL,
    `scheduleId` VARCHAR(191) NULL,
    `seatId` VARCHAR(191) NULL,
    `bookingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `travelClass` ENUM('FIRST', 'BUSINESS', 'ECONOMY') NOT NULL DEFAULT 'ECONOMY',
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'CONFIRMED',
    `specialReq` TEXT NULL,
    `checkInStatus` ENUM('NOT_CHECKED_IN', 'CHECKED_IN') NOT NULL DEFAULT 'NOT_CHECKED_IN',
    `boardingGroup` VARCHAR(5) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reservations_bookingRef_key`(`bookingRef`),
    INDEX `reservations_clerkUserId_idx`(`clerkUserId`),
    INDEX `reservations_passengerId_idx`(`passengerId`),
    INDEX `reservations_flightId_idx`(`flightId`),
    INDEX `reservations_scheduleId_idx`(`scheduleId`),
    PRIMARY KEY (`reservationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `baggage` (
    `baggageId` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `baggageType` ENUM('CARRY_ON', 'CHECKED', 'OVERSIZE') NOT NULL DEFAULT 'CHECKED',
    `weightKg` DECIMAL(5, 2) NULL,
    `status` ENUM('CHECKED_IN', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'LOST') NOT NULL DEFAULT 'CHECKED_IN',
    `tag` VARCHAR(20) NULL,
    `fee` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `baggage_tag_key`(`tag`),
    INDEX `baggage_reservationId_idx`(`reservationId`),
    PRIMARY KEY (`baggageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `paymentId` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'ONLINE') NOT NULL DEFAULT 'CREDIT_CARD',
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `transactRef` VARCHAR(50) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `refundAmount` DECIMAL(10, 2) NULL,
    `refundDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_transactRef_key`(`transactRef`),
    INDEX `payments_reservationId_idx`(`reservationId`),
    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation_history` (
    `historyId` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `oldStatus` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL,
    `newStatus` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL,
    `changedBy` VARCHAR(191) NULL,
    `changeTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` TEXT NULL,

    INDEX `reservation_history_reservationId_idx`(`reservationId`),
    PRIMARY KEY (`historyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `flights` ADD CONSTRAINT `flights_depAirportId_fkey` FOREIGN KEY (`depAirportId`) REFERENCES `airports`(`airportId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flights` ADD CONSTRAINT `flights_arrAirportId_fkey` FOREIGN KEY (`arrAirportId`) REFERENCES `airports`(`airportId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flights` ADD CONSTRAINT `flights_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts`(`aircraftId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flights` ADD CONSTRAINT `flights_createdByStaff_fkey` FOREIGN KEY (`createdByStaff`) REFERENCES `staff`(`staffId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flight_schedules` ADD CONSTRAINT `flight_schedules_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `flights`(`flightId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flight_status_history` ADD CONSTRAINT `flight_status_history_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `flights`(`flightId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flight_status_history` ADD CONSTRAINT `flight_status_history_changedBy_fkey` FOREIGN KEY (`changedBy`) REFERENCES `staff`(`staffId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `aircrafts`(`aircraftId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `passengers`(`passengerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `flights`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `flight_schedules`(`scheduleId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `seats`(`seatId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `baggage` ADD CONSTRAINT `baggage_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations`(`reservationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations`(`reservationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation_history` ADD CONSTRAINT `reservation_history_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations`(`reservationId`) ON DELETE CASCADE ON UPDATE CASCADE;
