'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getArtMemories } from '@/lib/supabase/gallery';
import type { ArtMemory } from '@/types/gallery';

// Fix Leaflet icon issue with CDN URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SeoulVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const SEOUL_VENUES: SeoulVenue[] = [
  { id: 'mmca',          name: '국립현대미술관 서울',  lat: 37.5785, lng: 126.9800 },
  { id: 'sema',          name: '서울시립미술관',       lat: 37.5640, lng: 126.9738 },
  { id: 'leeum',         name: '리움미술관',          lat: 37.5384, lng: 126.9990 },
  { id: 'amorepacific',  name: '아모레퍼시픽미술관',   lat: 37.5273, lng: 126.9727 },
  { id: 'daelim',        name: '대림미술관',          lat: 37.5414, lng: 126.9534 },
  { id: 'national',      name: '국립중앙박물관',       lat: 37.5240, lng: 126.9804 },
  { id: 'ddp',           name: 'DDP',               lat: 37.5670, lng: 127.0095 },
  { id: 'sac',           name: '예술의전당',          lat: 37.4784, lng: 127.0142 },
  { id: 'craft',         name: '서울공예박물관',       lat: 37.5718, lng: 126.9890 },
  { id: 'buk',           name: '북서울미술관',         lat: 37.6378, lng: 127.0543 },
  { id: 'arko',          name: '아르코미술관',         lat: 37.5807, lng: 126.9990 },
  { id: 'soma',          name: '소마미술관',          lat: 37.5207, lng: 127.1221 },
  { id: 'kukje',         name: '국제갤러리',          lat: 37.5800, lng: 126.9820 },
  { id: 'ilmin',         name: '일민미술관',          lat: 37.5717, lng: 126.9770 },
];

interface ExhibitionPoint {
  lat: number;
  lng: number;
  venue_name: string;
  status: string;
}

export default function MapTab() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visits, setVisits] = useState<ArtMemory[]>([]);
  const [exhibitionPoints, setExhibitionPoints] = useState<ExhibitionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user visits + exhibition points
  useEffect(() => {
    const load = async () => {
      try {
        const [visitResult, exRes] = await Promise.all([
          getArtMemories({ type: 'exhibition_visit', limit: 200 }),
          fetch('/api/exhibitions/map?status=current&limit=100').then((r) => r.json()).catch(() => null),
        ]);

        setVisits(visitResult.memories);

        if (exRes?.success && exRes.exhibitions) {
          setExhibitionPoints(
            exRes.exhibitions
              .filter((e: any) => e.lat && e.lng)
              .map((e: any) => ({
                lat: e.lat,
                lng: e.lng,
                venue_name: e.venue_name || e.title,
                status: e.status,
              }))
          );
        }
      } catch (e) {
        console.error('MapTab data load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Count visits per venue name (fuzzy)
  const visitCountByVenue = (() => {
    const map = new Map<string, number>();
    visits.forEach((v) => {
      const name = v.exhibitionData?.museum || v.location?.address || '';
      if (name) {
        const key = name.replace(/\s/g, '').toLowerCase();
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  })();

  const getVenueVisitCount = (venueName: string): number => {
    const key = venueName.replace(/\s/g, '').toLowerCase();
    for (const [k, count] of visitCountByVenue) {
      if (k.includes(key) || key.includes(k)) return count;
    }
    return 0;
  };

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;

    const timer = setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [37.5565, 126.9780],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Pulse animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes galleryMapPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        .gallery-map-marker { position: relative; }
      `;
      document.head.appendChild(style);

      // === Layer 1: Exhibition ongoing points (small green dots) ===
      exhibitionPoints
        .filter((e) => e.status === 'ongoing')
        .forEach((e) => {
          L.circleMarker([e.lat, e.lng], {
            radius: 4,
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.7,
            weight: 1,
          })
            .bindPopup(`<b>${e.venue_name}</b><br/><span style="color:#10B981;">진행중</span>`)
            .addTo(map);
        });

      // === Layer 2: Seoul venue markers ===
      SEOUL_VENUES.forEach((venue) => {
        const visitCount = getVenueVisitCount(venue.name);
        const isVisited = visitCount > 0;

        const icon = L.divIcon({
          className: 'gallery-map-marker',
          html: `
            <div style="
              width: 32px; height: 32px;
              background: ${isVisited ? '#8B5CF6' : 'rgba(156,163,175,0.5)'};
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              font-size: 16px;
              border: 2px solid ${isVisited ? '#7C3AED' : 'rgba(156,163,175,0.3)'};
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              position: relative;
            ">
              🏛️
              ${isVisited ? `
                <div style="
                  position: absolute; top: -4px; right: -4px;
                  background: #7C3AED; color: white;
                  width: 16px; height: 16px;
                  border-radius: 50%; font-size: 10px;
                  display: flex; align-items: center; justify-content: center;
                  font-weight: 700;
                ">${visitCount}</div>
              ` : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        L.marker([venue.lat, venue.lng], { icon })
          .bindPopup(`
            <div style="min-width:160px;">
              <b>${venue.name}</b>
              ${isVisited
                ? `<br/><span style="color:#7C3AED;font-size:12px;">${visitCount}회 방문</span>`
                : `<br/><span style="color:#9CA3AF;font-size:12px;">아직 방문 전</span>`
              }
            </div>
          `)
          .addTo(map);
      });

      // === Layer 3: User visit locations (not matching a known venue) ===
      visits.forEach((v) => {
        if (!v.location?.lat || !v.location?.lng) return;
        // Skip if very close to a known venue
        const nearVenue = SEOUL_VENUES.some(
          (sv) =>
            Math.abs(sv.lat - v.location!.lat) < 0.002 &&
            Math.abs(sv.lng - v.location!.lng) < 0.002
        );
        if (nearVenue) return;

        L.circleMarker([v.location.lat, v.location.lng], {
          radius: 6,
          color: '#8B5CF6',
          fillColor: '#8B5CF6',
          fillOpacity: 0.8,
          weight: 2,
        })
          .bindPopup(
            `<b>${v.exhibitionData?.name || '방문 기록'}</b><br/>` +
            `<span style="font-size:12px;color:#6B7280;">${new Date(v.timestamp).toLocaleDateString()}</span>`
          )
          .addTo(map);
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, exhibitionPoints, visits]);

  const totalVisits = visits.length;
  const visitedVenueCount = SEOUL_VENUES.filter((v) => getVenueVisitCount(v.name) > 0).length;

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: '600px' }}>
      {loading ? (
        <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-400 text-sm">지도를 불러오는 중...</div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="w-full h-full" />

          {/* No visits banner */}
          {totalVisits === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-full px-5 py-2 shadow-lg">
              <p className="text-sm text-neutral-600">
                전시를 방문하고 기록하면 지도에 표시됩니다
              </p>
            </div>
          )}

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
            <div className="flex gap-6">
              <div>
                <p className="text-xl font-light text-black">{totalVisits}</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">총 방문</p>
              </div>
              <div className="w-px bg-neutral-200" />
              <div>
                <p className="text-xl font-light text-black">{visitedVenueCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">방문 장소</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#8B5CF6' }} />
                <span className="text-neutral-600">방문한 곳</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(156,163,175,0.5)' }} />
                <span className="text-neutral-600">미술관</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                <span className="text-neutral-600">전시 진행중</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
