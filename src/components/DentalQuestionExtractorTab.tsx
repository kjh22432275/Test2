import React, { useState } from 'react';
import { DENTAL_PRESET_SAMPLES, DentalPresetSample, DENTAL_SCHOOLS } from '../data/dentalMasterData';
import { ExtractedQuestion } from '../types/interview';
import { 
  FileQuestion, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowRight, 
  HelpCircle, 
  Stethoscope,
  Microscope,
  Award,
  Building2
} from 'lucide-react';

interface DentalQuestionExtractorTabProps {
  onSelectQuestionForPractice: (question: string, school: string, context: string) => void;
  onSendToMMI?: () => void;
}

export const DentalQuestionExtractorTab: React.FC<DentalQuestionExtractorTabProps> = ({
  onSelectQuestionForPractice,
  onSendToMMI,
}) => {
  const [targetSchool, setTargetSchool] = useState('경희대학교 치의예과');
  const [activities, setActivities] = useState(DENTAL_PRESET_SAMPLES[0].schoolRecordSnippet);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleApplyPreset = (sample: DentalPresetSample) => {
    setActivities(sample.schoolRecordSnippet);
  };

  const handleExtract = async () => {
    if (!activities.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetMajor: `${targetSchool} (치의예과 학종 심층)`, 
          activities 
        }),
      });
      const data = await response.json();
      if (data.success && data.data && data.data.questions) {
        setQuestions(data.data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuestion = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-teal-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            <FileQuestion className="w-3.5 h-3.5" />
            경희·단국·경북·부산·조선 치의예과 학종 맞춤
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            치의예과 학생부 세특 기록 기반 적중 예상 질문 추출기
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            나이스(NEIS) 학교생활기록부에서 교과 세특(생명과학, 화학, 물리), 동아리, 진로활동 탐구 기록을 복사해 넣으세요.
            목표 대학 입학사정관이 면접장에서 반드시 검증할 <strong>학업역량(기초과학 원리) 2문항, 진로역량(치의학 적성·손기술) 2문항, 의료윤리 1문항</strong>을 도출합니다.
          </p>
        </div>

        {/* Preset quick switcher */}
        <div className="mt-6 pt-5 border-t border-teal-800/60">
          <div className="text-xs font-semibold text-teal-300 mb-2">
            치의학 대표 세특 탐구 샘플 불러오기 (실습용):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DENTAL_PRESET_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleApplyPreset(sample)}
                className="p-2.5 rounded-xl text-left bg-slate-900/40 border border-slate-700/60 hover:bg-teal-900/30 hover:border-teal-500/50 text-xs text-slate-200 transition-all"
              >
                <div className="text-[10px] text-teal-400 font-semibold mb-0.5 truncate">
                  {sample.field.split('&')[0]}
                </div>
                <div className="font-medium text-slate-100 line-clamp-1 text-[11px]">
                  {sample.title.split(':')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left input */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-teal-600" />
            분석할 생기부 세특 & 목표 대학
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              목표 지원 대학 (5개 치과대학 중 선택)
            </label>
            <select
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {DENTAL_SCHOOLS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.interviewType.split('(')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              생활기록부 세특/동아리/진로활동 기록 내용
            </label>
            <textarea
              rows={11}
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="아드님의 생활기록부에서 치의학과 연결될 수 있는 생명과학, 화학, 물리, 융합과학 세특이나 자율 탐구보고서 내용을 5~15줄 정도 복사해 넣으세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
            />
          </div>

          <button
            type="button"
            disabled={loading || !activities.trim()}
            onClick={handleExtract}
            className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                치의대 사정관의 눈으로 세특 스캔 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                적중 예상 질문 5문항 추출하기
              </>
            )}
          </button>
        </div>

        {/* Right question cards */}
        <div className="lg:col-span-7 space-y-4">
          {questions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {targetSchool} 사정관 적중 예상 질문 ({questions.length}문항)
                  </h3>
                  <span className="text-xs text-slate-500">
                    질문을 클릭하여 구술 답변 진단실로 바로 이동할 수 있습니다
                  </span>
                </div>
              </div>

              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 hover:border-teal-400 dark:hover:border-teal-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        q.category.includes('학업')
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : q.category.includes('진로')
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {q.sourceActivity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(q.id, q.question)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="질문 복사"
                      >
                        {copiedId === q.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectQuestionForPractice(q.question, targetSchool, q.sourceActivity)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 flex items-center gap-1 transition-colors"
                      >
                        답변 진단하기
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    Q{q.id}. {q.question}
                  </h4>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">사정관 출제 의도:</strong> {q.interviewerIntent}
                    </p>
                    <p className="text-teal-800 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/20 p-2 rounded-lg">
                      <strong>추천 답변 방향:</strong> {q.recommendedPrep}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  세특 기록을 넣고 질문을 추출해 보세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  치의예과 학생부종합전형 면접의 핵심은 <em>"이 어려운 실험/개념을 학생 본인이 진짜 스스로 탐구했는가?"</em>를 밝혀내는 것입니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-left text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  치의대 사정관의 생기부 검증 3대 법칙:
                </div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>생체 화학/물리 결합:</strong> 고교 교육과정의 기본 법칙(용해도곱, 모멘트, 세포막 수송 등)이 구강 환경에서 어떻게 실현되는지 설명할 수 있는가?</li>
                  <li><strong>과정의 진실성(Authenticity):</strong> 예상과 달랐던 실패 데이터나 오차 분석을 솔직하고 논리적으로 설명하는가?</li>
                  <li><strong>치의학적 발전가능성:</strong> 이 고교 탐구가 대학 입학 후 어떤 치의학 교과목(생체재료학, 구강미생물학, 보철학 등)으로 확장될 수 있는가?</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
