-- CreateEnum
CREATE TYPE "Network" AS ENUM ('ETHEREUM', 'BSC', 'POLYGON');

-- CreateTable
CREATE TABLE "Token" (
    "network" "Network" NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" SMALLINT NOT NULL,
    "symbol" TEXT NOT NULL,
    "logoUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("network","address")
);

-- CreateTable
CREATE TABLE "TokenUsdPriceHistoric" (
    "tokenNetwork" "Network" NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("tokenNetwork","tokenAddress","at")
);

-- AddForeignKey
ALTER TABLE "TokenUsdPriceHistoric" ADD FOREIGN KEY ("tokenNetwork", "tokenAddress") REFERENCES "Token"("network", "address") ON DELETE CASCADE ON UPDATE CASCADE;
