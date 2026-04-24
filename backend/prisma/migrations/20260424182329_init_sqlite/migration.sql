-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artistLabel" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "genreUk" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "descriptionUk" TEXT NOT NULL,
    "syncOffsetMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LyricLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "ukrainian" TEXT NOT NULL,
    CONSTRAINT "LyricLine_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LyricWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lineId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "ipa" TEXT,
    "pos" TEXT NOT NULL,
    "ukrainian" TEXT NOT NULL,
    CONSTRAINT "LyricWord_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "LyricLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "accuracy" REAL NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "correctWords" INTEGER NOT NULL,
    "mistakes" INTEGER NOT NULL,
    "durationSec" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionResult_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LyricLine_songId_order_key" ON "LyricLine"("songId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LyricWord_lineId_order_key" ON "LyricWord"("lineId", "order");
