import { PrismaClient } from "@prisma/client";
import { demoSongs } from "../../frontend/src/data/demoSongs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old data...");

  await prisma.sessionResult.deleteMany();
  await prisma.lyricWord.deleteMany();
  await prisma.lyricLine.deleteMany();
  await prisma.song.deleteMany();

  console.log("Seeding Luna demo songs...");

  for (const song of demoSongs) {
    await prisma.song.create({
      data: {
        id: song.id,
        title: song.title,
        artistLabel: song.artistLabel,
        genre: song.genre,
        genreUk: song.genreUk,
        level: song.level,
        durationSec: song.durationSec,
        audioUrl: song.audioUrl,
        descriptionUk: song.descriptionUk,
        syncOffsetMs: song.syncOffsetMs ?? 0,
        lines: {
          create: song.lines.map((line) => ({
            id: line.id,
            order: line.order,
            startMs: line.startMs,
            endMs: line.endMs,
            english: line.english,
            ukrainian: line.ukrainian,
            words: {
              create: line.words.map((word) => ({
                id: `${line.id}_word_${String(word.order).padStart(3, "0")}`,
                order: word.order,
                text: word.text,
                ipa: word.ipa ?? null,
                pos: word.pos,
                ukrainian: word.ukrainian,
              })),
            },
          })),
        },
      },
    });

    console.log(`Seeded: ${song.title}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });