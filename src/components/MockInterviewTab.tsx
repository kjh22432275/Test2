import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types/interview';
import { Play, Pause, RotateCcw, Send, UserCheck, Clock, Award, ShieldAlert } from 'lucide-react';

interface MockInterviewTabProps {
  initialMajor?: string;
  initialPrompt?: string;
  onSendToEvaluator?: (major: string, question: string, answer: string) => void;
}

export const MockInterviewTab: React.FC<MockInterviewTabProps> = ({
  initialMajor = '컴퓨터공학과',
  onSendToEvaluator,
}) => {
  const [major, setMajor] = useState(initialMajor);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: `안녕하십니까 수험생 여러분. ${initialMajor} 학생부종합전형 면접장에 오신 것을 환영합니다. 긴장하지 마시고 편안한 마음으로 임해주시기 바랍니다. 먼저 우리 학과에 지원하게 된 가장 결정적인 계기와 이를 위해 고교 생활 중 가장 주도적으로 노력한 활동 한 가지를 1분 내외로 말씀해 주십시오.`,
      timestamp: '14:00',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1-minute timer state
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);
    handleResetTimer();

    try {
      const response = await fetch('/api/gemini/chat-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMajor: major,
          history: newHistory.map((m) => ({ role: m.role, text: m.text })),
          userMessage: userMsg.text,
        }),
      });
      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        text: `안녕하십니까. ${major} 면접을 다시 시작하겠습니다. 차분하게 호흡을 가다듬으시고, 본인의 탐구 동기와 전공에 대한 열정을 진솔하게 들려주십시오. 첫 번째 질문입니다: 고등학교 생활 중 가장 의미 있었던 교과 심화 탐구 활동은 무엇이었나요?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    handleResetTimer();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with atmospheric interview room backdrop */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white min-h-[160px] flex items-center">
        <img
          src="/src/assets/images/admission_eval_desk_1793872923871.jpg"
          alt="면접장 전경"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 filter brightness-75"
        />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
              실전 면접관 1:1 대면 시뮬레이션
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {major} 학생부종합전형 모의면접실
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              실제 면접관처럼 온화하면서도 날카롭게 꼬리질문을 던지는 AI 사정관과의 실전 연습
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              면접 새로 시작
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat window */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] overflow-hidden">
          
          {/* Header inside chat */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                수석 입학사정관 면접관 진행 중
              </span>
            </div>
            <span className="text-slate-500">
              블라인드 규정 적용 중 (학교명/부모직업 발화 금지)
            </span>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-500">
                      {isAssistant ? '입학사정관' : '수험생'}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                        : 'bg-slate-900 dark:bg-indigo-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Quick action to send student message to evaluator */}
                    {!isAssistant && onSendToEvaluator && (
                      <div className="mt-2.5 pt-2 border-t border-white/20 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            // Find the previous question
                            const prevQuestion = messages
                              .filter((m) => m.role === 'assistant')
                              .slice(-1)[0]?.text || '면접 질문';
                            onSendToEvaluator(major, prevQuestion, msg.text);
                          }}
                          className="text-xs text-white/80 hover:text-white flex items-center gap-1 underline"
                        >
                          <Award className="w-3 h-3" />
                          이 답변 정밀 진단실로 보내기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold text-slate-500 mb-1 px-1">
                  입학사정관
                </span>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-sm text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                  답변을 검토하며 꼬리질문을 준비 중입니다...
                </div>
              </div>
            )}
          </div>

          {/* Chat input footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="답변을 입력하세요 (엔터: 전송, Shift+엔터: 줄바꿈). 실제 말하듯 답변하세요."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
              <button
                type="button"
                disabled={!inputMessage.trim() || loading}
                onClick={handleSendMessage}
                className="px-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar: 1-minute timer & coaching tips */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1-Minute Timer Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                1분 발화 호흡 타이머
              </div>
              <span className="text-xs text-slate-400">
                실전 45~55초 권장
              </span>
            </div>

            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className={`text-4xl font-bold font-mono tabular-nums ${seconds <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-slate-100'}`}>
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {seconds > 15 ? '안정적인 답변 구간' : seconds > 0 ? '마무리 멘트 타이밍!' : '1분 초과! 요약 마무리 필요'}
              </div>
            </div>

            <div className="flex gap-2">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                리셋
              </button>
            </div>
          </div>

          {/* Quick Major Switch */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              지원 학과 변경
            </div>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Blind Reminder */}
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/40 text-xs space-y-1.5">
            <div className="font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              블라인드 면접 실격 주의사항
            </div>
            <p className="text-rose-800 dark:text-rose-300/90 leading-relaxed">
              교복 착용 금지뿐만 아니라, "저희 외고에서는...", "아버지가 연구원이셔서..." 등 학교명 및 부모 직업을 간접 유추하게 하는 발언도 심각한 감점 사유가 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
