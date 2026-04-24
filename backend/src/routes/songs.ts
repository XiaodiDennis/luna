import { Router } from "express";
import { prisma } from "../lib/prisma";

export const songsRouter = Router();

songsRouter.get("/", async (_req, res) => {
  try {
    const songs = await prisma.song.findMany({
      select: {
        id: true,
        title: true,
        artistLabel: true,
        genre: true,
        genreUk: true,
        level: true,
        durationSec: true,
        audioUrl: true,
        descriptionUk: true,
        syncOffsetMs: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load songs" });
  }
});

songsRouter.get("/:id", async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        lines: {
          orderBy: {
            order: "asc",
          },
          include: {
            words: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    res.json(song);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load song" });
  }
});