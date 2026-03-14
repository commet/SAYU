import cloudinaryData from '@/data/cloudinary-urls.json';
import { CounselorArtwork } from './types';

interface ArtworkEntry {
  full: { url: string; width: number; height: number };
  artwork: { title: string; artist: string; sayuType: string };
  thumbnail: { url: string };
}

const APT_AXES_MAP: Record<string, [string, string, string, string]> = {
  LAEF: ['L', 'A', 'E', 'F'],
  LAEC: ['L', 'A', 'E', 'C'],
  LAMF: ['L', 'A', 'M', 'F'],
  LAMC: ['L', 'A', 'M', 'C'],
  LREF: ['L', 'R', 'E', 'F'],
  LREC: ['L', 'R', 'E', 'C'],
  LRMF: ['L', 'R', 'M', 'F'],
  LRMC: ['L', 'R', 'M', 'C'],
  SAEF: ['S', 'A', 'E', 'F'],
  SAEC: ['S', 'A', 'E', 'C'],
  SAMF: ['S', 'A', 'M', 'F'],
  SAMC: ['S', 'A', 'M', 'C'],
  SREF: ['S', 'R', 'E', 'F'],
  SREC: ['S', 'R', 'E', 'C'],
  SRMF: ['S', 'R', 'M', 'F'],
  SRMC: ['S', 'R', 'M', 'C'],
};

function countMatchingAxes(typeA: string, typeB: string): number {
  const axesA = APT_AXES_MAP[typeA];
  const axesB = APT_AXES_MAP[typeB];
  if (!axesA || !axesB) return 0;
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (axesA[i] === axesB[i]) count++;
  }
  return count;
}

export function selectArtwork(
  aptType: string,
  excludeIds: string[]
): CounselorArtwork | null {
  const normalizedType = aptType.toUpperCase();
  const data = cloudinaryData as Record<string, ArtworkEntry>;
  const excludeSet = new Set(excludeIds);

  const candidates: Array<{ id: string; entry: ArtworkEntry; score: number }> = [];

  for (const [id, entry] of Object.entries(data)) {
    if (excludeSet.has(id)) continue;
    if (!entry.artwork?.sayuType || !entry.full?.url || !entry.thumbnail?.url) continue;

    const artworkType = entry.artwork.sayuType.toUpperCase();
    let score = 0;

    if (artworkType === normalizedType) {
      score += 40;
    } else {
      const matchingAxes = countMatchingAxes(normalizedType, artworkType);
      score += matchingAxes * 10;
    }

    score += Math.random() * 10;
    candidates.push({ id, entry, score });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const topN = candidates.slice(0, Math.min(5, candidates.length));

  const totalScore = topN.reduce((sum, c) => sum + c.score, 0);
  let roll = Math.random() * totalScore;

  let picked = topN[0];
  for (const candidate of topN) {
    roll -= candidate.score;
    if (roll <= 0) {
      picked = candidate;
      break;
    }
  }

  return {
    id: picked.id,
    title: picked.entry.artwork.title,
    artist: picked.entry.artwork.artist,
    imageUrl: picked.entry.full.url,
    thumbnailUrl: picked.entry.thumbnail.url,
    sayuType: picked.entry.artwork.sayuType,
  };
}
