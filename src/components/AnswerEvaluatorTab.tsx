import React, { useState } from 'react';
import { PRESET_SAMPLES, PresetSample } from '../data/presetSamples';
import { AnswerEvaluationResult } from '../types/interview';
import { apiFetch } from '../utils/standaloneApiEngine';
import { Award, AlertTriangle, CheckCircle2, HelpCircle, Sparkles, Lightbulb, RotateCcw } from 'lucide-react';

export const AnswerEvaluatorTab: React.FC = () => {
  const [targetMajor, setTargetMajor] = useState(PRESET_SAMPLES[0].majorName.split('/')[0].trim());
  const [question, setQuestion] = useState(PRESET_SAMPLES[0].sampleQuestion);
  const [studentAnswer, setStudentAnswer] = useState(PRESET_SAMPLES[0].sampleStudentAnswer);
  const [recordContext, setRecordContext] = useState(PRESET_SAMPLES[0].studentActivities);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluationResult | null>(null);

  const handleApplyPreset = (sample: PresetSample) => {
    setTargetMajor(sample.majorName.split('/')[0].trim());
    setQuestion(sample.sampleQuestion);
    setStudentAnswer(sample.sampleStudentAnswer);
    setRecordContext(sample.studentActivities);
  };

  const handleEvaluate = async () => {
    if (!studentAnswer.trim()) return;
    setLoading(true);
    try {
      const response = await apiFetch('/api/gemini/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMajor,
          question,
          studentAnswer,
          recordContext,
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
  // In typical Korean speech, 350-450 characters is approximately 1 minute of comfortable speaking.
  const isOptimalLength = charCount >= 320 && charCount <= 480;

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
            사정관 시선 실전 진단실
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            학생 답변 PREP 진단 & 날카로운 꼬리질문 생성
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            자녀가 연습한 답변을 그대로 입력해 보세요. 2026/2027 학종 평가 지표에 맞춰 
            <strong>두괄식(PREP) 구조</strong>, <strong>블라인드 규정 준수 여부</strong>, 그리고 
            사정관이 면접장에서 던질 <strong>예상 꼬리질문 3문항</strong>과 <strong>모범 리라이팅</strong>을 진단합니다.
          </p>
        </div>

        {/* Preset quick switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 mb-2">
            실습용 질문 & 모범/취약 답변 샘플 불러오기:
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left input */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            면접 질문과 학생 답변 입력
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              지원 희망 학과
            </label>
            <input
              type="text"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              면접관의 질문
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 가장 기억에 남는 탐구 활동과 배운 점은 무엇인가요?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                학생의 실제 구술 답변
              </label>
              <div className="text-xs text-slate-500 tabular-nums">
                <span className={isOptimalLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
                  {charCount}자
                </span>
                {' '}(1분 적정: 350~450자)
              </div>
            </div>
            <textarea
              rows={6}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="자녀가 실제로 소리 내어 말한 내용을 그대로 적거나, 녹음한 음성을 텍스트로 적어보세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              참고한 생기부 세특 활동 (선택)
            </label>
            <textarea
              rows={3}
              value={recordContext}
              onChange={(e) => setRecordContext(e.target.value)}
              placeholder="답변의 근거가 된 생기부 기록이 있다면 간략히 적어주세요."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            disabled={loading || !studentAnswer.trim()}
            onClick={handleEvaluate}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                사정관 시선으로 정밀 분석 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                사정관 시선으로 정밀 진단 & 꼬리질문 추출
              </>
            )}
          </button>
        </div>

        {/* Right evaluation result */}
        <div className="lg:col-span-7 space-y-6">
          {evaluation ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              
              {/* Verdict header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    사정관 종합 진단 결과
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
                    판정: <span className="text-emerald-600 dark:text-emerald-400">{evaluation.overallVerdict}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {evaluation.blindCheck.hasViolation ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="text-rose-700 dark:text-rose-300 font-medium">블라인드 주의</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">블라인드 통과</span>
                    </>
                  )}
                </div>
              </div>

              {/* Overall comment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>사정관 총평:</strong> {evaluation.overallComment}
              </div>

              {/* 4 Score Metrics */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  학종 3대 평가요소 & 구조 점수
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 mb-1">학업역량</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.academic}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 mb-1">진로역량</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.careerFit}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 mb-1">공동체역량</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.community}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 mb-1">두괄식 구조도</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.structure}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tail Questions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    실전에서 들어올 사정관의 날카로운 꼬리질문 (3문항)
                  </div>
                  <span className="text-xs text-slate-400">
                    자녀에게 이 질문을 구두로 물어보세요
                  </span>
                </div>

                <div className="space-y-3">
                  {evaluation.tailQuestions.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-2">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {idx + 1}. {item.question}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                        <strong>사정관 출제 의도:</strong> {item.intent}
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
                        <strong>답변 공략 팁:</strong> {item.answeringTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improved Rewrite */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  사정관을 사로잡는 모범 리라이팅 답변 (약 400자, PREP 구조)
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {evaluation.improvedAnswer}
                </div>
              </div>

              {/* Parent tip */}
              {evaluation.parentTip && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs space-y-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    학부모 피드백 가이드
                  </div>
                  <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {evaluation.parentTip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  학생의 답변을 입력하고 진단 버튼을 눌러주세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  상단의 샘플 버튼을 누르시면 컴퓨터공학, 경영학, 생명과학 등의 실제 모범/취약 답변을 바로 진단해 보실 수 있습니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-left text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  사정관들이 가장 싫어하는 답변 3가지:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>서론이 긴 미괄식 답변:</strong> 결론이 30초 뒤에 나오면 사정관은 집중력을 잃습니다.</li>
                  <li><strong>스펙 나열형 답변:</strong> "무엇을 했다"만 있고 "그로 인해 무엇을 깨달았는지"가 빠진 답변.</li>
                  <li><strong>과장된 영웅 서사:</strong> 혼자서 모든 것을 다 해결했다는 식의 신뢰도 낮은 답변.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
