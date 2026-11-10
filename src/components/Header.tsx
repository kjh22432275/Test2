import React, { useState, useEffect } from 'react';
import { AppMode, TabType } from '../types/interview';
import { downloadStandaloneHtml } from '../utils/downloadStandaloneHtml';
import {
  isArgonEngineEnabled,
  setArgonEngineEnabled,
  subscribeArgonEngine,
} from '../utils/standaloneApiEngine';
import { 
  Stethoscope, 
  Target, 
  Building2, 
  Microscope, 
  Award, 
  BookOpen, 
  Sparkles, 
  MessageSquareCode, 
  FileQuestion, 
  FileText,
  UserCheck,
  Download,
  Check,
  Zap
} from 'lucide-react';

interface HeaderProps {
  appMode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onQuickStartMock: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  appMode, 
  onToggleMode, 
  currentTab, 
  onSelectTab, 
  onQuickStartMock 
}) => {
  const isDental = appMode === 'dental';
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [argonEnabled, setArgonEnabled] = useState<boolean>(isArgonEngineEnabled());

  useEffect(() => {
    return subscribeArgonEngine((enabled) => setArgonEnabled(enabled));
  }, []);

  const handleDownloadHtml = async () => {
    setDownloading(true);
    const ok = await downloadStandaloneHtml();
    setDownloading(false);
    if (ok) {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }
  };

  return (
    <header className="print:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Top micro-bar: Mode Selector Banner, Argon Engine Toggle & Standalone HTML Download */}
      <div className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <span className="hidden sm:inline">전형별 맞춤 특화 모드:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onToggleMode('dental')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isDental
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>🦷 치의예과 전문관 (덴탈패스)</span>
                <span className="px-1.5 py-0.2 rounded bg-teal-500/30 text-[10px] text-teal-200">
                  특화
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleMode('general')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  !isDental
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>🎓 전계열 종합관</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Gemini 4 Argon Engine Toggle Button (works in both Web App and Standalone HTML) */}
            <button
              type="button"
              onClick={() => setArgonEngineEnabled(!argonEnabled)}
              className={`px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                argonEnabled
                  ? 'bg-indigo-700 hover:bg-indigo-800 text-white border-indigo-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title="웹 앱과 독립형 HTML 파일 모두에서 Gemini 4 Argon (gemini-4-argon) 심층 추론 엔진을 가동합니다"
            >
              <Zap className={`w-3.5 h-3.5 ${argonEnabled ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
              <span>
                {argonEnabled
                  ? 'Gemini Argon 엔진 (gemini-4-argon) 가동 중'
                  : 'Gemini Argon 엔진 켜기 (현재 표준 모드)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              disabled={downloading}
              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="설치나 서버 없이 크롬/엣지 브라우저에서 더블클릭만으로 모든 섹션과 Argon 엔진이 똑같이 작동하는 독립형 단일 HTML 파일을 다운로드합니다"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>독립형 HTML 다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading ? 'HTML 생성 중...' : '독립형 HTML 파일 다운로드 (Argon 내장)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single Wordmark */}
        <div 
          onClick={() => onSelectTab(isDental ? 'pdf-a4-brief' : 'generator')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
            isDental ? 'bg-teal-700' : 'bg-slate-900 dark:bg-indigo-600'
          }`}>
            {isDental ? '치' : '학'}
          </div>
          <div>
            <span className={`text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors ${
              isDental ? 'group-hover:text-teal-600' : 'group-hover:text-indigo-600'
            }`}>
              {isDental ? '덴탈패스: 치의예과 면접 마스터' : '학종 면접 프롬프트 마스터'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {isDental ? (
            <>
              <button
                onClick={() => onSelectTab('pdf-a4-brief')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'pdf-a4-brief'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                PDF A4 요약·질문
              </button>

              <button
                onClick={() => onSelectTab('dental-mmi')}
                className={`px-2 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'dental-mmi'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                MMI 스테이션
              </button>

              <button
                onClick={() => onSelectTab('why-dentistry')}
                className={`px-2 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'why-dentistry'
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Target className="w-4 h-4 text-cyan-600" />
                왜 치대인가
              </button>

              <button
                onClick={() => onSelectTab('dental-extractor')}
                className={`px-2 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'dental-extractor'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileQuestion className="w-4 h-4 text-teal-600" />
                생기부 추출
              </button>

              <button
                onClick={() => onSelectTab('star-d-clinic')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'star-d-clinic'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                STAR-D 클리닉
              </button>

              <button
                onClick={() => onSelectTab('dental-schools')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'dental-schools'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                지원 5개 치대 기출
              </button>

              <button
                onClick={() => onSelectTab('dental-prompt')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'dental-prompt'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Microscope className="w-4 h-4 text-emerald-600" />
                세특 생성기
              </button>

              <button
                onClick={() => onSelectTab('dental-evaluator')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'dental-evaluator'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Award className="w-4 h-4 text-teal-600" />
                답변 진단
              </button>

              <button
                onClick={() => onSelectTab('dental-parent')}
                className={`px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'dental-parent'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                학부모 바이블
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('pdf-a4-brief')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'pdf-a4-brief'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                PDF A4 요약·질문
              </button>

              <button
                onClick={() => onSelectTab('generator')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'generator'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                맞춤 프롬프트
              </button>

              <button
                onClick={() => onSelectTab('library')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'library'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquareCode className="w-4 h-4 text-slate-500" />
                마스터 보관함
              </button>

              <button
                onClick={() => onSelectTab('evaluator')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'evaluator'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-600" />
                답변 진단·꼬리질문
              </button>

              <button
                onClick={() => onSelectTab('extractor')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'extractor'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileQuestion className="w-4 h-4 text-blue-600" />
                생기부 질문추출
              </button>

              <button
                onClick={() => onSelectTab('parent-guide')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'parent-guide'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                학부모 코칭 바이블
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onQuickStartMock}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm text-white ${
              isDental
                ? 'bg-teal-700 hover:bg-teal-800'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500'
            }`}
          >
            {isDental ? <Stethoscope className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            {isDental ? '치의예 MMI 실전실' : '실전 모의면접실'}
          </button>
        </div>

      </div>

      {/* Mobile sub navigation row */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-xs no-scrollbar">
        {isDental ? (
          <>
            <button
              onClick={() => onSelectTab('pdf-a4-brief')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'pdf-a4-brief' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              PDF A4 요약·질문
            </button>
            <button
              onClick={() => onSelectTab('dental-mmi')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'dental-mmi' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              MMI 스테이션
            </button>
            <button
              onClick={() => onSelectTab('why-dentistry')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'why-dentistry' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              왜 치대인가
            </button>
            <button
              onClick={() => onSelectTab('dental-extractor')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'dental-extractor' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              생기부 추출
            </button>
            <button
              onClick={() => onSelectTab('star-d-clinic')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'star-d-clinic' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              STAR-D 클리닉
            </button>
            <button
              onClick={() => onSelectTab('dental-schools')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'dental-schools' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              지원 5개 치대
            </button>
            <button
              onClick={() => onSelectTab('dental-prompt')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'dental-prompt' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              세특 생성기
            </button>
            <button
              onClick={() => onSelectTab('dental-evaluator')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'dental-evaluator' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              답변 진단
            </button>
            <button
              onClick={() => onSelectTab('dental-parent')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'dental-parent' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              학부모 바이블
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectTab('pdf-a4-brief')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'pdf-a4-brief' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              PDF A4 요약·질문
            </button>
            <button
              onClick={() => onSelectTab('generator')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'generator' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              맞춤 생성기
            </button>
            <button
              onClick={() => onSelectTab('library')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'library' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              마스터 보관함
            </button>
            <button
              onClick={() => onSelectTab('evaluator')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'evaluator' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              답변 진단
            </button>
            <button
              onClick={() => onSelectTab('extractor')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'extractor' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              생기부 추출
            </button>
            <button
              onClick={() => onSelectTab('parent-guide')}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                currentTab === 'parent-guide' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              학부모 가이드
            </button>
          </>
        )}
      </div>
    </header>
  );
};
