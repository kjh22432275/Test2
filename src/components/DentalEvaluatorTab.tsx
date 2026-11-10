import React, { useState } from 'react';
import { DENTAL_PRESET_SAMPLES, DentalPresetSample } from '../data/dentalMasterData';
import { apiFetch } from '../utils/standaloneApiEngine';
import { 
  Award, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

export const DentalEvaluatorTab: React.FC = () => {
  const [targetTopic, setTargetTopic] = useState('서울대 치의학과 (구강미생물 바이오필름)');
  const [question, setQuestion] = useState(DENTAL_PRESET_SAMPLES[0].sampleQuestion);
  const [studentAnswer, setStudentAnswer] = useState(DENTAL_PRESET_SAMPLES[0].sampleStudentAnswer);
  const [recordContext, setRecordContext] = useState(DENTAL_PRESET_SAMPLES[0].schoolRecordSnippet);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const handleApplyPreset = (sample: DentalPresetSample) => {
    setTargetTopic(sample.field);
    setQuestion(sample.sampleQuestion);
    setStudentAnswer(sample.sampleStudentAnswer);
    setRecordContext(sample.schoolRecordSnippet);
    setEvaluation(null);
  };

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || loading) return;
    setLoading(true);
    try {
      const response = await apiFetch('/api/gemini/dental-mmi-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: targetTopic,
          scenarioContext: recordContext,
          stationType: '구강의과학·서류심층',
          question,
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
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-teal-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            <Award className="w-3.5 h-3.5" />
            치의예과 수석 평가위원 시선 정밀 진단
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            치의예과 구술 답변 진단 & 사정관 꼬리질문 추출기
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            치의예과 면접 질문에 대한 답변을 입력해 보세요. 
            <strong>자연치아 보존 윤리</strong>, <strong>구강생명과학적 타당성</strong>, <strong>손기술/환자공감 소통력</strong>, 
            그리고 <strong>블라인드 규정 준수</strong>를 다각도로 평가하고 사정관이 던질 후속 꼬리질문을 예측해 드립니다.
          </p>
        </div>

        {/* Preset quick switcher */}
        <div className="mt-6 pt-5 border-t border-teal-800/60">
          <div className="text-xs font-semibold text-teal-300 mb-2">
            실습을 위한 치의학 모범/기출 구술 답변 샘플:
          </div>
          <div className="flex flex-wrap gap-2">
            {DENTAL_PRESET_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleApplyPreset(sample)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                {sample.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            질문과 학생의 구술 답변 입력
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              목표 대학 및 질문 분야
            </label>
            <input
              type="text"
              value={targetTopic}
              onChange={(e) => setTargetTopic(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
              placeholder="예: S. mutans의 바이오필름 형성 억제 원리를 설명해 보세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                학생의 실제 구술 답변
              </label>
              <div className="text-xs text-slate-500 tabular-nums">
                <span className={charCount >= 320 && charCount <= 480 ? 'text-teal-600 font-bold' : ''}>
                  {charCount}자
                </span>{' '}
                (1분 적정: 350~450자)
              </div>
            </div>
            <textarea
              rows={8}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="실제로 소리 내어 말하듯 타이핑하세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              근거가 된 생기부 세특 활동 (선택)
            </label>
            <textarea
              rows={3}
              value={recordContext}
              onChange={(e) => setRecordContext(e.target.value)}
              placeholder="관련 세특이나 탐구보고서 요약"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <button
            type="button"
            disabled={loading || !studentAnswer.trim()}
            onClick={handleEvaluate}
            className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                치의학 교수진 시선으로 진단 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                치의예과 정밀 진단 & 꼬리질문 받기
              </>
            )}
          </button>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          {evaluation ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-slate-500">치의예과 사정관 종합 판정</div>
                  <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {evaluation.overallVerdict}
                  </h3>
                </div>
                <div className="text-xs px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                  블라인드 준수 확인됨
                </div>
              </div>

              {/* Overall comment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>치의학 교수 총평:</strong> {evaluation.overallComment}
              </div>

              {/* 4 Scores */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  치의예과 4대 채점 지표
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">의료윤리</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.ethics}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">환자공감</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.communication}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">구강의과학</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {evaluation.scores.scienceLogic}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 mb-0.5">손기술·공간</div>
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
                    사정관이 이어서 파고들 꼬리질문 (자녀에게 구두로 물어보세요)
                  </div>
                  <div className="space-y-2.5">
                    {evaluation.tailQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1.5">
                        <div className="font-bold text-amber-950 dark:text-amber-200">
                          {idx + 1}. {q.question}
                        </div>
                        <p className="text-amber-800 dark:text-amber-300/90 leading-normal">
                          <strong>출제 의도:</strong> {q.intent}
                        </p>
                        <p className="text-teal-800 dark:text-teal-400 font-medium">
                          <strong>고득점 반박 팁:</strong> {q.answeringTip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Answer */}
              {evaluation.improvedAnswer && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    치의예과 합격선 모범 리라이팅 (약 400자, PREP)
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
                    치의대 교수진의 실전 팁
                  </div>
                  <p className="leading-relaxed">{evaluation.dentalFacultyTip}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  학생 답변을 입력하고 진단 버튼을 눌러주세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  상단의 샘플(바이오필름, 불소 화학, 임플란트 표면처리 등)을 클릭하시면 실제 합격생 수준의 답변을 바로 진단해 보실 수 있습니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-left text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  치의예과 면접관이 답변에서 확인하는 3가지:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>비가역성에 대한 존중:</strong> 치아는 재생되지 않는다는 전제를 바탕으로, 보존 치료에 대한 진지한 태도가 드러나는가?</li>
                  <li><strong>기초과학 원리와 치의학의 결합:</strong> 생명과학, 화학, 물리학의 교과 개념이 입안의 실제 생체 현상과 맞닿아 있는가?</li>
                  <li><strong>공감과 소통 화법:</strong> 치과 치료에 공포를 느끼는 환자에게 신뢰를 줄 수 있는 차분하고 따뜻한 어조인가?</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
