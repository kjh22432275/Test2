import React, { useState } from 'react';
import { AppMode, TabType, MasterPrompt } from './types/interview';
import { Header } from './components/Header';

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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:px-0">
        
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
