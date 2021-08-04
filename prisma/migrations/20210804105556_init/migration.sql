-- CreateEnum
CREATE TYPE "Network" AS ENUM ('ETHEREUM', 'BSC', 'POLYGON');

-- CreateEnum
CREATE TYPE "SwapStatus" AS ENUM ('SENT', 'CONFIRMED', 'FAILED');

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
CREATE TABLE "SwapHistoric" (
    "id" TEXT NOT NULL,
    "network" "Network" NOT NULL,
    "hash" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "status" "SwapStatus" NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "initiatorAddress" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "srcAmount" DECIMAL(65,20),
    "srcTokenId" TEXT,
    "destAmount" DECIMAL(65,20),
    "destTokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "detailsUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwapLogHistoric" (
    "id" TEXT NOT NULL,
    "network" "Network" NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "topics" TEXT[],
    "blockNumber" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token.network_address_unique" ON "Token"("network", "address");

-- CreateIndex
CREATE INDEX "Token.network_address_index" ON "Token"("network", "address");

-- CreateIndex
CREATE UNIQUE INDEX "SwapHistoric.network_hash_unique" ON "SwapHistoric"("network", "hash");

-- CreateIndex
CREATE INDEX "SwapHistoric.network_hash_index" ON "SwapHistoric"("network", "hash");

-- CreateIndex
CREATE UNIQUE INDEX "SwapLogHistoric.network_transactionHash_logIndex_unique" ON "SwapLogHistoric"("network", "transactionHash", "logIndex");

-- CreateIndex
CREATE INDEX "SwapLogHistoric.network_transactionHash_logIndex_index" ON "SwapLogHistoric"("network", "transactionHash", "logIndex");

-- AddForeignKey
ALTER TABLE "TokenUsdPriceHistoric" ADD FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapHistoric" ADD FOREIGN KEY ("srcTokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapHistoric" ADD FOREIGN KEY ("destTokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapLogHistoric" ADD FOREIGN KEY ("network", "transactionHash") REFERENCES "SwapHistoric"("network", "hash") ON DELETE CASCADE ON UPDATE CASCADE;
