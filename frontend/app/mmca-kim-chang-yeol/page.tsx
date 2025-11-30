'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Camera, Users, Map, ArrowRight } from 'lucide-react';
import { MMCA_EXHIBITIONS, MMCA_ARTISTS } from '@/data/mmca-tour-data';

export default function MMCAKimChangYeolPage() {
  const router = useRouter();
  const exhibition = MMCA_EXHIBITIONS[0];
  const artist = MMCA_ARTISTS[0];

  const features = [
    {
      id: 'recommendations',
      icon: Sparkles,
      title: '나를 위한 추천 작품',
      description: '당신의 Art Persona에 맞는 김창열 작품을 추천받아보세요',
      color: 'from-purple-500 to-pink-500',
      path: '/mmca-kim-chang-yeol/recommendations'
    },
    {
      id: 'record',
      icon: Camera,
      title: '작품 감상 기록',
      description: '마음에 드는 작품을 사진으로 남기고 감상을 기록하세요',
      color: 'from-blue-500 to-cyan-500',
      path: '/mmca-kim-chang-yeol/record'
    },
    {
      id: 'dashboard',
      icon: Users,
      title: '팀 대시보드',
      description: '팀원들의 감상 기록을 실시간으로 확인하세요',
      color: 'from-amber-500 to-orange-500',
      path: '/mmca-kim-chang-yeol/dashboard'
    }
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
                김창열
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              물방울
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
                오늘 투어 순서: <span className="text-purple-300 font-medium">1F: 8전시실</span> → <span className="text-purple-300 font-medium">B1F: 6전시실</span> → <span className="text-purple-300 font-medium">7전시실</span>
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
                  국립현대미술관 서울
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
            전시 체험하기
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
            전시 구성
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: '1장. 상흔', floor: '6전시실', period: '1950년대', color: 'from-red-500 to-orange-500' },
              { title: '2장. 현상', floor: '6전시실', period: '1965-1970', color: 'from-yellow-500 to-amber-500' },
              { title: '3장. 물방울', floor: '6전시실', period: '1971년 이후', color: 'from-cyan-500 to-blue-500' },
              { title: '4장. 회귀', floor: '7전시실', period: '1980년대 이후', color: 'from-purple-500 to-pink-500' }
            ].map((section, index) => (
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
