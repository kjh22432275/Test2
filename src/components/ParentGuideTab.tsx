import React, { useState } from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, HeartHandshake, Eye, Clock, Award, HelpCircle } from 'lucide-react';

export const ParentGuideTab: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklist = [
    { id: 'c1', label: '수험표 및 신분증(주민등록증, 청소년증, 여권) 사전 지참 확인' },
    { id: 'c2', label: '단정한 사복 준비 (교복, 명찰, 학교 로고가 들어간 패딩 착용 절대 불가)' },
    { id: 'c3', label: '블라인드 금지어(학교명, 동문회, 부모 직업, 교외 수상) 발화 금지 숙지' },
    { id: 'c4', label: '1분 자기소개 & 지원동기 키워드 3가지 머릿속 정리 완료' },
    { id: 'c5', label: '생기부에 적힌 주요 실험/도서 3권의 핵심 개념 및 느낀 점 확인' },
    { id: 'c6', label: '모르는 질문이 나왔을 때 대처 멘트 ("잠시 5초간 생각할 시간을 주시겠습니까?") 연습' },
    { id: 'c7', label: '답변 시 시선 처리(면접관 2~3명의 눈과 미간을 고루 응시) 점검' },
    { id: 'c8', label: '면접장 입실 인사 및 퇴실 시 감사 인사 연습' },
  ];

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
            고3 학부모 전용 바이블
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            학종 면접 합격을 위한 학부모 코칭 가이드
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            자녀가 면접장에서 가장 든든한 무기는 <strong>'부모님의 따뜻한 지지와 안정된 멘탈'</strong>입니다.
            감점을 유발하는 블라인드 규정부터 가정 내 실전 코칭 화법, 그리고 당일 필수 체크리스트를 정리했습니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Essential Guides */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Parents 3 golden coaching rules */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              가정 모의면접 시 학부모의 3대 황금 원칙
            </h2>

            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  1. 자녀가 버벅거리더라도 절대 중간에 말을 끊지 마세요.
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  자녀가 말을 더듬거나 논리가 새어나갈 때 부모님이 "그게 아니라 이렇게 말해야지!"라고 개입하는 순간 자녀는 주눅이 들고 면접에 대한 거부감을 갖게 됩니다. 끝까지 묵묵히 들어주는 것 자체가 신뢰의 표현입니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  2. 피드백 첫마디는 반드시 "구체적인 칭찬"으로 시작하세요.
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  "그 실험에서 실패했던 변수를 솔직하게 고백한 부분은 면접관에게 굉장히 정직하고 진솔하게 다가갈 것 같아"처럼 구체적인 장면을 짚어 칭찬해 주세요. 그 뒤에 단점 하나를 덧붙이는 것이 가장 효과적입니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  3. 지시하지 마시고 "질문"으로 자녀의 생각을 유도하세요.
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  "답변을 두괄식으로 고쳐"라고 지시하기보다는, "사정관이 그 질문을 왜 던졌을까? 네가 배운 점을 제일 먼저 듣고 싶지 않았을까?"라고 물어보세요. 자녀 스스로 깨우쳐야 실전에서 자기 언어로 나옵니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Blind Interview Rules */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              블라인드 면접 규정 위반 주의사항 (0점 및 감점 방지)
            </h2>

            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/40 text-xs space-y-2">
              <div className="font-semibold text-rose-900 dark:text-rose-300">
                실수로 튀어나오기 쉬운 대표적 감점 표현:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-rose-800 dark:text-rose-300/90 leading-relaxed">
                <li><strong>고교 유형 노출:</strong> "저희 외고/과고에서는...", "기숙형 자사고 특성상...", "지방 일반고라 열악해서..." ➔ <em>엄격 감점 처리</em></li>
                <li><strong>부모 배경 노출:</strong> "의사이신 아버지를 보며...", "교수님이신 어머니 서재에서...", "부모님 연구실에서 인턴을..." ➔ <em>심각한 감점 또는 실격</em></li>
                <li><strong>교외 수상/어학 성적:</strong> "토플 110점을 취득하며...", "KMO 수학올림피아드 입상 경험으로..." ➔ <em>불합격 처리 대상</em></li>
              </ul>
              <div className="pt-2 font-medium text-rose-900 dark:text-rose-200">
                대체 모범 표현: "학교 정규 수업 중...", "자율 동아리 탐구 과정에서...", "가족과의 대화 속에서 자연스럽게..."
              </div>
            </div>
          </div>

          {/* Section 3: Non-verbal behaviors */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" />
              면접관의 호감을 얻는 비언어적 태도 4원칙
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">1. 시선 처리 (삼각 응시)</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  면접관의 눈을 쏘아보지 말고 '미간과 인중'을 부드럽게 응시하세요. 질문한 면접관 70%, 옆의 다른 면접관 30%를 번갈아 바라봅니다.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">2. 손과 자세</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  허리는 등받이에서 주먹 하나 띄우고 꼿꼿이 세우며, 양손은 가볍게 말아 쥐고 무릎 위에 올립니다. 말할 때 과도한 손짓은 지양합니다.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">3. 말끝 맺음의 명확성</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  "~인 것 같아요", "~인 듯합니다" 식의 흐릿한 어미 대신, "~라고 생각합니다", "~를 배웠습니다"로 당당하게 마침표를 찍습니다.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">4. 당황했을 때의 골든 타임</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  생각이 안 날 때는 멍하니 침묵하지 말고 "잠시 5초간 생각을 정리한 후 말씀드려도 되겠습니까?"라고 예의 바르게 양해를 구합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: D-Day Timeline & Interactive Checklist */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                면접 전 필수 점검 체크리스트
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {Object.values(checkedItems).filter(Boolean).length} / {checklist.length} 완료
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={isChecked ? 'line-through text-slate-500' : ''}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D-Day Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              시기별 학부모 멘탈 케어 로드맵
            </h3>

            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-indigo-400 pl-3 py-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">D-7: 기출 및 세특 키워드 정리</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                  새로운 지식을 채우려 하지 말고, 자녀가 생기부에 기록된 활동 중 '가장 신나서 했던 활동 3가지'를 다시 복기하도록 돕습니다.
                </p>
              </div>

              <div className="border-l-2 border-indigo-400 pl-3 py-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">D-1: 마인드 컨트롤 & 일찍 잠들기</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                  밤샘 연습은 치명적입니다. 뇌가 맑아야 꼬리질문에 유연하게 대처합니다. "너는 지금까지 충분히 잘해왔다"는 격려와 함께 숙면을 유도하세요.
                </p>
              </div>

              <div className="border-l-2 border-emerald-400 pl-3 py-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">D-Day: 면접장 이동 및 배웅</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                  차 안에서 예상 질문을 계속 물어보며 긴장감을 높이지 마세요. 가벼운 일상 대화나 따뜻한 손잡기로 긴장을 이완시켜 주는 것이 최고의 서포트입니다.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
