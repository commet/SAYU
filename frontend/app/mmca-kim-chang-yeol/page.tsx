'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Camera, Users, Map, ArrowRight, ChevronDown } from 'lucide-react';
import { MMCA_EXHIBITIONS, MMCA_ARTISTS } from '@/data/mmca-tour-data';
import { useLanguage } from '@/contexts/LanguageContext';

// Translations
const t = {
  en: {
    artistName: 'Kim Chang-yeol',
    artistTitle: 'Water Drops',
    mmcaSeoul: 'National Museum of Modern and Contemporary Art, Seoul',
    experienceExhibition: 'Experience the Exhibition',
    exhibitionStructure: 'Exhibition Structure',
    tourOrder: 'Tour Order:',
    // Features
    recommendedWorks: 'Recommended Works for You',
    recommendedWorksDesc: 'Get artwork recommendations based on your Art Persona',
    recordArtwork: 'Record Your Experience',
    recordArtworkDesc: 'Capture favorite artworks and record your impressions',
    teamDashboard: 'Team Dashboard',
    teamDashboardDesc: 'View team members\' records in real-time',
    // Exhibition sections
    chapter1: 'Chapter 1. Scars',
    chapter1Period: '1950s',
    chapter1Desc: 'In 1957, he led informal experimentation by founding the Modern Art Association. For Kim Chang-yeol, informel was not just a style but a ritual to inscribe war wounds on canvas—like bullet holes and tank tracks—and to comfort the dead.',
    chapter2: 'Chapter 2. Phenomena',
    chapter2Period: '1965-1970',
    chapter2Desc: 'In 1965, supported by the Rockefeller Foundation, he stayed in New York. During this "nightmare harder to endure than war," cold spherical forms emerged. After settling in Paris in 1969, they evolved into viscous "intestine art."',
    chapter3: 'Chapter 3. Water Drops',
    chapter3Period: 'After 1971',
    chapter3Desc: 'In 1971, discovering water drops accidentally formed on the back of a canvas, he intuited "the highest achievement a point can have in painting." His 1973 Paris solo show, visited by Dalí and Deneuve, brought international acclaim.',
    chapter4: 'Chapter 4. Return',
    chapter4Period: 'After 1980s',
    chapter4Desc: 'Combining the Thousand Character Classic learned from his grandfather with water drops. A meeting point between childhood memories and present existence, Eastern calligraphy tradition and Western painting techniques.',
    hall6: 'Gallery 6',
    hall7: 'Gallery 7',
    hall8: 'Gallery 8',
    floor1: '1F:',
    floorB1: 'B1F:',
  },
  ko: {
    artistName: '김창열',
    artistTitle: '물방울',
    mmcaSeoul: '국립현대미술관 서울',
    experienceExhibition: '전시 체험하기',
    exhibitionStructure: '전시 구성',
    tourOrder: '오늘 투어 순서:',
    // Features
    recommendedWorks: '나를 위한 추천 작품',
    recommendedWorksDesc: '당신의 Art Persona에 맞는 김창열 작품을 추천받아보세요',
    recordArtwork: '작품 감상 기록',
    recordArtworkDesc: '마음에 드는 작품을 사진으로 남기고 감상을 기록하세요',
    teamDashboard: '팀 대시보드',
    teamDashboardDesc: '팀원들의 감상 기록을 실시간으로 확인하세요',
    // Exhibition sections
    chapter1: '1장. 상흔',
    chapter1Period: '1950년대',
    chapter1Desc: '1957년 현대미술가협회를 창립하며 앵포르멜 실험을 주도했던 시기. 김창열에게 앵포르멜은 단순한 양식이 아니라 총탄 자국과 탱크의 흔적처럼 전쟁의 상처를 화면에 각인시키고 죽음을 위로하는 제의(祭儀)와도 같았습니다.',
    chapter2: '2장. 현상',
    chapter2Period: '1965-1970',
    chapter2Desc: '1965년 록펠러 재단 지원으로 뉴욕 체류. "전쟁보다 견디기 힘든 악몽 같은 시간"이었던 뉴욕에서 차가운 구체 형상이 탄생했고, 1969년 파리 정착 후 점액질처럼 흘러내리는 "창자 미술"로 발전했습니다.',
    chapter3: '3장. 물방울',
    chapter3Period: '1971년 이후',
    chapter3Desc: '1971년 캔버스 뒷면에 우연히 맺힌 물방울을 발견한 순간 "회화적으로 점이 가질 수 있는 최고의 성취"를 직관했습니다. 1973년 파리 첫 개인전에서 달리와 드뇌브가 감탄하며 국제적 명성을 얻었습니다.',
    chapter4: '4장. 회귀',
    chapter4Period: '1980년대 이후',
    chapter4Desc: '어린 시절 할아버지에게서 배운 천자문을 물방울과 결합. 유년의 기억과 현재의 존재, 동양의 서예 전통과 서양의 회화 기법이 만나는 지점입니다.',
    hall6: '6전시실',
    hall7: '7전시실',
    hall8: '8전시실',
    floor1: '1F:',
    floorB1: 'B1F:',
  },
};

// 전시 구성 상세 정보
const EXHIBITION_DETAILS = [
  {
    id: 'section-1',
    title: '1장. 상흔',
    floor: '6전시실',
    period: '1950년대',
    color: 'from-red-500 to-orange-500',
    description: '1957년 현대미술가협회를 창립하며 앵포르멜 실험을 주도했던 시기. 김창열에게 앵포르멜은 단순한 양식이 아니라 총탄 자국과 탱크의 흔적처럼 전쟁의 상처를 화면에 각인시키고 죽음을 위로하는 제의(祭儀)와도 같았습니다.',
    highlights: [
      '1957년 현대미술가협회 창립, 1961 파리비엔날레·1965 상파울루비엔날레 참가',
      '대표작 <제사> (1965) - 8년 후 1973년 상파울루 비엔날레 명예상 수상',
      '총탄 자국을 연상시키는 불규칙한 구멍들이 훗날 물방울 묘사를 예견'
    ]
  },
  {
    id: 'section-2',
    title: '2장. 현상',
    floor: '6전시실',
    period: '1965-1970',
    color: 'from-yellow-500 to-amber-500',
    description: '1965년 록펠러 재단 지원으로 뉴욕 체류. "전쟁보다 견디기 힘든 악몽 같은 시간"이었던 뉴욕에서 차가운 구체 형상이 탄생했고, 1969년 파리 정착 후 점액질처럼 흘러내리는 "창자 미술"로 발전했습니다.',
    highlights: [
      '뉴욕 시기: 넥타이 공장에서 익힌 스텐실·에어스프레이 기법 적용',
      '파리 정착 (1969): 마구간 작업실에서 구체가 점액질로 변화',
      '프란시스 베이컨 영향. 구멍→구체→물방울로 이어지는 여정의 중간 지점'
    ]
  },
  {
    id: 'section-3',
    title: '3장. 물방울',
    floor: '6전시실',
    period: '1971년 이후',
    color: 'from-cyan-500 to-blue-500',
    description: '1971년 캔버스 뒷면에 우연히 맺힌 물방울을 발견한 순간 "회화적으로 점이 가질 수 있는 최고의 성취"를 직관했습니다. 1973년 파리 첫 개인전에서 달리와 드뇌브가 감탄하며 국제적 명성을 얻었습니다.',
    highlights: [
      '1973년 파리 첫 개인전 - 달리·드뇌브 방문, 알랭 보스케 극찬',
      '"아기의 소변이자 스님들의 정화수" - 다층적 상징',
      '극사실 묘사로 투명한 물방울과 거친 캔버스의 대비'
    ]
  },
  {
    id: 'section-4',
    title: '4장. 회귀',
    floor: '7전시실',
    period: '1980년대 이후',
    color: 'from-purple-500 to-pink-500',
    description: '어린 시절 할아버지에게서 배운 천자문을 물방울과 결합. 유년의 기억과 현재의 존재, 동양의 서예 전통과 서양의 회화 기법이 만나는 지점입니다.',
    highlights: [
      '천자문: "자연과 우주의 질서를 인식하는 기호"',
      '동서양의 만남: 한국 서예 전통과 프랑스 극사실 회화의 결합',
      '철학적 회귀: 상흔→물방울→천자문으로 돌아오는 순환'
    ]
  }
];

export default function MMCAKimChangYeolPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const texts = t[language];
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const exhibition = MMCA_EXHIBITIONS[0];
  const artist = MMCA_ARTISTS[0];

  const features = [
    {
      id: 'recommendations',
      icon: Sparkles,
      title: texts.recommendedWorks,
      description: texts.recommendedWorksDesc,
      color: 'from-purple-500 to-pink-500',
      path: '/mmca-kim-chang-yeol/recommendations'
    },
    {
      id: 'record',
      icon: Camera,
      title: texts.recordArtwork,
      description: texts.recordArtworkDesc,
      color: 'from-blue-500 to-cyan-500',
      path: '/mmca-kim-chang-yeol/record'
    },
    {
      id: 'dashboard',
      icon: Users,
      title: texts.teamDashboard,
      description: texts.teamDashboardDesc,
      color: 'from-amber-500 to-orange-500',
      path: '/mmca-kim-chang-yeol/dashboard'
    }
  ];

  const exhibitionSections = [
    { title: texts.chapter1, floor: texts.hall6, period: texts.chapter1Period, color: 'from-red-500 to-orange-500' },
    { title: texts.chapter2, floor: texts.hall6, period: texts.chapter2Period, color: 'from-yellow-500 to-amber-500' },
    { title: texts.chapter3, floor: texts.hall6, period: texts.chapter3Period, color: 'from-cyan-500 to-blue-500' },
    { title: texts.chapter4, floor: texts.hall7, period: texts.chapter4Period, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-gray-900/80 to-gray-900" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {texts.artistName}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              {texts.artistTitle}
            </p>
            <p className="text-sm text-gray-400">
              {artist.birthYear}-{artist.deathYear}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-8">
        {/* Exhibition Map (Overview) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-900 mb-3">
              <img
                src="/mmca-tour-kcy/map/map_1.png"
                alt="전시 전체 지도"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">
                {texts.tourOrder} <span className="text-purple-300 font-medium">{texts.floor1} {texts.hall8}</span> → <span className="text-purple-300 font-medium">{texts.floorB1} {texts.hall6}</span> → <span className="text-purple-300 font-medium">{texts.hall7}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Exhibition Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Map className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">
                  {exhibition.location}
                </h2>
                <p className="text-sm text-gray-400">
                  {texts.mmcaSeoul}
                </p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {exhibition.description}
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {texts.experienceExhibition}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => router.push(feature.path)}
                  className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                    {feature.title}
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Exhibition Series */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">
            {texts.exhibitionStructure}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {exhibitionSections.map((section, index) => (
              <div
                key={section.title}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
              >
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${section.color} mb-3`} />
                <h3 className="font-bold text-white mb-1">{section.title}</h3>
                <p className="text-sm text-gray-400">{section.floor}</p>
                <p className="text-xs text-gray-500 mt-1">{section.period}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
