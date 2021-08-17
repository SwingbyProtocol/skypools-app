-- CreateEnum
CREATE TYPE "LockId" AS ENUM ('NEWER_SWAPS', 'OLDER_SWAPS', 'PRICES_HISTORIC', 'SWAP_DETAILS', 'SWAP_LOGS', 'SWAP_STATUS');

-- CreateTable
CREATE TABLE "Locks" (
    "id" "LockId" NOT NULL,
    "network" "Network" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id","network")
);
