import React, { useState, useEffect } from 'react';
import { AppMode, TabType, MasterPrompt } from './types/interview';
import { Header } from './components/Header';
import { downloadStandaloneHtml } from './utils/downloadStandaloneHtml';
import {
  isArgonEngineEnabled,
  setArgonEngineEnabled,
  subscribeArgonEngine,
} from './utils/standaloneApiEngine';
import { Download, Check, FileCode2, Zap } from 'lucide-react';

// General Admissions Components
import { PromptGeneratorTab } from './components/PromptGeneratorTab';
import { MasterLibraryTab } from './components/MasterLibraryTab';
import { AnswerEvaluatorTab } from './components/AnswerEvaluatorTab';
import { QuestionExtractorTab } from './components/QuestionExtractorTab';
import { MockInterviewTab } from './components/MockInterviewTab';
import { ParentGuideTab } from './components/ParentGuideTab';

// Pre-Dental Specialized Components
import { DentalMMITab } from './components/DentalMMITab';
import { WhyDentistryTab } from './components/WhyDentistryTab';
import { DentalSchoolsTab } from './components/DentalSchoolsTab';
import { DentalPromptTab } from './components/DentalPromptTab';
import { DentalEvaluatorTab } from './components/DentalEvaluatorTab';
import { DentalParentGuideTab } from './components/DentalParentGuideTab';
import { DentalQuestionExtractorTab } from './components/DentalQuestionExtractorTab';
import { StarDClinicTab } from './components/StarDClinicTab';
import { StudentRecordPdfA4Tab } from './components/StudentRecordPdfA4Tab';

export default function App() {
  // Default to the user's requested 치의예과 전문관 mode & PDF A4 Brief section!
  const [appMode, setAppMode] = useState<AppMode>('dental');
  const [currentTab, setCurrentTab] = useState<TabType>('pdf-a4-brief');
  
  // State for passing data across tabs
  const [mockTargetMajor, setMockTargetMajor] = useState('경희대학교 치의예과');
  const [mockInitialPrompt, setMockInitialPrompt] = useState('');
  const [starDInitQuestion, setStarDInitQuestion] = useState<string | undefined>(undefined);
  const [starDInitSchool, setStarDInitSchool] = useState<string | undefined>(undefined);
  const [starDInitDraft, setStarDInitDraft] = useState<string | undefined>(undefined);
  const [htmlDownloading, setHtmlDownloading] = useState(false);
  const [htmlDownloaded, setHtmlDownloaded] = useState(false);
  const [argonEnabled, setArgonEnabled] = useState<boolean>(isArgonEngineEnabled());

  useEffect(() => {
    return subscribeArgonEngine((enabled) => setArgonEnabled(enabled));
  }, []);

  const isLocalFileMode = typeof window !== 'undefined' && window.location.protocol === 'file:';

  const handleDownloadStandalone = async () => {
    setHtmlDownloading(true);
    const ok = await downloadStandaloneHtml();
    setHtmlDownloading(false);
    if (ok) {
      setHtmlDownloaded(true);
      setTimeout(() => setHtmlDownloaded(false), 3500);
    }
  };

  // Mode toggle handler
  const handleToggleMode = (mode: AppMode) => {
    setAppMode(mode);
    if (mode === 'dental') {
      setCurrentTab('pdf-a4-brief');
      setMockTargetMajor('경희대학교 치의예과');
    } else {
      setCurrentTab('pdf-a4-brief');
      setMockTargetMajor('컴퓨터공학과');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cross-tab communication
  const handleStartMockWithPrompt = (promptText: string, major: string) => {
    setMockInitialPrompt(promptText);
    setMockTargetMajor(major);
    setCurrentTab('mock-interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToStarD = (question: string, school: string, draftGuide: string) => {
    setStarDInitQuestion(question);
    setStarDInitSchool(school);
    setStarDInitDraft(draftGuide);
    setAppMode('dental');
    setCurrentTab('star-d-clinic');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuestionForPractice = (question: string, major: string, context: string) => {
    if (appMode === 'dental') {
      setCurrentTab('dental-evaluator');
    } else {
      setCurrentTab('evaluator');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToEvaluator = (major: string, question: string, answer: string) => {
    if (appMode === 'dental') {
      setCurrentTab('dental-evaluator');
    } else {
      setCurrentTab('evaluator');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadIntoGenerator = (prompt: MasterPrompt) => {
    setCurrentTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors print:bg-white">
      
      {/* Dynamic Header with Dual Mode Toggle */}
      <Header
        appMode={appMode}
        onToggleMode={handleToggleMode}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickStartMock={() => {
          if (appMode === 'dental') {
            setCurrentTab('dental-mmi');
          } else {
            setCurrentTab('mock-interview');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:px-0 space-y-6">
        
        {/* Standalone HTML & Gemini Argon Engine Control Bar (Visible in both Web App and Standalone HTML file) */}
        <div className="print:hidden bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-amber-300" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                <span>
                  {isLocalFileMode
                    ? '독립형 HTML 실행 모드 · Gemini Argon 엔진 (gemini-4-argon) 연동됨'
                    : 'Gemini Argon 엔진 (gemini-4-argon) & 무설치 독립형 단일 HTML 다운로드'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                다운로드받은 <strong>독립형 단일 <code>.html</code> 파일</strong>에서도 우측의 <strong>[Gemini Argon 엔진] 버튼</strong>을 통해 <code>gemini-4-argon</code> 심층 추론 모델 기반 A4 브리핑과 면접관 질문 생성을 그대로 이용하실 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setArgonEngineEnabled(!argonEnabled)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border ${
                argonEnabled
                  ? 'bg-indigo-700 hover:bg-indigo-800 text-white border-indigo-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className={`w-4 h-4 ${argonEnabled ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
              <span>
                {argonEnabled
                  ? 'Gemini Argon 엔진 (gemini-4-argon) ON'
                  : 'Gemini Argon 엔진 켜기 (현재 표준 모드)'}
              </span>
            </button>

            {!isLocalFileMode && (
              <button
                type="button"
                onClick={handleDownloadStandalone}
                disabled={htmlDownloading}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
              >
                {htmlDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>덴탈패스_치의예과면접마스터_독립형.html 저장됨!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{htmlDownloading ? '독립형 HTML 패키징 중...' : '독립형 HTML 파일 다운로드 (.html)'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* --- DENTAL SPECIALIZED TABS --- */}
        {appMode === 'dental' && (
          <>
            {currentTab === 'pdf-a4-brief' && (
              <StudentRecordPdfA4Tab
                onSendToStarD={handleSendToStarD}
                onSendToEvaluator={handleSelectQuestionForPractice}
              />
            )}

            {currentTab === 'dental-mmi' && (
              <DentalMMITab onSendToWhyDental={() => setCurrentTab('why-dentistry')} />
            )}

            {currentTab === 'why-dentistry' && (
              <WhyDentistryTab />
            )}

            {currentTab === 'dental-extractor' && (
              <DentalQuestionExtractorTab
                onSelectQuestionForPractice={handleSelectQuestionForPractice}
                onSendToMMI={() => setCurrentTab('dental-mmi')}
              />
            )}

            {currentTab === 'star-d-clinic' && (
              <StarDClinicTab
                initialQuestion={starDInitQuestion}
                initialSchool={starDInitSchool}
                initialDraft={starDInitDraft}
              />
            )}

            {currentTab === 'dental-schools' && (
              <DentalSchoolsTab />
            )}

            {currentTab === 'dental-prompt' && (
              <DentalPromptTab
                onStartMockWithPrompt={handleStartMockWithPrompt}
              />
            )}

            {currentTab === 'dental-evaluator' && (
              <DentalEvaluatorTab />
            )}

            {currentTab === 'dental-parent' && (
              <DentalParentGuideTab />
            )}

            {/* Also allow opening the interactive mock room if navigated to from prompt */}
            {currentTab === 'mock-interview' && (
              <MockInterviewTab
                initialMajor={mockTargetMajor}
                initialPrompt={mockInitialPrompt}
                onSendToEvaluator={handleSendToEvaluator}
              />
            )}
          </>
        )}

        {/* --- GENERAL ADMISSION TABS --- */}
        {appMode === 'general' && (
          <>
            {currentTab === 'pdf-a4-brief' && (
              <StudentRecordPdfA4Tab
                onSendToStarD={handleSendToStarD}
                onSendToEvaluator={handleSelectQuestionForPractice}
              />
            )}

            {currentTab === 'generator' && (
              <PromptGeneratorTab
                onStartMockWithPrompt={handleStartMockWithPrompt}
                onSendToEvaluator={handleSendToEvaluator}
              />
            )}

            {currentTab === 'library' && (
              <MasterLibraryTab
                onStartMockWithPrompt={handleStartMockWithPrompt}
                onLoadIntoGenerator={handleLoadIntoGenerator}
              />
            )}

            {currentTab === 'evaluator' && (
              <AnswerEvaluatorTab />
            )}

            {currentTab === 'extractor' && (
              <QuestionExtractorTab
                onSelectQuestionForPractice={handleSelectQuestionForPractice}
              />
            )}

            {currentTab === 'mock-interview' && (
              <MockInterviewTab
                initialMajor={mockTargetMajor}
                initialPrompt={mockInitialPrompt}
                onSendToEvaluator={handleSendToEvaluator}
              />
            )}

            {currentTab === 'parent-guide' && (
              <ParentGuideTab />
            )}
          </>
        )}

      </main>

      {/* Editorial anti-slop footer */}
      <footer className="print:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {appMode === 'dental' ? '덴탈패스 (DentalPass)' : '학종 면접 프롬프트 마스터'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {appMode === 'dental' 
                ? '지원 5대 치과대학(경희·단국·경북·부산·조선) 학생부종합 및 MMI 특화 솔루션' 
                : '2026/2027 대입 학생부종합전형 면접 대비 솔루션'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>블라인드 면접 규정 준수</span>
            <span aria-hidden="true">·</span>
            <span>{appMode === 'dental' ? '치의학 4대 루브릭 평가' : 'PREP & STAR 프레임워크'}</span>
            <span aria-hidden="true">·</span>
            <span>사정관 꼬리질문 검증 체계</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
