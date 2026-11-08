import React, { useState } from 'react';
import { MASTER_PROMPTS } from '../data/masterPrompts';
import { MasterPrompt } from '../types/interview';
import { Copy, Check, Sparkles, BookOpen, UserCheck, ArrowRight, Lightbulb } from 'lucide-react';

interface MasterLibraryTabProps {
  onStartMockWithPrompt: (promptText: string, major: string) => void;
  onLoadIntoGenerator: (prompt: MasterPrompt) => void;
}

export const MasterLibraryTab: React.FC<MasterLibraryTabProps> = ({
  onStartMockWithPrompt,
  onLoadIntoGenerator,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<MasterPrompt>(MASTER_PROMPTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (prompt: MasterPrompt) => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            프롬프트 엔지니어링 보관함
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            검증된 학종 면접 마스터 프롬프트 6선
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            수석 입학사정관의 평가 잣대와 대형 언어모델(LLM)의 생성 특성을 철저히 계산하여 만든 실전 템플릿입니다.
            복사하여 ChatGPT나 Gemini에 바로 넣고, 대괄호 <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">[자녀 정보]</code>만 수정해 사용하세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            프롬프트 목록 (클릭하여 상세 보기)
          </div>

          <div className="space-y-2.5">
            {MASTER_PROMPTS.map((item) => {
              const isSelected = selectedPrompt.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPrompt(item)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {item.coreTechnique.split('+')[0].trim()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right detail view */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {selectedPrompt.targetAudience}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedPrompt.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedPrompt)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === selectedPrompt.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    복사 완료
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    프롬프트 복사
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onStartMockWithPrompt(selectedPrompt.promptText, '희망 학과')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                모의면접 시작
              </button>
            </div>
          </div>

          {/* Core technique tag */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <strong>적용된 핵심 기법:</strong> {selectedPrompt.coreTechnique}
            </span>
          </div>

          {/* Prompt text preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                프롬프트 전문 (Copy & Paste Ready)
              </span>
              <span className="text-xs text-slate-400">
                [ ] 표시 부분을 자녀 상황에 맞게 교체하세요
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
              {selectedPrompt.promptText}
            </pre>
          </div>

          {/* How to use */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              학부모 실행 가이드
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedPrompt.howToUse}
            </p>
          </div>

          {/* Parent coaching tip */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs space-y-1.5">
            <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              부모님 대화 꿀팁 (비난 금지, 강점 발굴)
            </div>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
              {selectedPrompt.parentTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
