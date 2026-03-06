-- CreateTable
CREATE TABLE "rating_reveals" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "subjectPlayerId" TEXT NOT NULL,
    "ownerPlayerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_reveals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rating_reveals_matchId_subjectPlayerId_key" ON "rating_reveals"("matchId", "subjectPlayerId");

-- AddForeignKey
ALTER TABLE "rating_reveals" ADD CONSTRAINT "rating_reveals_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_reveals" ADD CONSTRAINT "rating_reveals_subjectPlayerId_fkey" FOREIGN KEY ("subjectPlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_reveals" ADD CONSTRAINT "rating_reveals_ownerPlayerId_fkey" FOREIGN KEY ("ownerPlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
