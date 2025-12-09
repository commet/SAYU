'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/ui/Footer';

type Section = {
  id: string;
  title: string;
  body?: string;
  bullets?: string[];
};

export default function TermsOfServicePage() {
  const { language } = useLanguage();
  const isKo = language === 'ko';

  const lastUpdated = '2025-08-31';

  const sections: Section[] = [
    {
      id: 'acceptance',
      title: isKo ? '1. 약관의 동의' : '1. Acceptance',
      body: isKo
        ? 'SAYU(이하 “서비스”)를 이용하면 본 약관과 개인정보 처리방침에 동의한 것으로 간주됩니다. 동의하지 않으면 이용을 중단해주세요.'
        : 'By using SAYU (the “Service”), you agree to these Terms and our Privacy Policy. If you do not agree, please stop using the Service.',
    },
    {
      id: 'scope',
      title: isKo ? '2. 서비스 내용' : '2. Service Scope',
      bullets: isKo
        ? [
            '예술 성향/추천, 큐레이션, 전시·작품 탐색',
            '커뮤니티 및 매칭 기능, 알림, 저장/북마크',
            'AI 기반 분석·추천, 안내 콘텐츠 제공',
          ]
        : [
            'Art preference tests, recommendations, curation, exhibition/art discovery',
            'Community and matching features, notifications, saves/bookmarks',
            'AI-based analysis/recommendations and informational content',
          ],
    },
    {
      id: 'eligibility',
      title: isKo ? '3. 이용 자격' : '3. Eligibility',
      bullets: isKo
        ? [
            '만 14세 이상만 가입·이용할 수 있습니다.',
            '본인 명의의 정확한 정보로 가입해야 합니다.',
          ]
        : [
            'You must be at least 14 years old to sign up and use the Service.',
            'You must register with accurate, truthful information.',
          ],
    },
    {
      id: 'account',
      title: isKo ? '4. 계정 및 보안' : '4. Account & Security',
      bullets: isKo
        ? [
            '계정 정보(이메일, 비밀번호)를 안전하게 보관할 책임이 있습니다.',
            '타인에게 계정을 대여, 양도, 판매할 수 없습니다.',
            '비정상 활동이 감지되면 사전 통보 없이 이용을 제한할 수 있습니다.',
          ]
        : [
            'You are responsible for safeguarding your credentials.',
            'You may not lend, transfer, or sell your account.',
            'We may restrict or suspend accounts for suspicious activity without prior notice.',
          ],
    },
    {
      id: 'user-content',
      title: isKo ? '5. 이용자 콘텐츠' : '5. User Content',
      bullets: isKo
        ? [
            '업로드·작성한 콘텐츠에 대한 권리는 원저작자에게 있습니다.',
            '서비스 제공·개선 목적의 비독점적 사용·저장·전시 라이선스를 SAYU에 부여합니다.',
            '불법/타인 권리 침해/부적절 콘텐츠는 예고 없이 삭제될 수 있습니다.',
          ]
        : [
            'You retain rights to content you submit or upload.',
            'You grant SAYU a non-exclusive license to use, store, and display it to operate/improve the Service.',
            'Illegal, infringing, or inappropriate content may be removed without notice.',
          ],
    },
    {
      id: 'payments',
      title: isKo ? '6. 유료 기능' : '6. Paid Features',
      bullets: isKo
        ? [
            '현재 주요 기능은 무료이나, 향후 구독/유료 상품이 추가될 수 있습니다.',
            '유료 결제 시 별도의 결제·환불 정책이 적용되며, 고지 후 시행됩니다.',
          ]
        : [
            'Most features are free today; subscriptions/paid offerings may be added later.',
            'Payments/refunds will follow separate policies provided at purchase time.',
          ],
    },
    {
      id: 'prohibited',
      title: isKo ? '7. 금지 행위' : '7. Prohibited Conduct',
      bullets: isKo
        ? [
            '저작권 등 타인의 권리를 침해하는 행위',
            '모욕·혐오·차별·스토킹 등 타 이용자 괴롭힘',
            '스팸, 피싱, 악성코드 유포, 해킹 시도',
            '허위 정보·사칭 계정 생성, 자동화 도구 남용',
            '명시적 승인 없는 상업적 이용',
          ]
        : [
            'Infringing others’ intellectual property rights',
            'Harassment, hate, discrimination, or stalking',
            'Spam, phishing, malware distribution, hacking attempts',
            'Fake/impersonation accounts, abuse of automation',
            'Commercial use without explicit permission',
          ],
    },
    {
      id: 'privacy',
      title: isKo ? '8. 개인정보' : '8. Privacy',
      body: isKo
        ? '개인정보 처리에 관한 사항은 개인정보 처리방침을 따릅니다. 중요한 변경 시 사전 고지합니다.'
        : 'Personal data is handled per our Privacy Policy. Material changes will be notified in advance.',
    },
    {
      id: 'ip',
      title: isKo ? '9. 지식재산권' : '9. Intellectual Property',
      body: isKo
        ? '서비스 내 텍스트, 로고, UI, 소프트웨어 등은 SAYU 또는 라이선스 제공자의 자산입니다. 무단 복제·배포·변형을 금합니다.'
        : 'The Service’s text, logos, UI, and software are owned by SAYU or licensors. No unauthorized copying, distribution, or modification.',
    },
    {
      id: 'ai',
      title: isKo ? '10. AI 추천 및 면책' : '10. AI Recommendations & Disclaimer',
      bullets: isKo
        ? [
            'AI 결과는 참고용이며 정확성·완전성을 보장하지 않습니다.',
            '추천을 기반으로 한 개인적·재정적 결정에 대한 책임은 이용자에게 있습니다.',
          ]
        : [
            'AI outputs are informational only; accuracy/completeness is not guaranteed.',
            'You are responsible for decisions made based on recommendations.',
          ],
    },
    {
      id: 'liability',
      title: isKo ? '11. 책임의 한계' : '11. Limitation of Liability',
      body: isKo
        ? '서비스는 “있는 그대로” 제공되며, 법이 허용하는 범위 내에서 SAYU는 간접·우연·특별·결과적 손해에 대해 책임지지 않습니다.'
        : 'The Service is provided “as is”. To the fullest extent permitted, SAYU is not liable for indirect, incidental, special, or consequential damages.',
    },
    {
      id: 'changes',
      title: isKo ? '12. 서비스 및 약관 변경' : '12. Changes',
      body: isKo
        ? '서비스나 약관을 변경할 수 있으며, 중요한 변경은 사전 공지 후 적용됩니다. 변경 후 이용을 계속하면 변경 사항에 동의한 것으로 봅니다.'
        : 'We may update the Service and these Terms; material changes will be announced before they take effect. Continued use means acceptance.',
    },
    {
      id: 'termination',
      title: isKo ? '13. 이용 제한 및 해지' : '13. Suspension/Termination',
      bullets: isKo
        ? [
            '약관 위반, 불법행위, 타인 피해 발생 시 사전 통지 없이 이용을 제한하거나 해지할 수 있습니다.',
            '법령상 보관 의무가 없는 경우, 해지 시 계정과 데이터는 삭제될 수 있습니다.',
          ]
        : [
            'We may suspend or terminate accounts without notice for violations or unlawful/abusive conduct.',
            'Upon termination, your account/data may be deleted unless retention is required by law.',
          ],
    },
    {
      id: 'thirdparty',
      title: isKo ? '14. 제3자 서비스' : '14. Third-Party Services',
      body: isKo
        ? '외부 API·결제·소셜 로그인 등 제3자 서비스 이용 시 해당 사업자의 약관과 정책이 적용됩니다.'
        : 'Third-party APIs, payments, or social logins are subject to their own terms and policies.',
    },
    {
      id: 'law',
      title: isKo ? '15. 준거법 및 관할' : '15. Governing Law & Jurisdiction',
      body: isKo
        ? '본 약관은 대한민국 법률을 준거법으로 하며, 분쟁은 서울중앙지방법원을 전속 관할로 합니다.'
        : 'These Terms are governed by the laws of the Republic of Korea; disputes are subject to the exclusive jurisdiction of the Seoul Central District Court.',
    },
    {
      id: 'contact',
      title: isKo ? '16. 문의' : '16. Contact',
      body: isKo
        ? '문의: sayucurator@gmail.com'
        : 'Contact: sayucurator@gmail.com',
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45 },
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{isKo ? '서비스 이용약관' : 'Terms of Service'}</h1>
            <p className="text-sm text-neutral-600">
              {isKo ? `최종 업데이트: ${lastUpdated}` : `Last updated: ${lastUpdated}`}
            </p>
            <p className="text-neutral-700">
              {isKo
                ? 'SAYU를 안전하고 공정하게 이용하기 위해 필요한 기본 규칙을 정리했습니다. 아래 내용을 확인해 주세요.'
                : 'These rules help keep SAYU safe and fair for everyone. Please review the terms below.'}
            </p>
          </div>

          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                {...fadeInUp}
                className="px-6 py-5"
              >
                <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                {section.body && <p className="text-neutral-700 leading-relaxed">{section.body}</p>}
                {section.bullets && (
                  <ul className="mt-2 space-y-1 text-neutral-700 list-disc list-inside">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
