'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Download,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import {
  MMCA_EXHIBITIONS,
  MMCA_ARTISTS,
  MMCA_ARTWORKS
} from '@/data/mmca-tour-data';
import { MMCAExhibition, MMCAArtist, MMCAArtwork } from '@/types/mmca-tour';

type Tab = 'exhibitions' | 'artists' | 'artworks';

export default function MMCADataAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('artworks');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 데이터 내보내기 (JSON)
  const handleExport = () => {
    const data = {
      exhibitions: MMCA_EXHIBITIONS,
      artists: MMCA_ARTISTS,
      artworks: MMCA_ARTWORKS,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mmca-tour-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">MMCA Tour 데이터 관리</h1>
              <p className="text-sm text-white/50">전시, 작가, 작품 데이터 관리</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Download className="w-4 h-4" />
            JSON 내보내기
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['exhibitions', 'artists', 'artworks'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab === 'exhibitions' && `전시 (${MMCA_EXHIBITIONS.length})`}
              {tab === 'artists' && `작가 (${MMCA_ARTISTS.length})`}
              {tab === 'artworks' && `작품 (${MMCA_ARTWORKS.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'exhibitions' && (
          <ExhibitionsTable exhibitions={MMCA_EXHIBITIONS} />
        )}
        {activeTab === 'artists' && (
          <ArtistsTable artists={MMCA_ARTISTS} />
        )}
        {activeTab === 'artworks' && (
          <ArtworksTable artworks={MMCA_ARTWORKS} />
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold mb-3">데이터 수정 방법</h3>
          <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
            <li>
              현재 데이터는 <code className="px-1 py-0.5 bg-white/10 rounded text-amber-400">frontend/data/mmca-tour-data.ts</code> 파일에 정의되어 있습니다.
            </li>
            <li>
              작품을 추가/수정하려면 해당 파일의 <code className="px-1 py-0.5 bg-white/10 rounded text-amber-400">MMCA_ARTWORKS</code> 배열을 편집하세요.
            </li>
            <li>
              각 작품에는 APT 매칭을 위한 <code className="px-1 py-0.5 bg-white/10 rounded text-amber-400">styleTags, moodTags, themeTags</code>가 필요합니다.
            </li>
            <li>
              작품별 맞춤 추천 이유는 <code className="px-1 py-0.5 bg-white/10 rounded text-amber-400">aptRecommendations</code> 필드에 추가할 수 있습니다.
            </li>
          </ol>

          <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <p className="text-amber-400 text-sm">
              <strong>팁:</strong> MMCA 웹사이트에서 작품 정보를 수집할 때, 각 작품의 스타일, 분위기, 테마를
              파악하여 태그를 지정하세요. 이 태그들이 APT 유형과 매칭되어 개인화 추천에 사용됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// 전시 테이블
function ExhibitionsTable({ exhibitions }: { exhibitions: MMCAExhibition[] }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">전시명</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">위치</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">기간</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">작품 수</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {exhibitions.map(exhibition => {
            const artworkCount = MMCA_ARTWORKS.filter(
              a => a.exhibitionId === exhibition.id
            ).length;
            return (
              <tr key={exhibition.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-sm text-amber-400 font-mono">{exhibition.id}</td>
                <td className="px-4 py-3 text-sm text-white">{exhibition.title}</td>
                <td className="px-4 py-3 text-sm text-white/70">{exhibition.location}</td>
                <td className="px-4 py-3 text-sm text-white/50">
                  {exhibition.startDate} ~ {exhibition.endDate}
                </td>
                <td className="px-4 py-3 text-sm text-white">{artworkCount}개</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 작가 테이블
function ArtistsTable({ artists }: { artists: MMCAArtist[] }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">작가명</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">영문명</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">생몰년</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/70">작품 수</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {artists.map(artist => {
            const artworkCount = MMCA_ARTWORKS.filter(
              a => a.artistId === artist.id
            ).length;
            return (
              <tr key={artist.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-sm text-amber-400 font-mono">{artist.id}</td>
                <td className="px-4 py-3 text-sm text-white">{artist.name}</td>
                <td className="px-4 py-3 text-sm text-white/70">{artist.nameEn}</td>
                <td className="px-4 py-3 text-sm text-white/50">
                  {artist.birthYear && `${artist.birthYear}`}
                  {artist.birthYear && artist.deathYear && ' - '}
                  {artist.deathYear && `${artist.deathYear}`}
                </td>
                <td className="px-4 py-3 text-sm text-white">{artworkCount}개</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 작품 테이블
function ArtworksTable({ artworks }: { artworks: MMCAArtwork[] }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">작품명</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">작가</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">전시</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">위치</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">태그</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/70">APT 추천</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {artworks.map(artwork => {
              const artist = MMCA_ARTISTS.find(a => a.id === artwork.artistId);
              const exhibition = MMCA_EXHIBITIONS.find(e => e.id === artwork.exhibitionId);
              const aptCount = artwork.aptRecommendations
                ? Object.keys(artwork.aptRecommendations).length
                : 0;
              return (
                <tr key={artwork.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-amber-400 font-mono">{artwork.id}</td>
                  <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">
                    {artwork.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{artist?.name}</td>
                  <td className="px-4 py-3 text-sm text-white/50 max-w-[150px] truncate">
                    {exhibition?.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/50">
                    {artwork.floor} {artwork.room}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {artwork.styleTags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {artwork.moodTags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {aptCount > 0 ? (
                      <span className="text-amber-400">{aptCount}개 유형</span>
                    ) : (
                      <span className="text-white/30">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
