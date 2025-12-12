'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Palette, LogOut, RefreshCw, User, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    nickname?: string;
    email?: string;
    personalityType?: string | null;
    gender?: string | null;
    ageRange?: string | null;
    region?: string | null;
  };
  onUpdate: (updates: any) => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  userInfo,
  onUpdate,
}: ProfileSettingsModalProps) {
  const { language } = useLanguage();
  const { signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState(userInfo.nickname || '');
  const [gender, setGender] = useState(userInfo.gender || '');
  const [ageRange, setAgeRange] = useState(userInfo.ageRange || '');
  const [region, setRegion] = useState(userInfo.region || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const personaLabel = useMemo(
    () => (language === 'ko' ? 'Art Persona' : 'Art Persona'),
    [language]
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ nickname, gender, ageRange, region, avatarFile });
      onUpdate({ nickname, gender, ageRange, region });
      toast.success(language === 'ko' ? '프로필이 업데이트되었습니다' : 'Profile updated successfully');
      onClose();
    } catch (error) {
      toast.error(language === 'ko' ? '업데이트에 실패했습니다' : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      onClose();
      await signOut();
      toast.success(language === 'ko' ? '로그아웃되었습니다' : 'Logged out successfully');
    } catch (error) {
      toast.error(language === 'ko' ? '로그아웃에 실패했습니다' : 'Logout failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-neutral-500">
                    {language === 'ko' ? '프로필 설정' : 'Profile Settings'}
                  </p>
                  <h2 className="text-2xl font-bold text-black">
                    {language === 'ko' ? '나의 정보' : 'My Profile'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar & Nickname */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center text-3xl">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        (nickname && nickname[0]) || (userInfo.email && userInfo.email[0]) || 'U'
                      )}
                    </div>
                    <label className="absolute -right-2 -bottom-2 bg-black text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {language === 'ko' ? '닉네임' : 'Nickname'}
                    </p>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                      placeholder={language === 'ko' ? '닉네임을 입력하세요' : 'Enter nickname'}
                    />
                  </div>
                </div>

                {/* Persona & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-sm text-neutral-600">
                    {language === 'ko' ? '이메일' : 'Email'}
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-700">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{userInfo.email || '-'}</span>
                    </div>
                  </label>

                  {userInfo.personalityType && (
                    <label className="flex flex-col gap-1 text-sm text-neutral-600">
                      {personaLabel}
                      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900">
                        <Palette className="w-4 h-4" />
                        <span className="font-semibold">{userInfo.personalityType}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto border border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 hover:text-neutral-900 focus-visible:text-neutral-900"
                          onClick={() => router.push('/quiz/narrative')}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          {language === 'ko' ? '다시 검사' : 'Retake'}
                        </Button>
                      </div>
                    </label>
                  )}
                </div>

                {/* Additional fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1 text-sm text-neutral-600">
                    {language === 'ko' ? '성별' : 'Gender'}
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">{language === 'ko' ? '선택 안 함' : 'Prefer not to say'}</option>
                      <option value="female">{language === 'ko' ? '여성' : 'Female'}</option>
                      <option value="male">{language === 'ko' ? '남성' : 'Male'}</option>
                      <option value="other">{language === 'ko' ? '기타' : 'Other'}</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-neutral-600">
                    {language === 'ko' ? '나이대' : 'Age Range'}
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">{language === 'ko' ? '선택 안 함' : 'Prefer not to say'}</option>
                      <option value="teens">10대</option>
                      <option value="twenties">20대</option>
                      <option value="thirties">30대</option>
                      <option value="forties">40대</option>
                      <option value="fifties">50대+</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-neutral-600">
                    {language === 'ko' ? '거주 지역' : 'Region'}
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                      placeholder={language === 'ko' ? '예: 서울, 경기' : 'e.g. Seoul, Busan'}
                    />
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleSave}
                    className="w-full bg-black text-white hover:bg-neutral-900"
                    disabled={isLoading}
                  >
                    {language === 'ko' ? '저장하기' : 'Save'}
                  </Button>

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full border border-neutral-300 text-neutral-900 hover:bg-neutral-200 hover:text-neutral-900 focus-visible:text-neutral-900"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'ko' ? '로그아웃' : 'Logout'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
