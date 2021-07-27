-- CreateEnum
CREATE TYPE "Network" AS ENUM ('ETHEREUM', 'BSC', 'POLYGON');

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

-- CreateIndex
CREATE UNIQUE INDEX "Token.network_address_unique" ON "Token"("network", "address");

-- CreateIndex
CREATE INDEX "Token.network_address_index" ON "Token"("network", "address");

-- AddForeignKey
ALTER TABLE "TokenUsdPriceHistoric" ADD FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
