'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Heart, Info, Trophy } from 'lucide-react';
import { MMCA_ARTWORKS } from '@/data/mmca-tour-data';
import { SAYUTypeCode } from '@/shared/SAYUTypeDefinitions';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

type Artwork = (typeof MMCA_ARTWORKS)[number] & { reason?: string };

const APT_OPTIONS = [
  { code: 'LAEF', label: '몽환적 방랑자', emoji: '🦊' },
  { code: 'LAEC', label: '감성 큐레이터', emoji: '🐱' },
  { code: 'LAMF', label: '직관적 탐구자', emoji: '🦉' },
  { code: 'LAMC', label: '철학적 수집가', emoji: '🐢' },
  { code: 'LREF', label: '고독한 관찰자', emoji: '🦎' },
  { code: 'LREC', label: '섬세한 감정가', emoji: '🦔' },
  { code: 'LRMF', label: '디지털 탐험가', emoji: '🐙' },
  { code: 'LRMC', label: '학구적 연구자', emoji: '🦫' },
  { code: 'SAEF', label: '감성 나눔이', emoji: '🦋' },
  { code: 'SAEC', label: '예술 네트워커', emoji: '🐧' },
  { code: 'SAMF', label: '영감 전도사', emoji: '🦜' },
  { code: 'SAMC', label: '문화 기획자', emoji: '🦌' },
  { code: 'SREF', label: '열정적 관람자', emoji: '🐕' },
  { code: 'SREC', label: '따뜻한 안내자', emoji: '🦆' },
  { code: 'SRMF', label: '지식 멘토', emoji: '🐘' },
  { code: 'SRMC', label: '체계적 교육자', emoji: '🦅' },
] as const;

const introMessages: Partial<Record<SAYUTypeCode | 'default', string>> = {
  LAEF: '여우처럼 자유롭게 동선에 얽매이지 말고, 노란·대형 물방울 앞에서 직관적으로 몰입해 보세요. 시(詩)를 물방울로 번역한 작품도 놓치지 마세요.',
  LREC: '서두르지 말고 작품마다 오래 머물러 보세요. 극사실 물방울과 천자문 대형작에서 섬세한 감정과 체계를 함께 느낄 수 있습니다.',
  LRMC: '거북이처럼 천천히 변화를 추적하세요. 점액질 같은 현상 연작 → 초기 물방울 → 천자문 회귀까지 의미의 정제 과정을 따라가 보세요.',
  SRMC: '독수리 시선으로 큰 흐름을 팀과 함께 보세요. 앵포르멜 → 뉴욕 전환 → 첫 물방울 → 회귀까지 서사를 토론해보세요.',
  default: '각 작품에 담긴 김창열의 상처, 치유, 사유의 흐름을 느껴보세요.',
};

const curatedReasons: Partial<Record<SAYUTypeCode, Record<string, string>>> = {
  LREC: {
    'sangheun-01': '전쟁 직후 "너무 많은 죽음과 끔찍한 잔인함"을 목격한 작가가 죽음을 위로하는 제의(祭儀)처럼 그린 작품입니다. 총탄 자국 하나하나에 섬세하게 머물러보세요.',
    'moolbangul-01': '1973년 첫 개인전에서 살바도르 달리와 까트린 드뇌브가 감탄한 극사실 물방울. "아기의 소변이자 스님들의 정화수"라는 다층적 상징을 섬세하게 읽어보세요.',
    'hoegwi-01': '할아버지로부터 배운 천자문과 물방울의 만남. 문자에 담긴 유년의 기억과 존재의 질문이 교차하는 지점을 음미해보세요.',
  },
  SRMC: {
    'sangheun-01': '1965년 상파울루 비엔날레 출품작 <제사>. 한국 현대미술이 국제무대로 나아간 역사적 순간을 팀과 함께 토론해보세요.',
    'hyunsang-01': '"전쟁보다 견디기 힘든 악몽"이었던 뉴욕 시절. 앵포르멜에서 기하학적 추상으로의 전환을 함께 분석해보세요.',
    'moolbangul-01': '캔버스 뒷면에서 우연히 발견한 물방울. "회화적으로 점이 가질 수 있는 최고의 성취"라는 깨달음의 배경을 질문해보세요.',
  },
  LRMC: {
    'sangheun-01': '앵포르멜이 단순한 양식이 아니라 죽음을 위로하는 제의였다는 철학적 의미. 전쟁의 상처가 예술로 승화되는 과정을 천천히 사유해보세요.',
    'hyunsang-01': '뉴욕에서 파리로, 차가운 구체가 점액질로 녹아내리는 "창자 미술". 고체에서 액체로 변하는 존재론적 경계를 천천히 추적하세요.',
    'moolbangul-01': '구멍(상흔)→구체(현상)→물방울로 이어지는 50년 탐구. 조형 언어의 정제 과정 자체가 수행입니다.',
    'hoegwi-01': '천자문은 "자연과 우주의 질서를 인식하는 기호". 문자(기억)와 물방울(존재)의 철학적 조우를 사유해보세요.',
  },
  LAEF: {
    'moolbangul-01': '캔버스 뒷면에 우연히 맺힌 물방울을 발견한 순간. "점이 가질 수 있는 최고의 성취"라는 직관적 깨달음을 느껴보세요.',
    'moolbangul-02': '노란 바탕의 따뜻한 물방울. 비극 속에서도 놓지 않은 생명력을 직관적으로 몰입해보세요.',
    'moolbangul-03': '거대한 물방울 앞에서 몽환적 침잠을 경험해보세요. 투명함 속에 비치는 세계를 자유롭게 느껴보세요.',
    'il-pleut': '아폴리네르의 시를 물방울로 번역한 작품. 시각화된 시, 멈춰 선 음표처럼 흐르는 빛과 리듬을 느껴보세요.',
  },
  LAEC: {
    'moolbangul-01': '1973년 파리 첫 개인전을 성공으로 이끈 물방울. 달리와 드뇌브가 감탄한 극사실 기법의 정점을 감상하세요.',
    'moolbangul-03': '화면을 가득 채운 물방울들의 조화로운 리듬. 각각 고유한 모양과 질감이 만드는 섬세한 앙상블입니다.',
    'hoegwi-01': '단정한 천자문 서체 위에 맺힌 물방울. 문자와 이미지가 만드는 균형미를 큐레이팅해보세요.',
  },
  LAMF: {
    'hyunsang-01': '넥타이 공장에서 생계를 이으며 익힌 스프레이와 스텐실 기법. 생존 속에서 탄생한 조형 실험을 탐구해보세요.',
    'moolbangul-01': '오랜 고민 끝에 "투명해진 점"을 착상하고 물방울에 도달한 여정. 필연적 발견의 순간을 직관적으로 포착하세요.',
    'il-pleut': '시를 회화로 옮긴 실험. "읽는 것이 아니라 보는 시"라는 조형적 탐구를 느껴보세요.',
  },
  LAMC: {
    'sangheun-01': '전쟁의 트라우마를 화면에 각인한 초기작. 상처를 응시하고 수집하는 철학적 행위의 시작점입니다.',
    'hyunsang-01': '"창자 미술"이라 불린 점액질 형상. 추상과 재현, 신체와 물질의 경계를 수집하듯 탐구한 작품입니다.',
    'moolbangul-01': '물방울은 눈물이자 정화수, 생명이자 소멸. 존재의 다양한 상태를 아우르는 상징을 수집해보세요.',
    'hoegwi-01': '문자(세계 이해)와 물방울(존재 질문)의 만남. 사유의 도구들을 모아 철학적 체계를 구축한 작품입니다.',
  },
  LREF: {
    'sangheun-01': '전쟁의 참상을 홀로 응시하며 그린 상흔. 고독한 제의(祭儀)의 흔적을 조용히 관찰해보세요.',
    'hyunsang-01': '뉴욕에서의 고독과 소외. "전쟁보다 견디기 힘든" 시간을 견디며 홀로 실험한 조형 언어입니다.',
    'moolbangul-01': '파리 외곽 마구간 작업실에서의 고독한 발견. 열악한 환경 속 침묵의 깨달음을 느껴보세요.',
    'hoegwi-01': '할아버지로부터 배운 천자문으로의 회귀. 유년의 기억을 홀로 되새기는 서정적 순간입니다.',
  },
  LRMF: {
    'hyunsang-01': '옵아트를 연상케 하는 시각적 착시. 스프레이와 스텐실로 구현한 기술적 실험을 탐험해보세요.',
    'moolbangul-01': '극사실 기법으로 구현된 투명성. 현실과 환영 사이를 넘나드는 시각적 마술을 발견하세요.',
  },
  SAEF: {
    'moolbangul-01': '전쟁의 눈물이자 정화수. 물방울이 주는 치유와 위로의 감정을 함께 나눠보세요.',
    'moolbangul-02': '비극 속에서도 놓지 않은 생명력. 따뜻한 노란 바탕 위 물방울의 온기를 느껴보세요.',
    'hoegwi-01': '유년의 기억으로 돌아가는 따뜻한 귀환. 할아버지와의 추억이 주는 감성을 나눠보세요.',
  },
  SAEC: {
    'moolbangul-01': '1973년 프랑스 예술계에 신선한 충격을 안긴 물방울. 국제 미술계와 소통한 조형 언어의 탄생입니다.',
    'hoegwi-01': '한국의 천자문과 서양의 회화가 만난 문화 교류. 동서양을 잇는 예술적 네트워크를 느껴보세요.',
  },
  SAMF: {
    'sangheun-01': '죽음의 한복판에서도 예술을 놓지 않은 청년 김창열. 역경 속 창작의 열정이 주는 영감을 느껴보세요.',
    'hyunsang-01': '"악몽 같은 시간"을 예술로 승화한 여정. 고난을 돌파한 창작자의 의지를 전파해보세요.',
    'moolbangul-01': '우연한 발견을 필연으로 만든 50년 천착. 평생을 바친 예술적 헌신이 주는 영감을 나눠보세요.',
  },
  SAMC: {
    'sangheun-01': '1965년 상파울루 비엔날레로 한국 미술을 세계에 알린 작품. 문화 교류의 선구적 역할을 기획적으로 이해해보세요.',
    'hyunsang-01': '앵포르멜에서 추상, 점액질을 거쳐 물방울로. 조형 언어 진화의 큰 그림을 기획자 시선으로 보세요.',
    'hoegwi-01': '문자(기억)와 이미지(존재)의 통합. 전통과 현대를 잇는 독자적 미학의 완성을 기획적으로 감상하세요.',
  },
  SREF: {
    'sangheun-01': '전쟁의 상처를 정면으로 마주한 용기. 비극을 예술로 승화한 열정을 느껴보세요.',
    'moolbangul-01': '평생을 물방울에 천착한 집요함. "무슈 구뜨(물방울 씨)"로 불린 작가의 열정을 만나보세요.',
    'hoegwi-01': '유년의 기억으로 돌아가는 귀환. 한국적 정서가 담긴 따뜻한 작품입니다.',
  },
  SREC: {
    'sangheun-01': '전쟁 트라우마를 예술로 위로한 작품. 상처 입은 이들을 감싸는 따뜻한 제의를 느껴보세요.',
    'moolbangul-01': '눈물이자 정화수인 물방울. 보는 이를 치유하는 포용의 미학을 안내해드립니다.',
    'hoegwi-01': '할아버지의 가르침으로 돌아간 회귀. 전통을 품은 따뜻한 귀환을 함께 느껴보세요.',
  },
  SRMF: {
    'sangheun-01': '한국 앵포르멜 운동의 역사적 맥락. 1957년 현대미술가협회 창립부터의 여정을 멘토링해드립니다.',
    'hyunsang-01': '록펠러 재단 지원으로 시작된 뉴욕 체류. 국제 문화 교류의 실제 사례를 나눠보세요.',
    'moolbangul-01': '1973년 첫 개인전 성공의 배경. 프랑스 비평가 알랭 보스케의 극찬이 가진 의미를 함께 배워보세요.',
  },
};

const EXHIBITION_SECTIONS = [
  {
    id: 'section-1',
    title: '1장. 상흔 (1950년대)',
    subtitle: '전쟁과 분단의 상처가 새겨진 초기 구상 작업',
    description:
      '열다섯 살에 홀로 월남한 김창열은 해방, 분단, 한국전쟁이라는 격동기를 겪으며 "너무 많은 죽음과 끔찍한 잔인함"을 목격했습니다. 그 경험은 삶과 죽음이라는 주제를 내면화하는 필연적 계기가 되었습니다. 김창열에게 앵포르멜은 단순한 양식이 아니라 총탄 자국과 탱크의 흔적처럼 전쟁의 상처를 화면에 각인시키고 죽음을 위로하는 제의(祭儀)와도 같았습니다. 실제로 당시 대다수 작품에 "제사"라는 제목을 붙였는데, 이는 그의 예술 세계에서 상처를 형상화하는 시작점이자 물방울 이전의 원형 모티프를 예고합니다. 1957년 현대미술가협회를 창립하며 앵포르멜 실험을 주도했고, 1961년 파리비엔날레, 1965년 상파울루비엔날레 참가로 한국 현대미술의 국제 교류를 개척했습니다.',
  },
  {
    id: 'section-2',
    title: '2장. 현상 (1965-1970)',
    subtitle: '뉴욕·파리 전환기의 추상 실험과 점액질 형상',
    description:
      '1965년 록펠러 재단 지원으로 뉴욕에 머물렀으나, 한국에서 그려온 앵포르멜 회화는 주목받지 못했고 자본주의 소비사회의 이질감은 "전쟁보다 견디기 힘든 악몽 같은 시간"으로 다가왔습니다. 앵포르멜의 두터운 질감이 사라지고 매끈하고 정제된 화면 위에 기하학적 형태가 등장하며, 옵아트를 연상케 하는 시각적 착시를 실험했습니다. 생계를 위해 일한 넥타이 공장에서 익힌 스프레이와 스텐실 기법도 적극 활용했습니다. 1969년 파리로 이동 후 팔레조 외곽의 허물어진 마구간 작업실에 정착하며, 뉴욕 시기 차가운 구체들이 점액질처럼 흘러내리는 유기적 형상으로 변주됩니다. 김창열은 이를 "창자 미술"이라 부르며 신체와 물질, 추상과 재현 사이의 경계를 탐색했고, 이는 곧 등장할 물방울 회화의 전조가 되었습니다.',
  },
  {
    id: 'section-3',
    title: '3장. 물방울 (1971년 이후)',
    subtitle: '극사실적 물방울에서 수행적 반복으로',
    description:
      '캔버스를 재활용하기 위해 물을 뿌려두던 중 우연히 뒷면에 맺힌 물방울을 발견한 순간, "회화적으로 점이 가질 수 있는 최고의 성취"라는 직관적 깨달음에 이르렀습니다. 1973년 파리 첫 개인전에서 초현실주의 거장 살바도르 달리와 여배우 까트린 드뇌브가 방문했고, 비평가 알랭 보스케는 "물질을 재정의하고 정신성을 제시하는 보기 드문 최면력"이라며 극찬했습니다. 김창열에게 물방울은 "아기의 소변이자 스님들의 정화수"로, 전쟁의 눈물이자 정화수, 생명이자 소멸을 아우르는 상징이었습니다. 거친 바탕 위에 맺힌 극사실적 물방울은 현실과 환영 사이를 오가며 명상적·치유적 공간을 만들어냅니다. 이후 50년간 물방울을 반복하며, 상처를 응시하고 존재를 묻는 독자적 조형 언어로 완성시켰습니다.',
  },
  {
    id: 'section-4',
    title: '4장. 회귀 (1980년대 이후)',
    subtitle: '천자문과 물방울이 만나는 후기 작업',
    description:
      '1970년대 중반 신문지 위에 물방울을 그리며 문자와의 결합을 시도하다, 1980년대 중반부터 캔버스에 직접 천자문을 쓴 뒤 그 위에 물방울을 그리기 시작했습니다. 김창열은 어린 시절 할아버지로부터 천자문을 배웠는데, 그에게 천자문은 단순한 글이 아니라 "자연과 우주의 질서를 인식하는 기호"였고 유년의 기억과 긴밀하게 연결되는 고리였습니다. 마치 습자지에 글씨를 써내려가듯 화면을 천자문으로 촘촘히 채워나가며, 흔들리고 어슴푸레한 문자 표면 위에 물방울을 띄웁니다. 남프랑스 드라기냥 작업실에서 강렬한 햇빛과 풍요로운 자연을 만나며 본격적으로 색채를 탐구했고 화면은 더욱 대형화되었습니다. 천자문(세계 이해의 토대)과 물방울(존재에 대한 질문)이 조우하는 회귀 연작은 기억을 담는 문자와 곧 소멸할 물방울의 긴장 속에서, 기존 회화의 문법을 넘어서는 독자적 미학적 성취를 보여줍니다.',
  },
];

export default function RecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [selectedType, setSelectedType] = useState<SAYUTypeCode | null>(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPersona = async () => {
      if (user?.personality_type) {
        setSelectedType(user.personality_type as SAYUTypeCode);
        return;
      }
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('personality_type')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          if (data?.personality_type) {
            setSelectedType(data.personality_type as SAYUTypeCode);
          }
        } catch (err) {
          console.error('Failed to load personality_type:', err);
        }
      }
    };
    loadPersona();
  }, [user, supabase]);

  
useEffect(() => {
    if (!selectedType) return;

    
    const filtered = MMCA_ARTWORKS.filter(artwork => {
      return artwork.aptRecommendations && artwork.aptRecommendations[selectedType];
    }).map(artwork => {
      const reason =
        curatedReasons[selectedType]?.[artwork.id] ||
        artwork.aptRecommendations?.[selectedType] ||
        '이 작품도 당신에게 말을 걸고 있습니다.';
      return { ...artwork, reason };
    });

    const existingIds = new Set(filtered.map(a => a.id));
    const fillers = MMCA_ARTWORKS.filter(a => !existingIds.has(a.id))
      .slice(0, Math.max(0, 3 - filtered.length))
      .map(a => ({ ...a, reason: '이 작품 앞에서 잠시 머물러보세요.' }));
    setRecommendedArtworks([...filtered, ...fillers]);
  }, [selectedType]);


const introText = useMemo(() => {
    if (!selectedType) return '';
    return introMessages[selectedType] || introMessages.default || '각 작품에 담긴 김창열의 상처, 치유, 사유의 흐름을 느껴보세요.';
  }, [selectedType]);

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">나를 위한 추천 작품</h1>
                <p className="text-sm text-gray-400">Art Persona를 선택하세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">당신의 Art Persona는?</h2>
            <p className="text-sm text-gray-400">
              퀴즈를 완료하셨다면 자동으로 적용됩니다. 아니면 직접 선택해주세요.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {APT_OPTIONS.map((option) => (
              <motion.button
                key={option.code}
                onClick={() => setSelectedType(option.code as SAYUTypeCode)}
                className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-xs font-bold text-white mb-1">{option.code}</div>
                <div className="text-xs text-gray-400">{option.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedType(null)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">당신을 위한 추천 작품</h1>
              <p className="text-sm text-gray-400">
                {APT_OPTIONS.find(o => o.code === selectedType)?.label} ({selectedType})
              </p>
            </div>
            <div className="text-2xl">
              {APT_OPTIONS.find(o => o.code === selectedType)?.emoji}
            </div>
          </div>
        </div>
      </div>

      {/* Artwork Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Special Intro Message */}
        {recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30"
          >
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">당신을 위한 특별한 여정</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {introText}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {recommendedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">추천 작품이 아직 준비되지 않았습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedArtwork(artwork)}
                className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all"
              >
                {/* Artwork Image */}
                <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
                  <img
                    src={encodeURI(artwork.imageUrl)}
                    alt={artwork.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="p-2 bg-purple-500/90 backdrop-blur-sm rounded-full">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Artwork Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {artwork.year} · {artwork.room}
                  </p>

                  {/* Recommendation Reason */}
                  <div className="flex items-start gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Heart className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-300 leading-relaxed">
                      {artwork.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Exhibition Sections (1~4장) */}
        <div className="mt-12 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-300" />
            전시 구성 (1장~4장)
          </h3>
          {EXHIBITION_SECTIONS.map(section => {
            const isOpen = !!openSections[section.id];
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-blue-700/40 rounded-2xl bg-slate-900/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections(prev => ({ ...prev, [section.id]: !isOpen }))
                  }
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-blue-900/40 transition-colors"
                >
                  <div>
                    <div className="text-sm text-blue-200">{section.title}</div>
                    <div className="text-base font-semibold text-white">{section.subtitle}</div>
                  </div>
                  <div className="text-blue-200 text-sm">{isOpen ? '닫기' : '더보기'}</div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-sm text-gray-200 leading-relaxed"
                    >
                      {section.description}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Team Common Recommendations */}
        {recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              팀 전체 꼭 함께 봐야 할 것들
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-2">1. 8전시실 '무슈 구뜨, 김창열' 아카이브</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  작가가 '무슈 구뜨(Monsieur Gouttes·물방울 씨)'로 불렸던 이야기를 만날 수 있는 별도 공간입니다.
                </p>
              </div>
              <div className="p-4 bg-black/20 rounded-xl">
                <h4 className="font-bold text-white mb-2">2. 작가 육성 영상</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  영화 '물방울을 그리는 남자' 축약본을 통해 작가의 육성과 여정을 들을 수 있습니다.
                </p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <h4 className="font-bold text-amber-300 mb-2">💬 관람 후 함께 이야기 나눠요</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• 김창열에게 물방울은 무엇이었을까요? 전쟁의 상처? 치유? 수행? 존재 증명?</li>
                  <li>• 각자 가장 인상 깊었던 작품과 그 이유는 무엇인가요?</li>
                  <li>• 앵포르멜에서 물방울까지의 변화 과정에서 무엇을 느끼셨나요?</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArtwork(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden border border-gray-700"
              >
                <div className="relative aspect-[4/3] bg-gray-950">
                  <img
                    src={encodeURI(selectedArtwork.imageUrl)}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedArtwork.title}</h3>
                      <p className="text-sm text-gray-400">{selectedArtwork.year} · {selectedArtwork.room}</p>
                    </div>
                    <span className="text-2xl">
                      {APT_OPTIONS.find(o => o.code === selectedType)?.emoji}
                    </span>
                  </div>

                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-start gap-2">
                    <Heart className="w-5 h-5 text-purple-300 mt-0.5" />
                    <p className="text-sm text-gray-200 leading-relaxed">{selectedArtwork.reason}</p>
                  </div>

                  {selectedArtwork.description && (
                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 flex items-start gap-2">
                      <Info className="w-5 h-5 text-gray-300 mt-0.5" />
                      <p className="text-sm text-gray-200 leading-relaxed">{selectedArtwork.description}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
