'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { SAYU_TYPES } from '@/shared/SAYUTypeDefinitions'
import { personalityAnimals } from '@/data/personality-animals'

// 타입별 배경 색상
const typeColors: Record<string, string> = {
  LAEF: 'from-purple-600 to-pink-600',
  LAEC: 'from-indigo-600 to-purple-600',
  LAMF: 'from-blue-900 to-indigo-900',
  LAMC: 'from-teal-700 to-blue-700',
  LREF: 'from-green-600 to-teal-600',
  LREC: 'from-pink-400 to-purple-400',
  LRMF: 'from-purple-700 to-indigo-700',
  LRMC: 'from-amber-700 to-brown-700',
  SAEF: 'from-pink-500 to-yellow-500',
  SAEC: 'from-blue-500 to-teal-500',
  SAMF: 'from-green-500 to-yellow-500',
  SAMC: 'from-orange-500 to-red-500',
  SREF: 'from-yellow-400 to-orange-400',
  SREC: 'from-cyan-400 to-blue-400',
  SRMF: 'from-gray-500 to-blue-500',
  SRMC: 'from-amber-600 to-orange-600'
}

// 그룹별 타이틀
const groupTitles: Record<string, { title: string; subtitle: string }> = {
  LA: { title: '고독한 추상파', subtitle: '혼자서 추상미술을 감상하는' },
  LR: { title: '고독한 구상파', subtitle: '혼자서 구상미술을 감상하는' },
  SA: { title: '사교적 추상파', subtitle: '함께 추상미술을 감상하는' },
  SR: { title: '사교적 구상파', subtitle: '함께 구상미술을 감상하는' }
}

export default function PersonalityOverviewPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // 그룹별로 타입 분류
  const typesByGroup = {
    LA: ['LAEF', 'LAEC', 'LAMF', 'LAMC'],
    LR: ['LREF', 'LREC', 'LRMF', 'LRMC'],
    SA: ['SAEF', 'SAEC', 'SAMF', 'SAMC'],
    SR: ['SREF', 'SREC', 'SRMF', 'SRMC']
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/results"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>결과로 돌아가기</span>
          </Link>
          
          <h1 className="text-lg font-semibold">16가지 예술 감상 유형</h1>
          
          <div className="w-24" /> {/* 균형을 위한 공간 */}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 소개 텍스트 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            모든 SAYU 성격 유형
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            각 유형마다 고유한 예술 감상 스타일이 있습니다. 
            당신의 유형과 다른 유형들의 특징을 비교해보세요.
          </p>
        </motion.div>

        {/* 그룹별 타입 표시 */}
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(typesByGroup).map(([groupKey, types], groupIndex) => {
            const group = groupTitles[groupKey]
            
            return (
              <motion.div
                key={groupKey}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                {/* 그룹 헤더 */}
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{group.title}</h3>
                  <p className="text-sm text-gray-600">{group.subtitle}</p>
                </div>

                {/* 타입 그리드 */}
                <div className="grid grid-cols-2 gap-4">
                  {types.map((typeCode) => {
                    const type = SAYU_TYPES[typeCode]
                    const animal = personalityAnimals[typeCode]
                    
                    return (
                      <motion.button
                        key={typeCode}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(typeCode)}
                        className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 
                                 hover:shadow-md transition-all duration-200 group"
                      >
                        {/* 배경 그라데이션 */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${typeColors[typeCode]} 
                                       opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                        
                        {/* 컨텐츠 */}
                        <div className="relative">
                          {/* 타입 코드 */}
                          <div className="text-xs font-mono text-gray-500 mb-2">{typeCode}</div>
                          
                          {/* 동물 이미지/이모지 */}
                          <div className="w-20 h-20 mx-auto mb-3 relative">
                            {animal.image ? (
                              <Image
                                src={animal.image}
                                alt={type.animal}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-4xl">
                                {type.emoji}
                              </div>
                            )}
                          </div>
                          
                          {/* 이름 */}
                          <h4 className="font-semibold text-sm mb-1">{type.name}</h4>
                          <p className="text-xs text-gray-600">{type.animal}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 추가 액션 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/personality-types"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white 
                     rounded-full hover:bg-purple-700 transition-colors"
          >
            자세히 알아보기
          </Link>
        </motion.div>
      </main>

      {/* 선택된 타입 모달 */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedType(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedType(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 타입 정보 */}
            <div className="text-center">
              {/* 동물 이미지 */}
              <div className="w-32 h-32 mx-auto mb-4 relative">
                {personalityAnimals[selectedType].image ? (
                  <Image
                    src={personalityAnimals[selectedType].image}
                    alt={SAYU_TYPES[selectedType].animal}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-6xl">
                    {SAYU_TYPES[selectedType].emoji}
                  </div>
                )}
              </div>

              {/* 타입 정보 */}
              <h3 className="text-2xl font-bold mb-2">
                {SAYU_TYPES[selectedType].name}
              </h3>
              <p className="text-lg text-gray-600 mb-1">
                {SAYU_TYPES[selectedType].animal} ({SAYU_TYPES[selectedType].animalEn})
              </p>
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-mono mb-4">
                {selectedType}
              </div>

              {/* 설명 */}
              <p className="text-gray-700 mb-6">
                {SAYU_TYPES[selectedType].description}
              </p>

              {/* 특성 */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">주요 특성</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SAYU_TYPES[selectedType].characteristics.map((char, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">동물 특징</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {personalityAnimals[selectedType].characteristics_ko.map((char, i) => (
                      <p key={i}>• {char}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="mt-6 flex gap-3 justify-center">
                <Link
                  href={`/results?type=${selectedType}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  이 유형 자세히 보기
                </Link>
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}