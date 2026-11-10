import React, { useState } from 'react';
import { DENTAL_PRESET_SAMPLES, DentalPresetSample, DENTAL_SCHOOLS } from '../data/dentalMasterData';
import { GeneratedPromptResult } from '../types/interview';
import { apiFetch } from '../utils/standaloneApiEngine';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Cpu, 
  Lightbulb, 
  Microscope,
  Stethoscope
} from 'lucide-react';

interface DentalPromptTabProps {
  onStartMockWithPrompt?: (promptText: string, major: string) => void;
}

export const DentalPromptTab: React.FC<DentalPromptTabProps> = ({
  onStartMockWithPrompt,
}) => {
  const [targetSchool, setTargetSchool] = useState('경희대학교 치의예과');
  const [interviewType, setInterviewType] = useState('MMI 다중미니면접');
  const [purpose, setPurpose] = useState('생기부 세특 기반 심층 꼬리질문 발굴');
  const [studentActivities, setStudentActivities] = useState(DENTAL_PRESET_SAMPLES[0].schoolRecordSnippet);
  const [focusOrWeakness, setFocusOrWeakness] = useState(DENTAL_PRESET_SAMPLES[0].focusVerification);
  const [userType, setUserType] = useState<'학부모' | '수험생 본인'>('수험생 본인');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<GeneratedPromptResult | null>(null);

  const handleApplyPreset = (sample: DentalPresetSample) => {
    setStudentActivities(sample.schoolRecordSnippet);
    setFocusOrWeakness(sample.focusVerification);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/gemini/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMajor: `${targetSchool} (치의예과/치의학과)`,
          interviewType,
          purpose,
          studentActivities,
          focusOrWeakness,
          userType,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.engineeredPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-500/30">
            <Microscope className="w-3.5 h-3.5" />
            치의예과 수석 입학사정관 & 치의학교육학 교수 페르소나
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            치의학 세특 심층 프롬프트 엔지니어링 생성기
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            충치균 바이오필름, 불소 재광화 반응, 티타늄 임플란트 표면처리, 교정역학 등 치의예과 지원자의 고난도 탐구 기록을 
            <strong>3단계 꼬리질문 검증 체계(동기-난관-치의학 확장)</strong>와 <strong>블라인드 제약조건</strong>으로 완벽히 설계합니다.
          </p>
        </div>

        {/* 6 High-Tier Dental Presets */}
        <div className="mt-6 pt-5 border-t border-emerald-800/60">
          <div className="text-xs font-semibold text-emerald-300 mb-2.5">
            치의예과 합격생 대표 세특 탐구 프리셋 불러오기:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DENTAL_PRESET_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleApplyPreset(sample)}
                className="p-2.5 rounded-xl text-left bg-slate-900/40 border border-slate-700/60 hover:bg-emerald-900/30 hover:border-emerald-500/50 text-xs text-slate-200 transition-all"
              >
                <div className="text-[10px] text-emerald-400 font-semibold mb-0.5 truncate">
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
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            치의예과 지원 정보 입력
          </h2>

          {/* User type selector */}
          <div className="grid grid-cols-2 gap-2">
            {(['수험생 본인', '학부모'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  userType === type
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Target School */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              목표 치과대학
            </label>
            <select
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {DENTAL_SCHOOLS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.interviewType.split('(')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              면접 전형 유형
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="MMI 다중미니면접">MMI 다중미니면접 (의료윤리 / 환자공감 / 손기술 적성)</option>
              <option value="서류기반 면접(생활기록부 진위 확인)">서류기반 심층면접 (생기부 세특 사실 검증)</option>
              <option value="제시문 기반 심층 면접">제시문 기반 심층 면접 (구강의과학 / 공공정책)</option>
              <option value="인성 및 직업윤리 면접">인성 및 치과의사 직업윤리 면접</option>
            </select>
          </div>

          {/* Student Activities */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              생활기록부 세특 및 치의학 연계 탐구 요약
            </label>
            <textarea
              rows={6}
              value={studentActivities}
              onChange={(e) => setStudentActivities(e.target.value)}
              placeholder="생명과학, 화학, 물리학 교과 세특이나 동아리 탐구보고서 내용을 적어주세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
            />
          </div>

          {/* Focus or Weakness */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              사정관에게 집중적으로 검증받고 싶은 포인트
            </label>
            <input
              type="text"
              value={focusOrWeakness}
              onChange={(e) => setFocusOrWeakness(e.target.value)}
              placeholder="예: 실험 변수 통제 검증, 비전공자 대상 쉬운 설명력, 손기술 적성 연결"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                치의대 교수 페르소나 주입 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                치의예과 맞춤 마스터 프롬프트 생성
              </>
            )}
          </button>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    생성 완료 · ChatGPT / Claude / Gemini에 그대로 붙여넣으세요
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {result.promptTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? '복사 완료!' : '프롬프트 복사'}
                  </button>
                </div>
              </div>

              {/* Prompt box */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  치의학 교수 페르소나가 주입된 완성형 프롬프트
                </label>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                    {result.engineeredPrompt}
                  </pre>
                </div>
              </div>

              {/* Engineering tactics breakdown */}
              {result.promptEngineeringTechniques && result.promptEngineeringTechniques.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2 text-xs">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    이 프롬프트에 적용된 치의학 검증 엔지니어링
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.promptEngineeringTechniques.map((t, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200/50 dark:border-emerald-800/50">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{t.technique}</div>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parent / student coaching tip */}
              {result.parentCoachingTip && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    치의예과 면접 코칭 조언
                  </div>
                  <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {result.parentCoachingTip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  세특 기록을 입력하고 프롬프트를 생성해 보세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  상단의 대표 세특 샘플(바이오필름, 불소 재광화, 티타늄 SLA 표면처리, 교정역학 등)을 클릭하시면 검증된 프리셋이 즉시 채워집니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-left text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  치의대 사정관의 세특 3단계 꼬리질문 공식:
                </div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>개념의 비전공자 설명력:</strong> 어려운 의학용어를 읊는 것이 아니라, 중학생도 이해할 수 있는 일상 언어로 본질을 짚을 수 있는가?</li>
                  <li><strong>가설 검증과 변수 통제:</strong> 실험 중 오차가 발생했을 때 어떤 과학적 추론으로 변수를 통제했는가?</li>
                  <li><strong>임상 치의학과의 연결:</strong> 이 기초 탐구가 실제 치과 체어에서 환자의 질병 치료나 구강보건에 어떻게 기여할 수 있는가?</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
