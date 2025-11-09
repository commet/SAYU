import { ChemistryData } from '@/data/personality-chemistry';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { getSynergyKey, synergyTable } from '@/data/personality-synergy-table';
import { SAYUTypeCode } from '@/types/sayu-shared';

const compatibilityFromScore = (score?: number): ChemistryData['compatibility'] => {
  if (!score || score < 60) return 'challenging';
  if (score >= 92) return 'perfect';
  if (score >= 78) return 'good';
  return 'learning';
};

const fallbackActivitiesEn = [
  'Contrast tour swapping favorite galleries',
  'Slow-looking notebook session',
  'Audio guide remix with shared reflections',
  'Night museum walk with prompt cards',
];

const fallbackActivitiesKo = [
  '서로 좋아하는 갤러리를 번갈아 안내하는 대비 투어',
  '슬로우 루킹 기록 노트 세션',
  '오디오 가이드를 재구성해 함께 이야기 나누기',
  '프롬프트 카드를 들고 떠나는 야간 뮤지엄 산책',
];

export const generateFallbackChemistry = (type1: string, type2: string): ChemistryData => {
  const desc1 = personalityDescriptions[type1 as SAYUTypeCode];
  const desc2 = personalityDescriptions[type2 as SAYUTypeCode];
  const animal1 = getAnimalByType(type1);
  const animal2 = getAnimalByType(type2);
  const synergy = synergyTable[getSynergyKey(type1, type2)];
  const compatibility = compatibilityFromScore(synergy?.compatibilityScore);

  const enTitle1 = desc1?.title ?? `${type1} Explorer`;
  const enTitle2 = desc2?.title ?? `${type2} Guide`;
  const koTitle1 = desc1?.title_ko ?? enTitle1;
  const koTitle2 = desc2?.title_ko ?? enTitle2;

  const viewingStyleEn =
    synergy?.viewingStyle.en ??
    `${enTitle1} captures atmosphere while ${enTitle2} organizes meaning, so every stop feels layered.`;
  const viewingStyleKo =
    synergy?.viewingStyle.ko ??
    `${koTitle1}는 분위기와 감정을 채집하고 ${koTitle2}는 이야기와 구조를 정리해 주어 감상이 겹겹이 쌓입니다.`;

  const recommendedEn = Array.from(
    new Set(
      [
        synergy?.recommendedActivities.en,
        `${enTitle1} curated path that highlights light and texture`,
        `${enTitle2} hosts a conversation salon after the visit`,
        ...fallbackActivitiesEn,
      ].filter(Boolean) as string[],
    ),
  ).slice(0, 4);

  const recommendedKo = Array.from(
    new Set(
      [
        synergy?.recommendedActivities.ko,
        `${koTitle1}가 조도와 질감에 집중해 큐레이션하는 감상 루트`,
        `${koTitle2}가 전시 후 작은 살롱 토크를 이끄는 시간`,
        ...fallbackActivitiesKo,
      ].filter(Boolean) as string[],
    ),
  ).slice(0, 4);

  const conversationExamples = [
    {
      person1: `${animal1?.emoji ?? '🎨'} ${enTitle1.split(' ')[0]} feels drawn to the textures here.`,
      person1_ko: `${animal1?.emoji ?? '🎨'} ${koTitle1} 시선은 이 질감에 오래 머무르고 싶어 합니다.`,
      person2: `${animal2?.emoji ?? '🖼️'} ${enTitle2.split(' ')[0]} links it to a wider archive so the story expands.`,
      person2_ko: `${animal2?.emoji ?? '🖼️'} ${koTitle2}는 더 넓은 아카이브와 연결해 이야기를 확장합니다.`,
    },
    {
      person1: '"Shall we swap sketchbooks after this room? I want to see what you captured."',
      person1_ko: '"이 전시실을 보고 나면 스케치 노트를 바꿔볼까? 네가 무엇을 적었는지 궁금해."',
      person2: '"Perfect. I\'ll add dates and references so we can build a shared log."',
      person2_ko: '"좋아. 날짜와 참고 자료를 얹어서 우리만의 기록으로 만들어보자."',
    },
  ];

  const tips = {
    for_type1: `${enTitle2} responds better when your instincts are translated into one concrete cue they can archive.`,
    for_type1_ko: `${koTitle2}는 당신의 직감을 구체적인 단서 하나로 정리해 주면 훨씬 잘 반응합니다.`,
    for_type2: `${enTitle1} needs space to feel before analyzing, so leave small pauses for insights to surface.`,
    for_type2_ko: `${koTitle1}는 해석 전에 감정을 느낄 여백이 필요하니 짧은 침묵을 남겨 두면 좋은 통찰이 올라옵니다.`,
  };

  return {
    type1,
    type2,
    compatibility,
    title: `${enTitle1} × ${enTitle2} Synergy`,
    title_ko: `${koTitle1} × ${koTitle2} 케미스트리`,
    synergy: {
      description: viewingStyleEn,
      description_ko: viewingStyleKo,
    },
    recommendedExhibitions: recommendedEn,
    recommendedExhibitions_ko: recommendedKo,
    conversationExamples,
    tips,
  };
};
