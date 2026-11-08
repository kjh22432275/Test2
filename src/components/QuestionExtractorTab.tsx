import React, { useState } from 'react';
import { PRESET_SAMPLES, PresetSample } from '../data/presetSamples';
import { ExtractedQuestion } from '../types/interview';
import { FileQuestion, Sparkles, BookOpen, Check, Copy, HelpCircle, ArrowRight } from 'lucide-react';

interface QuestionExtractorTabProps {
  onSelectQuestionForPractice: (question: string, major: string, context: string) => void;
}

export const QuestionExtractorTab: React.FC<QuestionExtractorTabProps> = ({
  onSelectQuestionForPractice,
}) => {
  const [targetMajor, setTargetMajor] = useState(PRESET_SAMPLES[0].majorName.split('/')[0].trim());
  const [activities, setActivities] = useState(PRESET_SAMPLES[0].studentActivities);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleApplyPreset = (sample: PresetSample) => {
    setTargetMajor(sample.majorName.split('/')[0].trim());
    setActivities(sample.studentActivities);
  };

  const handleExtract = async () => {
    if (!activities.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMajor, activities }),
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
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
            생기부 정밀 스캔
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            학생부 세특 기록 기반 적중 예상 질문 추출기
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            나이스(NEIS) 생활기록부에서 교과 세특, 동아리 활동, 진로 탐구 기록을 복사해 넣으세요.
            입학사정관이 평가표를 쥐고 반드시 짚고 넘어갈 <strong>학업역량 2문항, 진로역량 2문항, 공동체역량 1문항</strong>을 도출합니다.
          </p>
        </div>

        {/* Preset quick switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 mb-2">
            빠른 실습용 생활기록부 기록 예시:
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
            <FileQuestion className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            분석할 학생부 기록 입력
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              지원 희망 학과
            </label>
            <input
              type="text"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              생활기록부 세특/동아리/진로활동 기록 내용
            </label>
            <textarea
              rows={10}
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="자녀의 학생부에서 질문이 나올 만한 교과목 세특 문단이나 동아리 탐구보고서 내용을 5~15줄 정도 복사해 넣으세요."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            disabled={loading || !activities.trim()}
            onClick={handleExtract}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                생기부 정밀 스캔 중...
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
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  사정관 적중 예상 질문 리스트 ({questions.length}문항)
                </h3>
                <span className="text-xs text-slate-500">
                  질문을 클릭하여 답변 진단실로 이동할 수 있습니다
                </span>
              </div>

              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-400">
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
                        {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectQuestionForPractice(q.question, targetMajor, q.sourceActivity)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1 transition-colors"
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
                    <p className="text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/20 p-2 rounded-lg">
                      <strong>추천 답변 방향:</strong> {q.recommendedPrep}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  생기부 기록을 넣고 추출 버튼을 눌러주세요
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  학생부종합전형 면접 질문의 80%는 학생부 세특 기록에서 직접 나옵니다. 기록 속 개념과 실험에서 사정관이 주목할 문항을 추출해 드립니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-left text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  사정관이 생기부에서 질문을 뽑아내는 3가지 공식:
                </div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>수업 연계 심화:</strong> 교과서 기본 개념에서 어떤 지적 호기심으로 보고서나 실험까지 이어졌는가?</li>
                  <li><strong>역할의 고유성:</strong> 단체 활동에서 이 학생 혼자서만의 기여도(Action)는 무엇인가?</li>
                  <li><strong>학업 태도의 진정성:</strong> 1회성 관심인가, 아니면 다른 학년이나 과목으로 이어진 지속적 관심인가?</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
