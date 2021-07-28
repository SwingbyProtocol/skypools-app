-- CreateEnum
CREATE TYPE "SwapStatus" AS ENUM ('SENT', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "SwapHistoric" (
    "id" TEXT NOT NULL,
    "network" "Network" NOT NULL,
    "hash" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "status" "SwapStatus" NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "initiatorAddress" TEXT NOT NULL,
    "srcAmount" DECIMAL(65,20),
    "srcTokenId" TEXT,
    "destAmount" DECIMAL(65,20),
    "destTokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SwapHistoric.network_hash_unique" ON "SwapHistoric"("network", "hash");

-- CreateIndex
CREATE INDEX "SwapHistoric.network_hash_index" ON "SwapHistoric"("network", "hash");

-- AddForeignKey
ALTER TABLE "SwapHistoric" ADD FOREIGN KEY ("srcTokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapHistoric" ADD FOREIGN KEY ("destTokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;
