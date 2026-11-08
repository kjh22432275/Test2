import React, { useState } from 'react';
import { PRESET_SAMPLES, PresetSample } from '../data/presetSamples';
import { GeneratedPromptResult } from '../types/interview';
import { Copy, Check, Sparkles, HelpCircle, ArrowRight, Lightbulb, ShieldAlert, Cpu } from 'lucide-react';

interface PromptGeneratorTabProps {
  onStartMockWithPrompt: (promptText: string, major: string) => void;
  onSendToEvaluator: (major: string, question: string, answer: string) => void;
}

export const PromptGeneratorTab: React.FC<PromptGeneratorTabProps> = ({
  onStartMockWithPrompt,
}) => {
  const [targetMajor, setTargetMajor] = useState('컴퓨터공학과');
  const [interviewType, setInterviewType] = useState('서류기반 면접(생활기록부 확인)');
  const [purpose, setPurpose] = useState('생기부 세특 기반 심층 꼬리질문 발굴');
  const [studentActivities, setStudentActivities] = useState(PRESET_SAMPLES[0].studentActivities);
  const [focusOrWeakness, setFocusOrWeakness] = useState(PRESET_SAMPLES[0].focusPoint);
  const [userType, setUserType] = useState<'학부모' | '수험생 본인'>('학부모');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<GeneratedPromptResult | null>(null);

  const majorPresets = [
    '컴퓨터공학과',
    '인공지능학과',
    '경영학과',
    '경제학과',
    '의예과',
    '약학과',
    '생명공학과',
    '전자전기공학부',
    '미디어커뮤니케이션학과',
    '자율전공학부',
  ];

  const handleApplyPreset = (sample: PresetSample) => {
    setTargetMajor(sample.majorName.split('/')[0].trim());
    setStudentActivities(sample.studentActivities);
    setFocusOrWeakness(sample.focusPoint);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMajor,
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
      console.error(err);
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
      {/* Hero explanation & prompt engineering banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              학종 면접 합격의 열쇠
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              프롬프트 엔지니어링 기반 맞춤형 면접 프롬프트 생성기
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              입학사정관은 암기된 정답이 아니라 <strong>'활동의 자발적 동기'</strong>와 <strong>'난관 해결 과정'</strong>을 봅니다.
              일반 AI 질문의 한계를 극복하도록 <em>Role(사정관 페르소나)</em>, <em>Chain of Verification(3단계 꼬리질문)</em>, 
              <em>STAR/PREP 규격</em>을 적용한 고품질 프롬프트를 자녀 맞춤으로 조립해 드립니다.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span>수석 입학사정관 페르소나</span>
              <span aria-hidden="true">·</span>
              <span>블라인드 면접 규정 준수</span>
              <span aria-hidden="true">·</span>
              <span>1분 발화 호흡(400자) 제약</span>
              <span aria-hidden="true">·</span>
              <span>가정 내 학부모 코칭 팁 수록</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 max-w-xs text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              학부모님을 위한 이용 팁
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-normal">
              생기부에서 자녀가 가장 애착을 가진 탐구 1~2개만 간단히 적어 넣어도, 실제 면접관이 던질 날카로운 꼬리질문 프롬프트가 완성됩니다.
            </p>
          </div>
        </div>

        {/* Preset quick switcher */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 mb-2.5">
            빠른 실습을 위한 계열별 생기부 예시 샘플 불러오기:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleApplyPreset(sample)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {sample.sampleName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main input form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            자녀의 지원 정보 입력
          </h2>

          {/* User type selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              작성 요청자
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['학부모', '수험생 본인'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    userType === type
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Target Major */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              지원 희망 학과
            </label>
            <input
              type="text"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              placeholder="예: 컴퓨터공학과, 경영학과, 생명과학과..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {majorPresets.slice(0, 5).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMajor(m)}
                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              면접 유형
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="서류기반 면접(생활기록부 확인)">서류기반 면접 (생활기록부 진위 확인)</option>
              <option value="제시문 기반 면접">제시문 기반 심층 면접 (서울대/연세대/고려대 등)</option>
              <option value="인성 및 가치관 면접">인성 및 공동체역량 면접</option>
              <option value="MMI(다중미니면접)">MMI 다중미니면접 (의학/치의학/한의학/수의학)</option>
            </select>
          </div>

          {/* Generation Purpose */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              프롬프트 생성 목적
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="생기부 세특 기반 심층 꼬리질문 발굴">생기부 세특 기반 3단계 꼬리질문 발굴</option>
              <option value="STAR 구조 맞춤형 답변 템플릿 생성">STAR 구조 경험 맞춤형 답변 설계</option>
              <option value="1분 자기소개 및 지원동기 PREP 완성">1분 자기소개 및 지원동기 PREP 완성</option>
              <option value="학부모-자녀 가정 실전 모의면접 대본 및 채점표">가정용 학부모 면접관 질문지 & 채점표</option>
              <option value="전공 교수 시점의 학업역량 압박 질문">전공 교수 시점의 학업역량 압박 질문</option>
            </select>
          </div>

          {/* Student Activities Textarea */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              생활기록부 주요 활동 내용 (세특, 동아리, 탐구보고서 요약)
            </label>
            <textarea
              rows={4}
              value={studentActivities}
              onChange={(e) => setStudentActivities(e.target.value)}
              placeholder="예: 자녀가 수업 시간에 진행한 탐구 주제, 읽었던 도서, 실험 과정, 동아리 부장 활동 등을 2~5줄로 적어주세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Focus or Weakness */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              집중 대비 포인트 또는 보완하고 싶은 점 (선택)
            </label>
            <input
              type="text"
              value={focusOrWeakness}
              onChange={(e) => setFocusOrWeakness(e.target.value)}
              placeholder="예: 활동 진위 확인 질문 대비, 낮은 수학 내신 소명, 팀원 갈등 해결"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                사정관급 프롬프트 설계 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                프롬프트 엔지니어링 생성하기
              </>
            )}
          </button>
        </div>

        {/* Output container */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    생성 완료 · 복사하여 AI 대화창에 붙여넣으세요
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
                  <button
                    type="button"
                    onClick={() => onStartMockWithPrompt(result.engineeredPrompt, targetMajor)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                  >
                    모의면접 시작
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Prompt box */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  엔지니어링된 완성형 프롬프트 (ChatGPT / Gemini / Claude 공용)
                </label>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                    {result.engineeredPrompt}
                  </pre>
                </div>
              </div>

              {/* Engineering tactics breakdown */}
              {result.promptEngineeringTechniques && result.promptEngineeringTechniques.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    이 프롬프트에 적용된 4대 엔지니어링 기법 분석
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.promptEngineeringTechniques.map((tech, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-200 mb-1">
                          {tech.technique}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-normal">
                          {tech.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parent coaching tip */}
              {result.parentCoachingTip && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 space-y-1.5 text-xs">
                  <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    학부모 코칭 팁 (자녀와의 실전 대화법)
                  </div>
                  <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {result.parentCoachingTip}
                  </p>
                </div>
              )}

              {/* How to use guide */}
              {result.howToUseGuide && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                  <div className="font-medium text-slate-700 dark:text-slate-300">
                    실행 및 연습 가이드:
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">
                    {result.howToUseGuide}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  왼쪽 정보를 입력하고 버튼을 눌러주세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  자녀의 지원 학과와 생기부 활동을 넣으면, 입학사정관의 심층 꼬리질문과 1분 발화 호흡을 완벽히 유도하는 프롬프트가 즉시 생성됩니다.
                </p>
              </div>

              {/* Why prompt engineering card */}
              <div className="mt-6 text-left p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  왜 단순 질문 대신 "프롬프트 엔지니어링"이 필요한가요?
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    <strong>일반 질문:</strong> "컴공과 면접 예상 질문 알려줘" ➔ 교과서적이고 뻔한 이론 질문만 나와 실전 대비가 되지 않습니다.
                  </p>
                  <p>
                    <strong>엔지니어링된 프롬프트:</strong> 입학사정관 페르소나 부여 + 생기부 세특 사실 검증 3단계 + 블라인드 규정 제약조건 + PREP 400자 호흡을 강제하여, <em>"진짜 면접장에서 나올 압박 질문과 합격 답변"</em>을 뽑아냅니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
