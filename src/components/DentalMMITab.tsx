import React, { useState, useEffect } from 'react';
import { DENTAL_MMI_STATIONS, DentalMMIScenario } from '../data/dentalMasterData';
import { apiFetch } from '../utils/standaloneApiEngine';
import { 
  Stethoscope, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Send, 
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface DentalMMITabProps {
  onSendToWhyDental?: () => void;
}

export const DentalMMITab: React.FC<DentalMMITabProps> = () => {
  const [selectedStation, setSelectedStation] = useState<DentalMMIScenario>(DENTAL_MMI_STATIONS[0]);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  // 1-minute MMI response timer
  const [seconds, setSeconds] = useState(60);
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
    setSeconds(60);
  };

  const handleSelectStation = (station: DentalMMIScenario) => {
    setSelectedStation(station);
    setEvaluation(null);
    handleResetTimer();
  };

  const handleLoadSampleAnswer = () => {
    setStudentAnswer(selectedStation.sampleGoodAnswer);
  };

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || loading) return;
    setLoading(true);
    try {
      const response = await apiFetch('/api/gemini/dental-mmi-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedStation.stationTitle,
          scenarioContext: selectedStation.situationContext,
          stationType: selectedStation.stationType,
          question: selectedStation.question,
          studentAnswer,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setEvaluation(data.data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const charCount = studentAnswer.length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-teal-800/40 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
              <Stethoscope className="w-3.5 h-3.5" />
              서울대·부산대·전남대 등 MMI 출제 기준 완벽 반영
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              치의예과 MMI(다중미니면접) 4대 핵심 스테이션
            </h1>
            <p className="text-sm text-teal-100/80 leading-relaxed">
              치과의료 현장의 실제 딜레마(과잉진료, 치과공포증 환자, 정밀 손기술 적성, 수불사업 정책)를 마주하고, 
              <strong>치의학 교수진 시점의 4대 루브릭 평가</strong>와 <strong>날카로운 꼬리질문</strong>으로 합격선 답변을 완성하세요.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-800/70 p-3 rounded-xl border border-teal-700/40 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-200">MMI 1분 발화 호흡 훈련 최적화</span>
          </div>
        </div>

        {/* 4 Stations Tab Bar */}
        <div className="mt-6 pt-5 border-t border-teal-800/60 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DENTAL_MMI_STATIONS.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => handleSelectStation(station)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-teal-500/25 border-teal-400 text-white shadow-sm'
                    : 'bg-slate-900/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-[11px] font-bold text-teal-300 mb-0.5">
                  Station: {station.stationType}
                </div>
                <div className="text-xs font-semibold truncate text-slate-100">
                  {station.stationTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Station Scenario & Student Input */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Situation Context Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                [스테이션 상황 제시문] {selectedStation.stationType}
              </span>
              <button
                type="button"
                onClick={handleLoadSampleAnswer}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                합격 모범 답변 불러오기
              </button>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedStation.stationTitle}
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedStation.situationContext}
            </div>

            {selectedStation.patientProfile && (
              <div className="p-3 rounded-lg bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs text-teal-900 dark:text-teal-300">
                <strong>환자 특성:</strong> {selectedStation.patientProfile}
              </div>
            )}

            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-1">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                면접관 출제 질문:
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {selectedStation.question}
              </p>
            </div>
          </div>

          {/* Student Answer Input Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                수험생 구술 답변 작성 (1분 발화 분량)
              </label>
              <div className="text-xs text-slate-500 tabular-nums">
                <span className={charCount >= 320 && charCount <= 480 ? 'text-teal-600 font-bold' : ''}>
                  {charCount}자
                </span>{' '}
                (권장: 350~450자)
              </div>
            </div>

            <textarea
              rows={8}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="제시문을 읽고 실제 면접관 앞에서 말하듯이 타이핑해 보세요. 두괄식으로 자신의 입장(윤리적 원칙, 대처 방법)을 먼저 제시하고 그 이유와 구체적 소통 방안을 전개하세요."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            />

            <button
              type="button"
              disabled={loading || !studentAnswer.trim()}
              onClick={handleEvaluate}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  치의학 교수진 MMI 평가 중...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  치의학 교수 시선으로 MMI 정밀 진단받기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Timer, Rubric & AI Evaluation Result */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* MMI 1-Minute Timer Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                MMI 스테이션 실전 1분 타이머
              </div>
              <span className="text-xs text-slate-400">실전 50~55초 발화 권장</span>
            </div>

            <div className="text-center py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className={`text-4xl font-bold font-mono tabular-nums ${seconds <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-slate-100'}`}>
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {seconds > 15 ? '안정적인 논리 전개 구간' : seconds > 0 ? '마무리 멘트 타이밍!' : '1분 초과! 요약 후 종결'}
              </div>
            </div>

            <div className="flex gap-2">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  타이머 시작
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  일시정지
                </button>
              )}
              <button
                type="button"
                onClick={handleResetTimer}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Evaluation Result Card */}
          {evaluation ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-slate-500">MMI 평가위원 종합 판정</div>
                  <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    {evaluation.overallVerdict}
                  </h3>
                </div>
                <div className="text-xs px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                  블라인드 준수 확인됨
                </div>
              </div>

              {/* Professor Overall Comment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>치의학 교수 총평:</strong> {evaluation.overallComment}
              </div>

              {/* 4 Scores */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  치의예과 MMI 4대 핵심 역량 채점표
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">직업윤리</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.ethics}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">환자소통</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.communication}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">의과학논리</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.scienceLogic}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">손기술인식</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.dexterityAwareness}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tail Questions */}
              {evaluation.tailQuestions && evaluation.tailQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    실전에서 면접관이 던질 압박 꼬리질문 (자녀에게 구두로 물어보세요)
                  </div>
                  <div className="space-y-2.5">
                    {evaluation.tailQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1.5">
                        <div className="font-bold text-amber-950 dark:text-amber-200">
                          꼬리질문 {idx + 1}: {q.question}
                        </div>
                        <p className="text-amber-800 dark:text-amber-300/90 leading-normal">
                          <strong>출제 의도:</strong> {q.intent}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                          <strong>대처 팁:</strong> {q.answeringTip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Model Rewrite */}
              {evaluation.improvedAnswer && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    합격선 모범 리라이팅 답변 (약 400자, PREP)
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {evaluation.improvedAnswer}
                  </div>
                </div>
              )}

              {/* Faculty Tip */}
              {evaluation.dentalFacultyTip && (
                <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs space-y-1 text-teal-900 dark:text-teal-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
                    치의대 교수진의 조언
                  </div>
                  <p className="leading-relaxed">{evaluation.dentalFacultyTip}</p>
                </div>
              )}
            </div>
          ) : (
            /* Station Rubric Guide when no evaluation yet */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                이 스테이션의 핵심 평가 루브릭 (사정관 채점표)
              </div>

              <div className="space-y-3">
                {selectedStation.evaluationRubric.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-slate-200">
                      {idx + 1}. {item.criteria}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-normal">
                      {item.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                        <strong>고득점:</strong> {item.goodPoints}
                      </div>
                      <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300">
                        <strong>감점:</strong> {item.badPoints}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pre-interviewer followups */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
                <div className="font-semibold text-amber-900 dark:text-amber-300">
                  사정관의 예상 반문 포인트:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800 dark:text-amber-300/90 text-[11px]">
                  {selectedStation.interviewerFollowUps.map((fu, i) => (
                    <li key={i}>{fu}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
