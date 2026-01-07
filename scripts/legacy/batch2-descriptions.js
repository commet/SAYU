const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// BATCH 2 전시 설명 데이터
const batch2Descriptions = [
  {
    // 1. 신상은 - SEEING AND BEING SEEN (Small but Great)
    exhibition_id: "5ac404b8-4f02-4824-9f66-2d563f588283",

    master: {
      title_ko: "SEEING AND BEING SEEN",
      title_en: "SEEING AND BEING SEEN",
      artist_name: "신상은",
      artist_name_en: "Shin Sang Eun",
      start_date: "2025-09-12",
      end_date: "2025-10-02",
      venue_id: "SMALL_BUT_GREAT",
      source_url: "https://www.instagram.com/smallbutgreat_official/",
      instagram_url: "https://www.instagram.com/smallbutgreat_official/"
    },

    translations: {
      ko: {
        exhibition_title: "SEEING AND BEING SEEN",
        artists: ["신상은"],
        description: "신상은의 회화는 존 버거의 '시선의 정치학'을 새롭게 해석한다. 보는 자와 보이는 자, 응시와 회피, 노출과 은폐 사이의 미묘한 균열을 포착하며, 시선이 단순한 지각을 넘어 권력과 윤리, 욕망이 얽힌 관계적 장치임을 드러낸다. 작가는 소유로서의 시선을 거부하고 불편함과 편안함이 공존하는 양가적 시선을 탐구한다.",
        curator: "Small but Great",
        website_url: "https://www.instagram.com/smallbutgreat_official/"
      },
      en: {
        exhibition_title: "SEEING AND BEING SEEN",
        artists: ["Shin Sang Eun"],
        description: "Shin Sang Eun's paintings reinterpret John Berger's 'politics of seeing'. Capturing subtle cracks between seer and seen, gaze and avoidance, exposure and concealment, the work reveals how vision operates as a relational device entangled with power, ethics, and desire beyond mere perception.",
        curator: "Small but Great",
        website_url: "https://www.instagram.com/smallbutgreat_official/"
      }
    },

    venue: {
      venue_id: "SMALL_BUT_GREAT",
      name_ko: "Small but Great",
      name_en: "Small but Great",
      address: "서울시 마포구 독막로14길 14",
      website: "https://www.instagram.com/smallbutgreat_official/",
      instagram: "https://www.instagram.com/smallbutgreat_official/",
      phone: ""
    }
  },
  {
    // 2. 이상국 - Unfolding Nature (가나아트 한남)
    exhibition_id: "85e02234-2857-4980-9103-f25866ab3b0b",

    master: {
      title_ko: "Unfolding Nature",
      title_en: "Unfolding Nature",
      artist_name: "이상국",
      artist_name_en: "Lee Sang Guk",
      start_date: "2025-09-02",
      end_date: "2025-10-09",
      venue_id: "GANA_ART_HANNAM",
      source_url: "https://www.ganaart.com",
      instagram_url: "https://www.instagram.com/ganaart__official/"
    },

    translations: {
      ko: {
        exhibition_title: "Unfolding Nature",
        artists: ["이상국"],
        description: "이상국은 자연을 해체하고 재구성하며 본질적인 조형 가치를 추구하는 작가다. 서울대 동양화를 전공한 그는 초기에는 서울 서북부의 산동네와 공장지대를 그렸으나, 전업 작가 전향 후 자연의 본질을 탐구하는 독자적 조형 언어를 구축했다. 이번 전시는 초기 드로잉부터 후기 자연 회화까지 작가의 예술적 발자취를 보여준다.",
        curator: "가나아트",
        website_url: "https://www.ganaart.com"
      },
      en: {
        exhibition_title: "Unfolding Nature",
        artists: ["Lee Sang Guk"],
        description: "Lee Sang Guk pursues fundamental formal values by deconstructing and reconstructing nature. After studying Korean traditional painting at Seoul National University and initially depicting industrial zones and hillside neighborhoods, he developed his own artistic language exploring nature's essence after becoming a full-time artist in 1989.",
        curator: "Gana Art",
        website_url: "https://www.ganaart.com"
      }
    },

    venue: {
      venue_id: "GANA_ART_HANNAM",
      name_ko: "가나아트 한남",
      name_en: "Gana Art Hannam",
      address: "서울특별시 용산구 장문로 54, 지하 1층",
      website: "https://www.ganaart.com",
      instagram: "https://www.instagram.com/ganaart__official/",
      phone: "02-6953-5504"
    }
  },
  {
    // 3. 류봉식 - Echoes of Silence (가나아트센터)
    exhibition_id: "a4b23d9c-8bdd-4816-8c28-b6f9ccdc2a42",

    master: {
      title_ko: "Echoes of Silence",
      title_en: "Echoes of Silence",
      artist_name: "류봉식",
      artist_name_en: "Liu Fengzhi",
      start_date: "2025-09-26",
      end_date: "2025-10-26",
      venue_id: "GANA_ART_CENTER",
      source_url: "https://www.ganaart.com",
      instagram_url: "https://www.instagram.com/ganaart__official/"
    },

    translations: {
      ko: {
        exhibition_title: "Echoes of Silence",
        artists: ["류봉식"],
        description: "중국 하얼빈 출신 조선족 작가 류봉식(1964-2017)의 국내 첫 개인전. 상업적 흐름을 거부하고 '예술이란 무엇인가'라는 근본적 물음을 추구한 작가의 작품에는 천안문과 기념비가 시대의 흔적과 지워진 개인을 상징하고, 어린 시절 연 날리기에서 비롯된 비행기는 자유와 불안정을 동시에 담아낸다.",
        curator: "가나아트",
        website_url: "https://www.ganaart.com"
      },
      en: {
        exhibition_title: "Echoes of Silence",
        artists: ["Liu Fengzhi"],
        description: "First Korean solo exhibition of ethnic Korean artist Liu Fengzhi (1964-2017) from Harbin, China. Rejecting commercial trends to pursue fundamental questions about art, his works feature Tiananmen Square and monuments symbolizing historical traces and erased individuals, while airplanes from childhood kite-flying memories embody freedom and instability.",
        curator: "Gana Art",
        website_url: "https://www.ganaart.com"
      }
    },

    venue: {
      venue_id: "GANA_ART_CENTER",
      name_ko: "가나아트센터",
      name_en: "Gana Art Center",
      address: "서울시 종로구 평창30길 28",
      website: "https://www.ganaart.com",
      instagram: "https://www.instagram.com/ganaart__official/",
      phone: "02-720-1020"
    }
  },
  // 4. 번승훈 (가나아트센터) - 건너뜀 (류봉식으로 대체)
  {
    // 5. 정해윤 - 소리 없는 노래 (갤러리 나우)
    exhibition_id: "0ca2cce0-0b4e-4053-9089-5198ee8b750a",

    master: {
      title_ko: "소리 없는 노래",
      title_en: "Silent Song",
      artist_name: "정해윤",
      artist_name_en: "Jung Hae Yoon",
      start_date: "2025-08-28",
      end_date: "2025-09-27",
      venue_id: "GALLERY_NOW",
      source_url: "https://www.gallerynow.co.kr",
      instagram_url: "https://www.instagram.com/gallerynowseoul/"
    },

    translations: {
      ko: {
        exhibition_title: "소리 없는 노래",
        artists: ["정해윤"],
        description: "정해윤은 인조잔디를 회화의 바탕으로 삼아 언어 폭력이 일상화된 현대 사회를 성찰한다. 거칠고 불편한 표면 위에 정교한 이미지를 얹어 상처받은 마음이 아름다운 목소리로 태어나는 과정을 은유하며, 침묵이 무기력이 아닌 절제된 저항과 연대가 될 수 있음을 보여준다. '소리가 없다고 노래가 없는 것은 아니다'라는 작가의 메시지가 담겨있다.",
        curator: "갤러리나우",
        website_url: "https://www.gallerynow.co.kr"
      },
      en: {
        exhibition_title: "Silent Song",
        artists: ["Jung Hae Yoon"],
        description: "Jung Hae Yoon uses artificial turf as painting surface to reflect on modern society where verbal violence is normalized. Placing delicate images on rough, uncomfortable surfaces metaphorically represents wounded hearts being reborn as beautiful voices, showing how silence can be restrained resistance and solidarity rather than powerlessness.",
        curator: "Gallery NOW",
        website_url: "https://www.gallerynow.co.kr"
      }
    },

    venue: {
      venue_id: "GALLERY_NOW",
      name_ko: "갤러리나우",
      name_en: "Gallery NOW",
      address: "서울시 강남구 언주로 152길 16",
      website: "https://www.gallerynow.co.kr",
      instagram: "https://www.instagram.com/gallerynowseoul/",
      phone: "02-725-2930"
    }
  },
  {
    // 6. 이유진 - 부드러운 야생 (갤러리 지우헌)
    exhibition_id: "284f9c11-7566-4946-a9ad-53f1ae417f6b",

    master: {
      title_ko: "부드러운 야생",
      title_en: "Soft Wild",
      artist_name: "이유진",
      artist_name_en: "Yi Youjin",
      start_date: "2025-09-03",
      end_date: "2025-10-18",
      venue_id: "GALLERY_JIWOOHEON",
      source_url: "https://www.jiwooheon.com",
      instagram_url: "https://www.instagram.com/jiwooheon_dh/"
    },

    translations: {
      ko: {
        exhibition_title: "부드러운 야생",
        artists: ["이유진"],
        description: "독일 뮌헨을 기반으로 활동하는 아시아 대표 작가 이유진의 국내 세 번째 개인전. 한국과 독일 문화가 혼재된 작가의 정체성이 만들어낸 독보적 회화를 선보인다. 서로 다른 것들이 만나는 경계에서 시작되는 작업은 부드럽게 스며들면서도 팽팽한 긴장감을 유지한다. 키아프 하이라이트 첫 회 선정작가로서 미공개 신작 12점을 공개한다.",
        curator: "갤러리 지우헌",
        website_url: "https://www.jiwooheon.com"
      },
      en: {
        exhibition_title: "Soft Wild",
        artists: ["Yi Youjin"],
        description: "Third Korean solo exhibition of Munich-based Asian representative artist Yi Youjin. Showcasing distinctive paintings created from the artist's identity mixing Korean and German cultures. Works begin at boundaries where different things meet, gently permeating while maintaining tense dynamics. As the first KIAF Highlight selected artist, presents 12 unpublished new works.",
        curator: "Gallery Jiwooheon",
        website_url: "https://www.jiwooheon.com"
      }
    },

    venue: {
      venue_id: "GALLERY_JIWOOHEON",
      name_ko: "갤러리 지우헌",
      name_en: "Gallery Jiwooheon",
      address: "서울 종로구 북촌로11라길 13",
      website: "https://www.jiwooheon.com",
      instagram: "https://www.instagram.com/jiwooheon_dh/",
      phone: "0507-1342-7964"
    }
  },
  {
    // 7. 박영민·유지영·이은우 - 흩어진 말들 (갤러리 키체)
    exhibition_id: "167c8cd5-8bc1-406a-b05c-35f7faa0441c",

    master: {
      title_ko: "흩어진 말들",
      title_en: "Scattered Words",
      artist_name: "박영민, 유지영, 이은우",
      artist_name_en: "Park Youngmin, Yoo Jiyoung, Lee Eunu",
      start_date: "2025-08-28",
      end_date: "2025-09-27",
      venue_id: "GALLERY_KICHE",
      source_url: "https://www.gallerykiche.com/exhibitions/2905",
      instagram_url: "https://www.instagram.com/gallery_kiche/"
    },

    translations: {
      ko: {
        exhibition_title: "흩어진 말들",
        artists: ["박영민", "유지영", "이은우"],
        description: "일상의 틀과 고유한 작업 조건을 탐구하는 세 작가의 기획전. 박영민은 비선형적 스토리텔링으로 이야기에 다면적 관찰과 유연한 해석을 부여하고, 유지영은 일상의 리듬이 거시적 질서와 미시적 시간 속에 교차하는 방식을 회화로 기록한다. 이은우는 사물의 외피에 주목해 조각과 사물의 물질성에 따른 양태를 탐구한다.",
        curator: "갤러리 키체",
        website_url: "https://www.gallerykiche.com"
      },
      en: {
        exhibition_title: "Scattered Words",
        artists: ["Park Youngmin", "Yoo Jiyoung", "Lee Eunu"],
        description: "Group exhibition exploring daily frameworks and unique working conditions. Park Youngmin's non-linear storytelling grants multifaceted observation and flexible interpretation. Yoo Jiyoung records how daily rhythms intersect between macro order and micro time through painting. Lee Eunu focuses on objects' surfaces, exploring sculptural and material modalities.",
        curator: "Gallery Kiche",
        website_url: "https://www.gallerykiche.com"
      }
    },

    venue: {
      venue_id: "GALLERY_KICHE",
      name_ko: "갤러리 키체",
      name_en: "Gallery Kiche",
      address: "서울시 성북구 창경궁로43길 27",
      website: "https://www.gallerykiche.com",
      instagram: "https://www.instagram.com/gallery_kiche/",
      phone: "02-533-3414"
    }
  },
  {
    // 8. 최지목 - 백 개의 태양 (갤러리바톤)
    exhibition_id: "2701718d-24d6-42d3-876c-0d33015b1175",

    master: {
      title_ko: "백 개의 태양",
      title_en: "A Hundred Suns",
      artist_name: "최지목",
      artist_name_en: "Jimok Choi",
      start_date: "2025-08-20",
      end_date: "2025-09-20",
      venue_id: "GALLERY_BATON",
      source_url: "https://gallerybaton.com",
      instagram_url: "https://www.instagram.com/gallerybaton/"
    },

    translations: {
      ko: {
        exhibition_title: "백 개의 태양",
        artists: ["최지목"],
        description: "최지목은 에어 브러시와 붓을 병용해 잔상과 경계를 탐구한다. 에어 브러시로 경계 없는 중첩과 부유하는 색 덩어리의 비물질적 존재감을 표현하는 한편, 붓으로는 의도적으로 경계를 구축하고 고착시킨다. 빛의 파동이 겹치며 간섭무늬를 형성하듯, 감각의 재현을 넘어 순수 추상을 향한 작가의 갈망이 화면에 드러난다.",
        curator: "갤러리바톤",
        website_url: "https://gallerybaton.com"
      },
      en: {
        exhibition_title: "A Hundred Suns",
        artists: ["Jimok Choi"],
        description: "Jimok Choi explores afterimages and boundaries using both airbrush and brush techniques. While airbrushing depicts borderless juxtaposition and non-material presence of floating color masses, his brushwork deliberately creates and fixes boundaries. Like overlapping light waves forming interference patterns, his works reveal yearning for pure abstraction beyond sensory representation.",
        curator: "Gallery Baton",
        website_url: "https://gallerybaton.com"
      }
    },

    venue: {
      venue_id: "GALLERY_BATON",
      name_ko: "갤러리바톤",
      name_en: "Gallery Baton",
      address: "서울시 용산구 독서당로 116",
      website: "https://gallerybaton.com",
      instagram: "https://www.instagram.com/gallerybaton/",
      phone: "02-597-5701"
    }
  },
  {
    // 9. 윤형재 - 질서 너머, 여백 속의 구조 (갤러리제이원 서울)
    exhibition_id: "4e68e19d-a6e2-482c-81cd-04af47a1fb5c",

    master: {
      title_ko: "질서 너머, 여백 속의 구조",
      title_en: "Beyond Order, Structure Within Void",
      artist_name: "윤형재",
      artist_name_en: "Youn Hyung Jae",
      start_date: "2025-08-27",
      end_date: "2025-09-28",
      venue_id: "GALLERY_J_ONE_SEOUL",
      source_url: "https://www.galleryjone.com/2025YounHyungJae",
      instagram_url: "https://www.instagram.com/gallery_j.one/"
    },

    translations: {
      ko: {
        exhibition_title: "질서 너머, 여백 속의 구조",
        artists: ["윤형재"],
        description: "갤러리제이원 서울 개관전으로 열리는 윤형재 초대전. 점·선·면과 여백이 만들어내는 균형과 리듬을 탐구하며, 음악처럼 흐르는 리듬과 보이지 않는 긴장을 화면에 담는다. 작가에게 여백은 멈춤이 아닌 새로운 관계가 태어나는 자리이며, 동양적 여백의 감수성과 근대적 미의 조화를 통해 본질과 깊은 호흡을 지향한다.",
        curator: "갤러리제이원",
        website_url: "https://www.galleryjone.com"
      },
      en: {
        exhibition_title: "Beyond Order, Structure Within Void",
        artists: ["Youn Hyung Jae"],
        description: "Gallery J.ONE Seoul's opening exhibition featuring Youn Hyung Jae. Exploring balance and rhythm created by points, lines, planes and void, capturing musical rhythm and invisible tension. For the artist, void is not cessation but birthplace of new relationships, pursuing essence and deep breathing through harmony of Eastern void sensibility and modern aesthetics.",
        curator: "Gallery J.ONE",
        website_url: "https://www.galleryjone.com"
      }
    },

    venue: {
      venue_id: "GALLERY_J_ONE_SEOUL",
      name_ko: "갤러리제이원 서울",
      name_en: "Gallery J.ONE Seoul",
      address: "서울 종로구 북촌로5가길 24",
      website: "https://www.galleryjone.com",
      instagram: "https://www.instagram.com/gallery_j.one/",
      phone: ""
    }
  },
  {
    // 10. 민성홍 - 파편의 흐름 (갤러리조선)
    exhibition_id: "05e60ff1-46f6-4559-b5f3-2a953c342f73",

    master: {
      title_ko: "파편의 흐름",
      title_en: "Flow of Debris",
      artist_name: "민성홍",
      artist_name_en: "Min Sung Hong",
      start_date: "2025-08-28",
      end_date: "2025-09-28",
      venue_id: "GALLERY_CHOSUN",
      source_url: "https://www.gallerychosun.com/ko/exhibitions/207-flow-of-debris/",
      instagram_url: "https://www.instagram.com/gallerychosun/"
    },

    translations: {
      ko: {
        exhibition_title: "파편의 흐름",
        artists: ["민성홍"],
        description: "민성홍은 폐기된 가구와 사물을 수집하고 파편화하여 재조합하는 과정을 통해 이주와 퇴적의 흔적을 탐구한다. 10여년 만에 선보이는 회화 연작과 함께 설치, 조각 작업을 통해 사물의 파편들 사이의 새로운 연결을 모색하며, 제도적 언어로 포착되지 못한 채 부유하는 삶의 정치적 지형도를 그려낸다.",
        curator: "갤러리조선",
        website_url: "https://www.gallerychosun.com"
      },
      en: {
        exhibition_title: "Flow of Debris",
        artists: ["Min Sung Hong"],
        description: "Min Sung Hong explores traces of migration and sedimentation through collecting, fragmenting and reassembling abandoned furniture and objects. Presenting paintings for the first time in 10 years alongside installations and sculptures, he seeks new connections between fragments, mapping political topographies of lives floating beyond institutional language.",
        curator: "Gallery Chosun",
        website_url: "https://www.gallerychosun.com"
      }
    },

    venue: {
      venue_id: "GALLERY_CHOSUN",
      name_ko: "갤러리조선",
      name_en: "Gallery Chosun",
      address: "서울시 종로구 북촌로5길 64",
      website: "https://www.gallerychosun.com",
      instagram: "https://www.instagram.com/gallerychosun/",
      phone: "02-723-7133"
    }
  }
];

// 배치 2 업데이트 함수
async function updateBatch2() {
  console.log('========================================');
  console.log('BATCH 2 전체 테이블 업데이트 시작');
  console.log('========================================\n');

  let successCount = 0;
  let errorCount = 0;

  for (const exhibition of batch2Descriptions) {
    if (!exhibition.master) continue; // 아직 정보가 없는 전시는 스킵

    console.log(`\n처리 중: ${exhibition.master.title_ko} (${exhibition.exhibition_id})`);

    try {
      // 1. exhibitions_translations 업데이트 (한국어)
      const { error: koError } = await supabase
        .from('exhibitions_translations')
        .update({
          exhibition_title: exhibition.translations.ko.exhibition_title,
          artists: exhibition.translations.ko.artists,
          description: exhibition.translations.ko.description,
          curator: exhibition.translations.ko.curator || null,
          website_url: exhibition.translations.ko.website_url || null
        })
        .eq('exhibition_id', exhibition.exhibition_id)
        .eq('language_code', 'ko');

      if (koError) {
        console.error(`  ❌ exhibitions_translations (ko) 업데이트 실패:`, koError.message);
        errorCount++;
      } else {
        console.log('  ✅ exhibitions_translations (ko) 업데이트 성공');
        successCount++;
      }

      // 2. exhibitions_translations 업데이트 (영어)
      const { error: enError } = await supabase
        .from('exhibitions_translations')
        .update({
          exhibition_title: exhibition.translations.en.exhibition_title,
          artists: exhibition.translations.en.artists,
          description: exhibition.translations.en.description,
          curator: exhibition.translations.en.curator || null,
          website_url: exhibition.translations.en.website_url || null
        })
        .eq('exhibition_id', exhibition.exhibition_id)
        .eq('language_code', 'en');

      if (enError) {
        console.error(`  ❌ exhibitions_translations (en) 업데이트 실패:`, enError.message);
        errorCount++;
      } else {
        console.log('  ✅ exhibitions_translations (en) 업데이트 성공');
        successCount++;
      }

    } catch (error) {
      console.error(`❌ ${exhibition.exhibition_id} 처리 중 오류:`, error.message);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
  console.log('========================================');
}

// 실행
updateBatch2().catch(console.error);

module.exports = { batch2Descriptions, updateBatch2 };