-- CreateEnum
CREATE TYPE "Network" AS ENUM ('ETHEREUM', 'ROPSTEN');

-- CreateEnum
CREATE TYPE "LockId" AS ENUM ('NEWER_SWAPS', 'OLDER_SWAPS', 'PRICES_HISTORIC', 'SWAP_DETAILS', 'SWAP_LOGS', 'SWAP_STATUS');

-- CreateEnum
CREATE TYPE "SwapStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Locks" (
    "id" "LockId" NOT NULL,
    "network" "Network" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id","network")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "network" "Network" NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" SMALLINT NOT NULL,
    "symbol" TEXT NOT NULL,
    "logoUri" TEXT,
    "priceHistoryUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUsdPriceHistoric" (
    "tokenId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("tokenId","at")
);

-- CreateTable
CREATE TABLE "Swap" (
    "id" TEXT NOT NULL,
    "network" "Network" NOT NULL,
    "status" "SwapStatus" NOT NULL DEFAULT E'PENDING',
    "initiatorAddress" TEXT NOT NULL,
    "beneficiaryAddress" TEXT NOT NULL,
    "srcTokenId" TEXT NOT NULL,
    "srcAmount" DECIMAL(65,20) NOT NULL,
    "destTokenId" TEXT NOT NULL,
    "destAmount" DECIMAL(65,20) NOT NULL,
    "rawRouteData" TEXT NOT NULL,
    "skypoolsTransactionHashes" TEXT[],
    "skybridgeSwapId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token.network_address_unique" ON "Token"("network", "address");

-- CreateIndex
CREATE INDEX "Token.network_address_index" ON "Token"("network", "address");

-- AddForeignKey
ALTER TABLE "TokenUsdPriceHistoric" ADD FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD FOREIGN KEY ("srcTokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD FOREIGN KEY ("destTokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
