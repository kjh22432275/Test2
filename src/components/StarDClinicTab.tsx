import React, { useState, useEffect } from 'react';
import { DENTAL_SCHOOLS } from '../data/dentalMasterData';
import { 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Copy, 
  HelpCircle, 
  Scissors, 
  Mic, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Volume2
} from 'lucide-react';

interface StarDSample {
  id: string;
  schoolName: string;
  title: string;
  question: string;
  rawDraft: string;
  focusAspect: string;
}

const STAR_D_SAMPLES: StarDSample[] = [
  {
    id: 's-khu',
    schoolName: '경희대학교 치의예과',
    title: '[경희대] 레진 나노 필러 중합수축 화학 탐구',
    question: '화학 시간에 탐구한 치과용 레진의 중합수축 개선 연구에서 본인이 직접 기여한 점과 배운 점을 말해보시오.',
    rawDraft: `저는 화학Ⅱ 시간에 고분자 화합물을 배우며 치과용 복합 레진이 빛을 받아 중합될 때 부피가 2~5% 수축하여 미세 누출이 생긴다는 문제를 알게 되었습니다. 그래서 단량체의 반응성을 줄이기 위해 실리카 나노 필러의 함량을 단계별로 조절하는 가상 모델을 세웠습니다. 필러 함량이 높아질수록 점도가 높아져 조작이 어려웠지만, 초음파 분산법을 적용하여 분산도를 개선했습니다. 이 활동을 통해 이론과 실제 재료의 물성 차이를 체득했습니다.`,
    focusAspect: '구강생명과학 및 탐구심화'
  },
  {
    id: 's-dku',
    schoolName: '단국대학교(천안) 치의예과',
    title: '[단국대] 치아 교정 브라켓 모멘트 물리 역학',
    question: '물리학Ⅱ에서 탐구한 교정 브라켓의 모멘트-힘 비율(M/F)이 치아 이동에 미치는 영향에 대해 설명해 보세요.',
    rawDraft: `치아 교정 시 단순한 당김 힘만 주면 치아가 기울어지는 경사이동이 발생하여 치근이 손상될 수 있습니다. 저는 물리 시간에 배운 회전력 토크 공식을 적용해 브라켓 슬롯에 와이어를 꺾어 넣었을 때 생기는 우력 모멘트를 계산했습니다. 힘과 모멘트의 비율이 특정 수치에 도달해야 치아가 평행하게 이동하는 치체이동이 가능함을 시뮬레이션했습니다. 복잡한 수식 때문에 힘들었지만 끝까지 포기하지 않고 계산을 마쳤습니다.`,
    focusAspect: '문제해결 끈기 및 공간지각'
  },
  {
    id: 's-knu',
    schoolName: '경북대학교 치의예과',
    title: '[경북대] 첼로 연주와 현미경 표본 제작의 손기술',
    question: '치과의사에게 필요한 정밀한 손기술과 체력을 본인은 어떻게 단련해 왔습니까?',
    rawDraft: `저는 중학교 때부터 5년간 첼로를 연주해 왔습니다. 첼로는 기타와 달리 지판에 플랫이 없어서 1mm만 손가락이 빗나가도 불협화음이 납니다. 올바른 음정을 잡기 위해 거울을 보며 손가락 각도를 매일 연습했습니다. 또한 생명과학 시간에 식물 줄기를 면도날로 얇게 박절하여 현미경 프레파라트를 만들 때 손 떨림을 억제하며 성공적으로 기공을 관찰했습니다. 이런 활동들로 손재주가 좋아졌습니다.`,
    focusAspect: '손기술 및 정밀술기'
  },
  {
    id: 's-pnu',
    schoolName: '부산대학교 치의학전문대학원',
    title: '[부산대] 소아 충치 예방 멘토링과 치과공포 극복',
    question: '치과 진료를 극도로 두려워하는 환자를 만났을 때 의사로서 어떻게 대처할 것인지 본인의 경험을 바탕으로 말해보시오.',
    rawDraft: `지역아동센터에서 저소득층 아이들에게 양치 교육 멘토링을 진행했을 때, 치과 트라우마로 칫솔조차 입에 대지 않으려는 초등학교 1학년 아이가 있었습니다. 저는 억지로 강요하지 않고 핸드폰 3D 치아 캐릭터 앱으로 세균을 물리치는 게임을 보여주며 먼저 친해졌습니다. 아이가 스스로 칫솔을 잡을 때까지 기다려 주었습니다. 이를 통해 환자의 눈높이에서 소통하는 인내심이 중요함을 깨달았습니다.`,
    focusAspect: '자연치아 보존 및 환자공감 윤리'
  },
  {
    id: 's-csu',
    schoolName: '조선대학교 치의예과',
    title: '[조선대] 타액 완충용액 화학 평형과 산도 방어',
    question: '침(타액)의 산도 조절 메커니즘과 화학 교과 완충용액 원리의 연관성을 본인 탐구 중심으로 설명하시오.',
    rawDraft: `우리가 음식을 먹으면 충치균이 산을 만들어 입안 pH가 떨어지지만 침의 탄산수소나트륨 완충계가 작용해 원래 약알칼리로 회복됩니다. 저는 화학 시간에 르샤틀리에 원리를 배우며 탄산(H2CO3)과 중탄산염(HCO3-) 이온의 평형 이동을 그래프로 나타냈습니다. 산이 유입되었을 때 역반응이 진행되어 수소 이온 농도를 낮추는 과정을 정량적으로 계산했습니다. 인체 항상성의 신비로움을 배웠습니다.`,
    focusAspect: '구강생명과학 및 탐구심화'
  }
];

export const StarDClinicTab: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<StarDSample>(STAR_D_SAMPLES[0]);
  const [targetSchool, setTargetSchool] = useState(STAR_D_SAMPLES[0].schoolName);
  const [question, setQuestion] = useState(STAR_D_SAMPLES[0].question);
  const [rawAnswer, setRawAnswer] = useState(STAR_D_SAMPLES[0].rawDraft);
  const [focusAspect, setFocusAspect] = useState(STAR_D_SAMPLES[0].focusAspect);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // 1-minute oral pace countdown timer
  const [seconds, setSeconds] = useState(55);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, seconds]);

  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSeconds(55);
  };

  const handleApplySample = (sample: StarDSample) => {
    setSelectedSample(sample);
    setTargetSchool(sample.schoolName);
    setQuestion(sample.question);
    setRawAnswer(sample.rawDraft);
    setFocusAspect(sample.focusAspect);
    setResult(null);
    handleResetTimer();
  };

  const handleClinic = async () => {
    if (!rawAnswer.trim() || loading) return;
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/stard-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSchool,
          question,
          rawAnswer,
          focusAspect,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
        handleResetTimer();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawCharCount = rawAnswer.length;
  // Estimated speaking seconds at 7.5 characters per second (approx 400 chars in 53s)
  const estimatedSeconds = Math.round(rawCharCount / 7.5);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 text-white rounded-2xl border border-teal-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            <Flame className="w-3.5 h-3.5" />
            치의예과 합격의 황금 공식: STAR-D & 1분 입말 교정
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            STAR-D 답변 클리닉 & 1분 구술 교정 센터
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            일반 STAR(상황-과제-행동-결과)를 넘어 치의예과 면접의 당락을 결정짓는 
            <strong>『D: Dental Link & Dexterity(치의학 연계·손기술·의료윤리 승화)』</strong>를 완성하고, 
            문어체 글말을 <strong>1분 황금 호흡(380~430자 / 50~55초)의 당당한 입말 대본</strong>으로 교정합니다.
          </p>
        </div>

        {/* 5 Targeted Schools Quick Presets */}
        <div className="mt-6 pt-5 border-t border-teal-800/60">
          <div className="text-xs font-semibold text-teal-300 mb-2">
            지원 5대 치과대학 맞춤형 초안 샘플 불러오기:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {STAR_D_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleApplySample(sample)}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  selectedSample.id === sample.id
                    ? 'bg-teal-500/25 border-teal-400 text-white shadow-xs'
                    : 'bg-slate-900/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-[10px] font-bold text-teal-400 mb-0.5">{sample.schoolName.split(' ')[0]}</div>
                <div className="font-semibold truncate">{sample.title.split(']')[1] || sample.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Workspace */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mic className="w-5 h-5 text-teal-600" />
            초안 답변 입력 및 교정 설정
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              지원 목표 치과대학
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
              면접관의 질문
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 가장 의미 있었던 탐구 활동에서 배운 점을 말해보시오."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              D(치의학 연계) 강조 희망 포인트
            </label>
            <select
              value={focusAspect}
              onChange={(e) => setFocusAspect(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="손기술 및 정밀술기">손기술(Manual Dexterity) 및 0.1mm 오차 제어</option>
              <option value="구강생명과학 및 탐구심화">구강생명과학(미생물/재료/화학) 심화</option>
              <option value="자연치아 보존 및 환자공감 윤리">자연치아 보존 및 환자공감 의료윤리</option>
              <option value="문제해결 끈기 및 공간지각">문제해결 끈기 및 3차원 공간지각력</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                수험생의 원래 초안 답변 (자유롭게 입력)
              </label>
              <div className="text-xs text-slate-500 tabular-nums">
                <span className={rawCharCount >= 360 && rawCharCount <= 450 ? 'text-teal-600 font-bold' : ''}>
                  {rawCharCount}자
                </span>{' '}
                (예상: 약 {estimatedSeconds}초)
              </div>
            </div>
            <textarea
              rows={8}
              value={rawAnswer}
              onChange={(e) => setRawAnswer(e.target.value)}
              placeholder="아드님이 연습했던 초안 답변이나 머릿속에 있는 생각을 가감 없이 적어보세요. 부족하거나 두서없어도 AI가 완벽한 STAR-D 구조로 분해하고 1분 구술 입말로 다듬어 드립니다."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
            />
          </div>

          <button
            type="button"
            disabled={loading || !rawAnswer.trim()}
            onClick={handleClinic}
            className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                STAR-D 분해 및 1분 입말 교정 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                STAR-D 정밀 클리닉 & 1분 구술 교정하기
              </>
            )}
          </button>
        </div>

        {/* Right Output: STAR-D Breakdown & Oral Polish */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Pace & Verdict Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-slate-500">1분 발화 호흡 진단</div>
                    <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                      {result.paceVerdict}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400">교정 글자수:</span>{' '}
                      <span className="font-bold text-slate-900 dark:text-slate-100">{result.totalCharCount}자</span>
                    </div>
                    <span aria-hidden="true">·</span>
                    <div>
                      <span className="text-slate-400">예상 발화:</span>{' '}
                      <span className="font-bold text-teal-600 dark:text-teal-400">{result.estimatedPaceSeconds}초</span>
                    </div>
                  </div>
                </div>

                {/* 1-Minute Live Practice Countdown Timer */}
                <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center justify-center sm:justify-start gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      1분 실전 발화 페이스 타이머 (55초 기준)
                    </div>
                    <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                      교정된 대본을 소리 내어 읽으며 50~55초 사이에 마칠 수 있는지 점검하세요.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
                    </div>

                    {!isTimerRunning ? (
                      <button
                        type="button"
                        onClick={handleStartTimer}
                        className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                        title="타이머 시작"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePauseTimer}
                        className="p-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                        title="일시정지"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetTimer}
                      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      title="리셋"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* STAR-D 5-Stage Breakdown Table */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    STAR-D 5단계 구조 분해 분석
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* S */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">S (Situation · 상황)</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {result.starDAnalysis.situation.status}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{result.starDAnalysis.situation.content}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{result.starDAnalysis.situation.critique}</p>
                    </div>

                    {/* T */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">T (Task · 과제/오차)</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {result.starDAnalysis.task.status}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{result.starDAnalysis.task.content}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{result.starDAnalysis.task.critique}</p>
                    </div>

                    {/* A */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">A (Action · 주도적 행동)</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {result.starDAnalysis.action.status}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{result.starDAnalysis.action.content}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{result.starDAnalysis.action.critique}</p>
                    </div>

                    {/* R */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">R (Result & Reflection · 결과와 배움)</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {result.starDAnalysis.result.status}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{result.starDAnalysis.result.content}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{result.starDAnalysis.result.critique}</p>
                    </div>

                    {/* D (Highlight!) */}
                    <div className="p-3.5 rounded-lg border-2 border-teal-500 bg-teal-50/40 dark:bg-teal-950/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-teal-600" />
                          D (Dental Link & Dexterity · 치의학 & 손기술 승화)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-600 text-white">
                          핵심 승부처
                        </span>
                      </div>
                      <p className="text-teal-950 dark:text-teal-100 font-semibold">{result.starDAnalysis.dentalLink.content}</p>
                      <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-1">{result.starDAnalysis.dentalLink.critique}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breath-Marked Oral Script Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-teal-600" />
                    1분 실전 발화 대본 (호흡 지점 및 강조 표시)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyScript(result.polishedStarDAnswer)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '복사 완료' : '완성 대본 복사'}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-sans text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                  {result.oralDelivery.breathMarkedScript}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-slate-200">글말 ➔ 입말 교정:</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">
                      {result.oralDelivery.writtenVsSpokenAudit}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                    <strong className="text-amber-900 dark:text-amber-200">추임새·말끝 주의사항:</strong>
                    <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-normal">
                      {result.oralDelivery.fillerWordsWarning}
                    </p>
                  </div>
                </div>

                {result.schoolSpecificBonus && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-300">
                    <strong>💡 {targetSchool} 사정관 가산점 공략:</strong> {result.schoolSpecificBonus}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Guide before clinic */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  초안을 넣고 STAR-D 클리닉을 실행해 보세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  상단의 5대 치대 샘플을 누르시면 경희대(레진 나노필러), 단국대(교정 물리), 경북대(첼로 손기술), 부산대(치과공포 극복), 조선대(타액 완충) 초안을 바로 클리닉해 보실 수 있습니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-left text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  왜 치의예과 면접에서는 "STAR-D"가 필수인가요?
                </div>
                <p className="leading-relaxed">
                  일반적인 STAR 답변은 "제가 노력해서 동아리 1등을 했습니다(Result)"에서 끝납니다. 하지만 치의예과 면접관은 <strong>"그래서 그게 치과의사가 되는 것과 무슨 상관인가?"</strong>를 묻습니다. 
                  활동의 배움을 <strong>『D: 치의학 임상 술기, 0.1mm 손기술, 자연치아 보존 마인드』</strong>로 승화시키는 마지막 1~2문장이 합격의 결정타입니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
