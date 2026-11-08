import React, { useState } from 'react';
import { DENTAL_SCHOOLS, DentalSchool } from '../data/dentalMasterData';
import { 
  Building2, 
  Search, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Check, 
  Copy, 
  ChevronRight,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface DentalSchoolsTabProps {
  onSelectSchoolPrompt?: (schoolName: string, promptText: string) => void;
}

export const DentalSchoolsTab: React.FC<DentalSchoolsTabProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'전체' | 'MMI' | '제시문' | '서류기반'>('전체');
  const [selectedSchool, setSelectedSchool] = useState<DentalSchool>(DENTAL_SCHOOLS[0]);
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  const filteredSchools = DENTAL_SCHOOLS.filter((school) => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.location.includes(searchQuery) ||
      school.pastQuestions.some((q) => q.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === '전체') return matchesSearch;
    if (filterType === 'MMI') return matchesSearch && school.interviewType.includes('MMI');
    if (filterType === '제시문') return matchesSearch && school.interviewType.includes('제시문');
    if (filterType === '서류기반') return matchesSearch && school.interviewType.includes('서류');
    return matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(text);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 text-white rounded-2xl border border-teal-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            <Building2 className="w-3.5 h-3.5" />
            수험생 맞춤 지원: 경희·단국·경북·부산·조선 5대 치과대학 학종 집중 분석
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            지원 5대 목표 치과대학 면접 기출 & 합격 전략 데이터베이스
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            아드님이 학생부종합전형으로 지원하는 <strong>경희대(네오르네상스), 단국대(DKU인재), 경북대(학종), 부산대(학석사 MMI), 조선대(학종)</strong> 
            5개 대학의 평가 방식, 인재상, 실제 기출 질문 및 1포인트 합격 공략법을 집중 제공합니다.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-5 border-t border-teal-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="대학명, 지역, 기출 키워드(불소, 임플란트, 손기술 등) 검색..."
              className="w-full pl-9.5 pr-4 py-2 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['전체', 'MMI', '제시문', '서류기반'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === t
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 11 Schools List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              치과대학 목록 ({filteredSchools.length}개교)
            </span>
            <span className="text-xs text-slate-400">클릭하여 상세 기출 열람</span>
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredSchools.map((school) => {
              const isSelected = selectedSchool.id === school.id;
              return (
                <div
                  key={school.id}
                  onClick={() => setSelectedSchool(school)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {school.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {school.location}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{school.timePerStudent}</span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      school.interviewType.includes('MMI')
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : school.interviewType.includes('제시문')
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {school.interviewType.split('(')[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {school.coreFeatures}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected School Deep Dive */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            
            {/* Header with quick stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 tracking-wide uppercase">
                  치과대학 전형 심층 가이드
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedSchool.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {selectedSchool.interviewType}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  면접실 구성 및 진행 시간
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedSchool.stations}
                </p>
                <p className="text-slate-500">{selectedSchool.timePerStudent}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  핵심 인재상 & 평가 중점
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-normal">
                  {selectedSchool.idealProfile}
                </p>
              </div>
            </div>

            {/* Past Questions Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  실제 면접 기출 및 빈출 예상 질문 3선
                </div>
                <span className="text-xs text-slate-400">클릭하여 복사 가능</span>
              </div>

              <div className="space-y-2.5">
                {selectedSchool.pastQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start justify-between gap-3 group hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                        0{idx + 1}.
                      </span>
                      <p className="leading-relaxed font-medium">{q}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 transition-colors"
                      title="질문 복사"
                    >
                      {copiedQuestion === q ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Box */}
            <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/40 text-xs space-y-1.5">
              <div className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                {selectedSchool.name} 최종 합격을 위한 1포인트 실전 공략법
              </div>
              <p className="text-teal-900 dark:text-teal-300/90 leading-relaxed">
                {selectedSchool.prepStrategy}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
