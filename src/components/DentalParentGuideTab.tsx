import React, { useState } from 'react';
import { DENTAL_BOOKS, DENTAL_SCHOOLS } from '../data/dentalMasterData';
import { 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  HeartHandshake, 
  Eye, 
  Clock, 
  Award, 
  Sparkles,
  Stethoscope,
  Scissors
} from 'lucide-react';

export const DentalParentGuideTab: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklist = [
    { id: 'dc1', label: '"왜 의대가 아닌 치대인가" 1분 두괄식 답변 키워드(삶의 질, 완결적 인술) 정리 완료' },
    { id: 'dc2', label: '손기술(Manual Dexterity) 관련 고교 경험(악기, 공예, 정밀 실험 등) 스토리텔링 숙지' },
    { id: 'dc3', label: '블라인드 금지어: 부모 직업(치과의사, 의사, 병원장 등), 병원명, 학교명 일체 발화 금지 확인' },
    { id: 'dc4', label: '생기부에 기재된 구강 미생물/불소/생체재료 세특 기초과학 원리 3분 설명 준비' },
    { id: 'dc5', label: 'MMI 윤리 딜레마(과잉진료 거부, 자연치아 보존, 치과공포증 환자 소통) 입장 정립' },
    { id: 'dc6', label: '목표 대학(서울대, 연세대, 경희대 등) 면접 시간(10분~30분) 및 MMI 방 개수 확인' },
    { id: 'dc7', label: '모르는 질문 대처법: "그 세부 지식까지는 미처 확인하지 못했으나, 제가 배운 XX 원리로 유추하자면..." 훈련' },
    { id: 'dc8', label: '단정한 사복(정장 또는 깔끔한 셔츠/니트) 및 신분증, 수험표 전날 확인' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 text-white rounded-2xl border border-amber-800/40 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide border border-amber-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            치의예과 수험생 & 학부모 합격 바이블
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            치의예과 면접 성공을 위한 학부모 전략 가이드
          </h1>
          <p className="text-sm text-amber-100/80 leading-relaxed">
            치과의사에게 필수적인 <strong>손기술(Manual Dexterity) 어필 노하우</strong>부터 
            의료계 학부모 가정이 가장 주의해야 할 <strong>블라인드 감점 방지책</strong>, 
            그리고 <strong>필독 도서 8선</strong>과 전국 11개 치대 전형 비교표를 총망라했습니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3 Core Pillars */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: How to prove Manual Dexterity */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-teal-600" />
              손기술(Manual Dexterity)은 어떻게 어필해야 할까?
            </h2>

            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs space-y-2 text-teal-950 dark:text-teal-200 leading-relaxed">
              <p>
                <strong>사정관이 바라는 답변:</strong> 단순히 "손재주가 좋습니다"는 역효과를 냅니다. 치과의사의 손기술은 거울에 비친 상을 보며 0.1mm 오차도 허용하지 않는 <em>'고도의 공간지각력 + 반복 훈련을 통한 신체 통제력 + 실패해도 다시 다듬는 끈기'</em>의 결합입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">1. 악기 연주 (피아노, 바이올린, 첼로)</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  "플랫이 없는 첼로를 연주하며 1mm의 미세한 손가락 위치 차이를 귀로 판별하고 호흡과 손끝의 압력을 통제한 훈련"으로 연결.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">2. 미술·조소·공예 활동</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  "찰흙 조소나 목공에서 3차원 입체 비례를 실시간으로 맞추고, 좁은 틈새를 정밀 도구로 조각했던 경험"으로 연결.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">3. 정밀 과학 실험 (표본 제작)</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  "식물 횡단면 절편을 면도날로 얇게 박절하여 현미경 프레파라트를 만들 때 떨림을 억제하고 핀셋을 다루던 미세 조작"으로 연결.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">4. 프라모델·로봇 키트 조립</div>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  "설계도를 보고 머릿속에서 3차원 회전을 하며 부품의 결합 공차를 사포로 미세하게 조율하던 공간지각력"으로 연결.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Blind Audit for Dental Families */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              의료계 학부모 가정의 블라인드 면접 감점 방어
            </h2>

            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/40 text-xs space-y-2">
              <div className="font-semibold text-rose-900 dark:text-rose-300">
                실수로 나오는 순간 '0점 및 심각한 감점'이 되는 표현들:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-rose-800 dark:text-rose-300/90 leading-relaxed">
                <li>❌ "치과의사이신 아버지의 진료실에서 체어를 보며..." ➔ <em>부모 직업 직접 노출로 실격 위기</em></li>
                <li>❌ "어머니 병원에서 의료봉사를 진행하며 진료 차트를 보고..." ➔ <em>부모 지위 간접 노출</em></li>
                <li>❌ "저희 외고/과고 의학 동아리에서..." ➔ <em>출신 고교 유형 노출</em></li>
              </ul>
              <div className="pt-2 font-medium text-emerald-800 dark:text-emerald-300">
                ✅ 모범 대체 표현: "어릴 적 정기 구강검진을 받으러 치과를 찾았을 때...", "지역 보건소의 구강보건 캠페인을 접하며...", "교내 자율 탐구 활동 중..."
              </div>
            </div>
          </div>

          {/* Section 3: Dental Reading List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              치의예과 면접관을 사로잡는 필독 도서 8선
            </h2>

            <div className="space-y-3">
              {DENTAL_BOOKS.map((book, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {book.title}
                    </span>
                    <span className="text-slate-400 shrink-0">{book.author}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>핵심 주제:</strong> {book.coreThemes}
                  </p>
                  <p className="text-teal-700 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/20 p-2 rounded-lg">
                    <strong>면접 활용 팁:</strong> {book.interviewApplication}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checklist & 11 Schools Matrix */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                치의예과 면접 당일 체크리스트
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {Object.values(checkedItems).filter(Boolean).length} / {checklist.length}
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
                        ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 text-slate-900 dark:text-slate-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                      isChecked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-600'
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

          {/* 11 Schools Comparison Summary Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              지원 5대 치과대학 면접 유형 비교표
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                <div className="font-bold text-purple-900 dark:text-purple-200">
                  MMI (다중미니면접) 실시: 부산대학교 치전원
                </div>
                <p className="text-purple-800 dark:text-purple-300 mt-1 leading-normal">
                  총 3개 면접실 (잠재력, 인성·사회성, 발전가능성) 각 7~8분씩 총 20~25분. 상황 딜레마 대처 및 잠재력 다면평가.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                <div className="font-bold text-blue-900 dark:text-blue-200">
                  제시문 + 서류 심층: 경희대학교 치의예과
                </div>
                <p className="text-blue-800 dark:text-blue-300 mt-1 leading-normal">
                  네오르네상스 전형. 출제 문항(인성/제시문) 8분 + 서류확인 10분 총 18분. 인화영식 인재상과 생기부 전문성 집요 검증.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  서류기반(세특 꼬리질문) 심층: 단국대·경북대·조선대
                </div>
                <ul className="text-emerald-800 dark:text-emerald-300 mt-1 space-y-1 list-disc pl-3.5 leading-normal">
                  <li><strong>단국대(천안) DKU인재:</strong> 10~12분. 교과 세특 기초과학 원리 꼬리질문 압박 강도 높음.</li>
                  <li><strong>경북대 학종:</strong> 10~12분. 전공 지식과 손기술/공간지각 적성, 왜 치대인가 집중 확인.</li>
                  <li><strong>조선대 학종:</strong> 10분 내외. 타액 완충용액, 충치 탈회 등 기초 교과 연계 및 인성 평가.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
