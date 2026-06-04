"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   강사관리 프로그램 — 파트너 강사 매니지먼트 SaaS (앱 UI)
   디자인 톤: Notion design system (Notion.com)
   화면: 대시보드 · 강사 리스트 · 강사 상세 · 채널 분석
   ──────────────────────────────────────────────────────────── */

const FONT =
  '"Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

type View = "dashboard" | "instructors" | "detail" | "channels" | "schedule" | "settlement" | "reviews" | "screening" | "inbox";
type GalleryView = "gallery" | "table" | "board";

/* ═══════════════════════════════════════════════════════════
   NOTION DESIGN TOKENS
   ═══════════════════════════════════════════════════════════ */

const N = {
  primary: "#5645d4",
  primaryDeep: "#3a2a99",
  navy: "#0a1530",
  navyMid: "#1a2a52",
  canvas: "#ffffff",
  surface: "#f6f5f4",
  surfaceSoft: "#fafaf9",
  hairline: "#e5e3df",
  hairlineSoft: "#ede9e4",
  ink: "#1a1a1a",
  charcoal: "#37352f",
  slate: "#5d5b54",
  steel: "#787671",
  stone: "#a4a097",
  muted: "#bbb8b1",
  // tints
  peach: "#ffe8d4",
  rose: "#fde0ec",
  mint: "#d9f3e1",
  lavender: "#e6e0f5",
  sky: "#dcecfa",
  yellow: "#fef7d6",
  cream: "#f8f5e8",
  // bold
  orange: "#dd5b00",
  pink: "#ff64c8",
  purple: "#7b3ff2",
  teal: "#2a9d99",
  green: "#1aae39",
  blue: "#0075de",
  brown: "#523410",
};

const CAT_COLOR = {
  "데이터 분석 교육": { bg: N.sky, text: N.blue, solid: "#5b9be8" },
  "UX 디자인 교육": { bg: N.rose, text: N.pink, solid: "#f499c7" },
  "백엔드 개발 교육": { bg: N.lavender, text: N.primary, solid: "#9b8be8" },
  "디지털 마케팅 교육": { bg: N.peach, text: N.orange, solid: "#f0a05c" },
  "영어 회화 교육": { bg: N.mint, text: N.green, solid: "#7cc891" },
  "그래픽 디자인 교육": { bg: N.cream, text: N.brown, solid: "#a48861" },
  "머신러닝 교육": { bg: N.lavender, text: N.purple, solid: "#b08be8" },
  "비즈니스 영어 교육": { bg: N.yellow, text: "#9a7b2b", solid: "#e6c95c" },
};

type Category = keyof typeof CAT_COLOR;

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════ */

type Instructor = {
  id: string;
  name: string;
  category: Category;
  tier: "Lead" | "Senior" | "Mid";
  joined: string;
  revenue: number; // 만원
  ytd: number;
  classes: number;
  nps: number;
  nextClass?: string;
  initials: string;
  channels: string[];
  status: "active" | "onboarding" | "paused" | "screening";
  students?: number; // 누적 수강생 수
  affiliation?: string; // 원 소속 (프리랜서 포함)
};

// 강사 등급 — 영어 키는 내부용, 화면에는 한국어 라벨만 노출 (평가형 등급)
const TIER_LABEL: Record<Instructor["tier"], string> = {
  Lead: "우수 강사",
  Senior: "정규 강사",
  Mid: "신규 강사",
};

const INSTRUCTORS: Instructor[] = [
  { id: "i1", name: "김민호", category: "데이터 분석 교육", tier: "Senior", joined: "2024-03", revenue: 3200, ytd: 28400, classes: 18, nps: 4.7, students: 842, nextClass: "5/30 (목) 14:00", initials: "김민", channels: ["기업 출강", "자사 온라인 클래스"], status: "active", affiliation: "이커머스 플랫폼 재직" },
  { id: "i2", name: "이수진", category: "UX 디자인 교육", tier: "Lead", joined: "2023-08", revenue: 4800, ytd: 41200, classes: 22, nps: 4.9, students: 1284, nextClass: "5/29 (수) 19:00", initials: "이수", channels: ["대학 평생교육원", "자사 온라인 클래스"], status: "active", affiliation: "핀테크 A사" },
  { id: "i3", name: "박재호", category: "백엔드 개발 교육", tier: "Lead", joined: "2022-11", revenue: 5200, ytd: 48600, classes: 14, nps: 4.8, students: 1067, nextClass: "5/30 (목) 20:00", initials: "박재", channels: ["기업 출강", "자사 현장 오프라인 클래스"], status: "active", affiliation: "IT 대기업 B사" },
  { id: "i4", name: "정유리", category: "디지털 마케팅 교육", tier: "Senior", joined: "2024-01", revenue: 2800, ytd: 24500, classes: 26, nps: 4.5, students: 936, nextClass: "5/31 (금) 11:00", initials: "정유", channels: ["자사 현장 오프라인 클래스", "자사 온라인 클래스"], status: "active", affiliation: "종합 광고대행사" },
  { id: "i5", name: "최예린", category: "영어 회화 교육", tier: "Senior", joined: "2023-04", revenue: 2400, ytd: 22100, classes: 31, nps: 4.6, students: 1452, nextClass: "5/29 (수) 06:00", initials: "최예", channels: ["대학 평생교육원", "자사 온라인 클래스"], status: "active", affiliation: "프리랜서" },
  { id: "i6", name: "조성민", category: "그래픽 디자인 교육", tier: "Mid", joined: "2024-04", revenue: 1800, ytd: 7200, classes: 12, nps: 4.4, students: 388, nextClass: "6/1 (토) 14:00", initials: "조성", channels: ["자사 온라인 클래스"], status: "active", affiliation: "프리랜서" },
  { id: "i7", name: "한지원", category: "머신러닝 교육", tier: "Lead", joined: "2023-02", revenue: 4200, ytd: 38400, classes: 11, nps: 4.9, students: 724, nextClass: "5/30 (목) 21:00", initials: "한지", channels: ["기업 출강", "자사 온라인 클래스"], status: "active", affiliation: "AI 스타트업 C사" },
  { id: "i8", name: "윤서연", category: "비즈니스 영어 교육", tier: "Mid", joined: "2024-02", revenue: 2100, ytd: 14800, classes: 19, nps: 4.5, students: 612, nextClass: "—", initials: "윤서", channels: ["자사 현장 오프라인 클래스"], status: "onboarding", affiliation: "외국계 컨설팅사" },
  { id: "i9", name: "강태욱", category: "백엔드 개발 교육", tier: "Senior", joined: "2022-06", revenue: 0, ytd: 19800, classes: 0, nps: 4.6, students: 503, nextClass: "—", initials: "강태", channels: ["기업 출강"], status: "paused", affiliation: "프리랜서" },
  { id: "i10", name: "송지아", category: "디지털 마케팅 교육", tier: "Mid", joined: "2023-11", revenue: 0, ytd: 9600, classes: 0, nps: 4.3, students: 274, nextClass: "—", initials: "송지", channels: ["자사 현장 오프라인 클래스"], status: "paused", affiliation: "커머스 스타트업" },
  { id: "s1", name: "정하늘", category: "데이터 분석 교육", tier: "Mid", joined: "2026-05", revenue: 0, ytd: 0, classes: 0, nps: 0, students: 0, nextClass: "—", initials: "정하", channels: [], status: "screening", affiliation: "게임사 데이터팀" },
  { id: "s2", name: "오민재", category: "UX 디자인 교육", tier: "Senior", joined: "2026-05", revenue: 0, ytd: 0, classes: 0, nps: 0, students: 0, nextClass: "—", initials: "오민", channels: [], status: "screening", affiliation: "프리랜서" },
  { id: "s3", name: "배수아", category: "머신러닝 교육", tier: "Lead", joined: "2026-05", revenue: 0, ytd: 0, classes: 0, nps: 0, students: 0, nextClass: "—", initials: "배수", channels: [], status: "screening", affiliation: "대학원 연구실" },
  { id: "s4", name: "한승우", category: "디지털 마케팅 교육", tier: "Senior", joined: "2026-05", revenue: 0, ytd: 0, classes: 0, nps: 0, students: 0, nextClass: "—", initials: "한승", channels: [], status: "screening", affiliation: "이커머스 마케팅팀" },
  { id: "s5", name: "임도현", category: "백엔드 개발 교육", tier: "Lead", joined: "2026-05", revenue: 0, ytd: 0, classes: 0, nps: 0, students: 0, nextClass: "—", initials: "임도", channels: [], status: "screening", affiliation: "스타트업 백엔드 리드" },
];

const KPI = [
  { label: "이번 달 매출", value: "₩2.65억", unit: "", delta: "+18%", up: true, hint: "지난 달 ₩2.25억", trend: [175, 188, 197, 206, 221, 236, 265] },
  { label: "누적 수강생", value: "8,082", unit: "명", delta: "+412명", up: true, hint: "이번 달 신규 412명", trend: [6700, 7050, 7350, 7600, 7820, 7950, 8082] },
  { label: "활성 강사", value: "7", unit: "명", delta: "+1명", up: true, hint: "온보딩 1 · 휴직 2 · 심사 5", trend: [5, 6, 6, 6, 7, 7, 7] },
  { label: "이번 달 강의", value: "187", unit: "건", delta: "+24건", up: true, hint: "지난 달 163건", trend: [145, 152, 168, 163, 172, 179, 187] },
  { label: "평균 NPS", value: "4.6", unit: "점", delta: "+0.2", up: true, hint: "5점 만점 · 응답 1,240건", trend: [4.2, 4.3, 4.4, 4.5, 4.5, 4.4, 4.6] },
];

// 단위: 백만원 (5월 265 = ₩2.65억, 강사 매출 합과 일치)
const REVENUE_12M = [
  { m: "6월", v: 156 }, { m: "7월", v: 170 }, { m: "8월", v: 163 }, { m: "9월", v: 188 },
  { m: "10월", v: 200 }, { m: "11월", v: 212 }, { m: "12월", v: 220 }, { m: "1월", v: 206 },
  { m: "2월", v: 225 }, { m: "3월", v: 239 }, { m: "4월", v: 225 }, { m: "5월", v: 265 },
];

// 플랫폼이 제공하는 수업 경로 — 자사 직접(인바운드) vs 외부 연계(아웃바운드)
// revenue 단위: 백만원. 합 265 = ₩2.65억 (강사 매출 합·KPI와 일치)
const CHANNELS = [
  { name: "자사 온라인 클래스", type: "인바운드" as const, revenue: 120, share: 45.3, instructors: 6, classes: 42, margin: 88, color: N.primary, tint: N.lavender, trend: [87, 94, 100, 107, 111, 116, 120] },
  { name: "자사 현장 오프라인 클래스", type: "인바운드" as const, revenue: 60, share: 22.6, instructors: 4, classes: 18, margin: 80, color: N.blue, tint: N.sky, trend: [43, 46, 49, 52, 55, 58, 60] },
  { name: "대학 평생교육원", type: "아웃바운드" as const, revenue: 46, share: 17.4, instructors: 2, classes: 14, margin: 58, color: N.green, tint: N.mint, trend: [30, 34, 37, 39, 42, 44, 46] },
  { name: "기업 출강", type: "아웃바운드" as const, revenue: 39, share: 14.7, instructors: 4, classes: 12, margin: 55, color: N.orange, tint: N.peach, trend: [24, 27, 30, 32, 34, 37, 39] },
];

const WEEK_SCHEDULE = [
  { day: "월 5/27", classes: [{ time: "10:00", inst: "정유리", title: "퍼포먼스 마케팅 실전", channel: "자사 온라인 클래스", cat: "디지털 마케팅 교육" as Category }] },
  { day: "화 5/28", classes: [{ time: "14:00", inst: "이수진", title: "UX 리서치 워크샵", channel: "대학 평생교육원", cat: "UX 디자인 교육" as Category }, { time: "20:00", inst: "박재호", title: "Spring Boot 마스터", channel: "기업 출강", cat: "백엔드 개발 교육" as Category }] },
  { day: "수 5/29", classes: [{ time: "06:00", inst: "최예린", title: "비즈니스 영어 회화", channel: "자사 온라인 클래스", cat: "영어 회화 교육" as Category }, { time: "19:00", inst: "이수진", title: "디자인 시스템 구축", channel: "자사 온라인 클래스", cat: "UX 디자인 교육" as Category }] },
  { day: "목 5/30", classes: [{ time: "14:00", inst: "김민호", title: "SQL 데이터 분석 입문", channel: "자사 온라인 클래스", cat: "데이터 분석 교육" as Category }, { time: "20:00", inst: "박재호", title: "MSA 아키텍처 심화", channel: "기업 출강", cat: "백엔드 개발 교육" as Category }, { time: "21:00", inst: "한지원", title: "LLM 파인튜닝 실전", channel: "자사 현장 오프라인 클래스", cat: "머신러닝 교육" as Category }] },
  { day: "금 5/31", classes: [{ time: "11:00", inst: "정유리", title: "GA4 분석 실전", channel: "자사 현장 오프라인 클래스", cat: "디지털 마케팅 교육" as Category }] },
];

const SETTLEMENT = [
  { month: "5월", gross: 5200, fee: 520, net: 4680, status: "예정" },
  { month: "4월", gross: 4800, fee: 480, net: 4320, status: "정산 완료" },
  { month: "3월", gross: 4400, fee: 440, net: 3960, status: "정산 완료" },
  { month: "2월", gross: 4100, fee: 410, net: 3690, status: "정산 완료" },
  { month: "1월", gross: 3800, fee: 380, net: 3420, status: "정산 완료" },
];

// 카테고리별 강의명 풀 — 강사 상세 강의 현황에 사용
const COURSE_NAMES: Record<string, string[]> = {
  "데이터 분석 교육": ["SQL 데이터 분석 입문", "파이썬 데이터 시각화", "비즈니스 통계 실전", "대시보드 설계 워크샵"],
  "UX 디자인 교육": ["UX 리서치 워크샵", "디자인 시스템 구축", "피그마 프로토타이핑", "사용성 테스트 실무"],
  "백엔드 개발 교육": ["Spring Boot 마스터", "MSA 아키텍처 심화", "대용량 트래픽 설계", "REST API 베스트 프랙티스"],
  "디지털 마케팅 교육": ["퍼포먼스 마케팅 실전", "GA4 분석 실전", "콘텐츠 마케팅 전략", "그로스 해킹 입문"],
  "영어 회화 교육": ["비즈니스 영어 회화", "원어민 발음 클리닉", "프레젠테이션 영어", "데일리 스피킹"],
  "그래픽 디자인 교육": ["브랜드 아이덴티티 디자인", "편집 디자인 실무", "일러스트레이터 마스터", "타이포그래피 기초"],
  "머신러닝 교육": ["LLM 파인튜닝 실전", "딥러닝 모델 설계", "MLOps 파이프라인", "추천 시스템 구축"],
  "비즈니스 영어 교육": ["글로벌 미팅 영어", "협상 영어 실전", "비즈니스 라이팅", "영어 인터뷰 대비"],
};

type NotifType = "class" | "settlement" | "application" | "screening" | "review" | "student";
const NOTIFICATIONS: { type: NotifType; title: string; desc: string; time: string; unread: boolean; instId?: string }[] = [
  { type: "screening", title: "오민재 강사 심사가 최종 승인됐어요", desc: "UX 디자인 교육 · 온보딩 단계로 이동했어요", time: "8분 전", unread: true, instId: "s2" },
  { type: "application", title: "새 강사 지원서가 접수됐어요", desc: "임도현 · 백엔드 개발 교육 · 스타트업 백엔드 리드", time: "32분 전", unread: true, instId: "s5" },
  { type: "class", title: "박재호 강사의 ‘MSA 아키텍처 심화’ 수업이 완료됐어요", desc: "기업 출강 · 수강생 42명 참여 · 평점 4.8", time: "1시간 전", unread: true, instId: "i3" },
  { type: "review", title: "이수진 강사에게 새 리뷰가 등록됐어요", desc: "★ 5.0 · “설명이 명확하고 친절해요”", time: "2시간 전", unread: true, instId: "i2" },
  { type: "settlement", title: "5월 정산이 집계 완료됐어요", desc: "정산 예정액 ₩2.39억 · 6월 10일 입금 예정", time: "3시간 전", unread: false },
  { type: "student", title: "이번 주 신규 수강생 128명이 등록했어요", desc: "최예린 강사 영어 회화 교육이 가장 인기였어요", time: "5시간 전", unread: false, instId: "i5" },
  { type: "class", title: "한지원 강사의 ‘LLM 파인튜닝 실전’ 수업이 완료됐어요", desc: "자사 온라인 클래스 · 영상 업로드 완료", time: "어제", unread: false, instId: "i7" },
  { type: "screening", title: "배수아 강사 서류 검토가 시작됐어요", desc: "머신러닝 교육 · 대학원 연구실", time: "어제", unread: false, instId: "s3" },
  { type: "application", title: "새 강사 지원서가 접수됐어요", desc: "한승우 · 디지털 마케팅 교육 · 이커머스 마케팅팀", time: "2일 전", unread: false, instId: "s4" },
  { type: "settlement", title: "4월 정산이 입금 완료됐어요", desc: "8명 강사 · ₩2.21억 지급 완료", time: "2일 전", unread: false },
  { type: "review", title: "박재호 강사에게 새 리뷰가 등록됐어요", desc: "★ 4.0 · “현업 경험이 묻어나는 강의예요”", time: "3일 전", unread: false, instId: "i3" },
  { type: "class", title: "정유리 강사의 ‘GA4 분석 실전’ 수업이 완료됐어요", desc: "자사 현장 오프라인 클래스 · 수강생 28명 참여", time: "3일 전", unread: false, instId: "i4" },
];

/* ═══════════════════════════════════════════════════════════
   APP STATE & INTERACTION LAYER  (Toast · Modal · Data store)
   "동작하는 것처럼" 보이는 데모를 위한 인터랙션 인프라
   ═══════════════════════════════════════════════════════════ */

type ToastVariant = "info" | "success" | "warning";
interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  desc?: string;
}

type ModalState =
  | null
  | { kind: "add-instructor" }
  | { kind: "assign-class"; name?: string }
  | { kind: "search" }
  | { kind: "blocked"; title: string; desc: string; flavor?: "upload" | "lock" | "construct" };

interface AppCtxValue {
  // data store (session-persisted)
  instructors: Instructor[];
  addInstructor: (i: Instructor) => void;
  // toast
  pushToast: (t: Omit<ToastItem, "id">) => void;
  comingSoon: (feature?: string) => void;
  // modal
  modal: ModalState;
  openModal: (m: Exclude<ModalState, null>) => void;
  closeModal: () => void;
  blocked: (opts: { title: string; desc: string; flavor?: "upload" | "lock" | "construct" }) => void;
}

const AppCtx = createContext<AppCtxValue | null>(null);
function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const [instructors, setInstructors] = useState<Instructor[]>(INSTRUCTORS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const idRef = useRef(1);

  const pushToast = (t: Omit<ToastItem, "id">) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { ...t, id }]);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const value: AppCtxValue = {
    instructors,
    addInstructor: (i) => {
      setInstructors((prev) => [i, ...prev]);
      pushToast({ variant: "success", title: "강사가 추가되었어요", desc: `${i.name} · ${i.category}` });
    },
    pushToast,
    comingSoon: (feature) =>
      setModal({
        kind: "blocked",
        title: feature ? `${feature} 기능\n전문가와 현장에서 직접 구현해볼 수 있어요` : "— 전문가와 현장에서 직접 구현해볼 수 있어요",
        desc: "이 프로그램은 강의 이해를 돕기 위해 수강생의 실제 작품을 가볍게 재현한 예시예요. 강의에서는 어떤 기능이든 직접 설계하고 만들어보실 수 있어요.",
      }),
    modal,
    openModal: (m) => setModal(m),
    closeModal: () => setModal(null),
    blocked: (opts) => setModal({ kind: "blocked", ...opts }),
  };

  return (
    <AppCtx.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismissToast} />
      <ModalRoot />
    </AppCtx.Provider>
  );
}

/* ── Toast ── */
function ToastViewport({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const enter = setTimeout(() => setShown(true), 10);
    const leave = setTimeout(() => setShown(false), 5000);
    const close = setTimeout(onClose, 5300);
    return () => {
      clearTimeout(enter);
      clearTimeout(leave);
      clearTimeout(close);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tone = {
    info: { tint: N.lavender, color: N.primary, icon: ICON_PATHS.inbox },
    success: { tint: N.mint, color: N.green, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    warning: { tint: N.peach, color: N.orange, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> },
  }[item.variant];

  return (
    <div
      className="pointer-events-auto w-[330px] bg-white border border-[#e5e3df] rounded-xl shadow-[0_8px_28px_-6px_rgba(15,15,15,0.18)] p-3.5 flex items-start gap-3 transition-all duration-300"
      style={{ transform: shown ? "translateX(0)" : "translateX(120%)", opacity: shown ? 1 : 0 }}
    >
      <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tone.tint, color: tone.color }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">{tone.icon}</svg>
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{item.title}</div>
        {item.desc && <div className="text-[11.5px] text-[#787671] mt-0.5 leading-snug">{item.desc}</div>}
      </div>
      <button onClick={onClose} className="w-5 h-5 rounded hover:bg-[#f0eeec] flex items-center justify-center text-[#a4a097] flex-shrink-0">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

/* ── Modal shell ── */
function ModalShell({ children, onClose, width = "max-w-[480px]" }: { children: React.ReactNode; onClose: () => void; width?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 10);
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onEsc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0a1530]/40 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: shown ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className={`relative w-full ${width} bg-white rounded-2xl shadow-[0_16px_48px_-8px_rgba(15,15,15,0.16)] border border-[#e5e3df] transition-all duration-200`}
        style={{ transform: shown ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)", opacity: shown ? 1 : 0 }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalRoot() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;
  if (modal.kind === "add-instructor") return <AddInstructorModal onClose={closeModal} />;
  if (modal.kind === "assign-class") return <AssignClassModal name={modal.name} onClose={closeModal} />;
  if (modal.kind === "search") return <SearchModal onClose={closeModal} />;
  if (modal.kind === "blocked") return <BlockedModal title={modal.title} desc={modal.desc} flavor={modal.flavor} onClose={closeModal} />;
  return null;
}

/* ── Blocked / coming-soon modal (강한 차단) ── */
function BlockedModal({ title, desc, flavor = "construct", onClose }: { title: string; desc: string; flavor?: "upload" | "lock" | "construct"; onClose: () => void }) {
  const art = {
    upload: { tint: N.sky, color: N.blue, path: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" },
    lock: { tint: N.peach, color: N.orange, path: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" },
    construct: { tint: N.yellow, color: "#9a7b2b", path: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" },
  }[flavor];
  return (
    <ModalShell onClose={onClose} width="max-w-[400px]">
      <div className="p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: art.tint, color: art.color }}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={art.path} /></svg>
        </div>
        <div className="space-y-0.5">
          <p className="text-[19px] font-bold text-[#1a1a1a] tracking-tight leading-snug">{title.split("\n")[0]}</p>
          {title.includes("\n") && (
            <p className="text-[13px] font-normal text-[#a4a097] leading-snug">{title.split("\n")[1].replace(/^—\s*/, "")}</p>
          )}
        </div>
        <p className="text-[13px] text-[#5d5b54] mt-2 leading-relaxed">{desc}</p>

        <button onClick={onClose} className="mt-5 w-full py-2.5 text-[13px] font-medium bg-[#5645d4] text-white rounded-lg hover:bg-[#4534b3] transition">
          확인했어요
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Add Instructor modal (데모 폼 — 세션 내 실제 추가) ── */
function AddInstructorModal({ onClose }: { onClose: () => void }) {
  const { addInstructor } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("데이터 분석 교육");
  const [tier, setTier] = useState<Instructor["tier"]>("Mid");
  const [email, setEmail] = useState("");
  const cats = Object.keys(CAT_COLOR) as Category[];
  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    addInstructor({
      id: `new-${Date.now()}`,
      name: name.trim(),
      category,
      tier,
      joined: "2026-06",
      revenue: 0,
      ytd: 0,
      classes: 0,
      nps: 0,
      nextClass: "—",
      initials: name.trim().slice(0, 2),
      channels: ["자사 온라인 클래스"],
      status: "onboarding",
    });
    onClose();
  };

  const cat = CAT_COLOR[category];
  return (
    <ModalShell onClose={onClose}>
      <div className="px-5 py-4 border-b border-[#ede9e4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: N.lavender, color: N.primary }}>
            <Icon p="users" className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-[14px] font-semibold text-[#1a1a1a] leading-tight">새 강사 추가</div>
            <div className="text-[11px] text-[#a4a097] mt-0.5">파트너 강사 데이터베이스에 등록</div>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-[#f0eeec] flex items-center justify-center text-[#787671]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Live preview avatar */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: cat.bg }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-[16px] text-white" style={{ background: cat.solid }}>
            {name.trim() ? name.trim()[0] : "?"}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-[#1a1a1a] truncate">{name.trim() || "강사 이름"}</div>
            <div className="text-[12px]" style={{ color: cat.text }}>{category} · {TIER_LABEL[tier]}</div>
          </div>
        </div>

        <Field label="이름">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="예: 김하늘"
            className="w-full px-3 py-2 text-[13px] bg-white border border-[#c8c4be] rounded-lg focus:outline-none focus:border-[#5645d4] focus:ring-2 focus:ring-[#5645d4]/15 transition"
          />
        </Field>

        <Field label="카테고리">
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => {
              const m = CAT_COLOR[c];
              const active = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 text-[12px] rounded-md transition flex items-center gap-1.5 border ${active ? "border-transparent text-white" : "bg-white border-[#e5e3df] text-[#37352f] hover:bg-[#f6f5f4]"}`}
                  style={active ? { background: m.solid } : undefined}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#fff" : m.solid }} />
                  {c}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="강사 등급">
          <div className="inline-flex bg-[#f6f5f4] rounded-lg p-0.5 gap-0.5">
            {(["Mid", "Senior", "Lead"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-3 py-1.5 text-[12px] rounded-md transition ${tier === t ? "bg-white text-[#1a1a1a] font-medium shadow-sm" : "text-[#787671]"}`}
              >
                {TIER_LABEL[t]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="이메일 (선택)">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="instructor@c-edu.kr"
            className="w-full px-3 py-2 text-[13px] bg-white border border-[#c8c4be] rounded-lg focus:outline-none focus:border-[#5645d4] focus:ring-2 focus:ring-[#5645d4]/15 transition"
          />
        </Field>
      </div>

      <div className="px-5 py-3.5 border-t border-[#ede9e4] flex items-center justify-between">
        <span className="text-[11px] text-[#a4a097]">⏎ 로 빠르게 추가</span>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-2 text-[12.5px] font-medium text-[#5d5b54] hover:bg-[#f0eeec] rounded-lg transition">취소</button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="px-4 py-2 text-[12.5px] font-medium text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: canSubmit ? N.primary : N.muted }}
          >
            강사 추가
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ── Assign Class modal ── */
function AssignClassModal({ name, onClose }: { name?: string; onClose: () => void }) {
  const { pushToast } = useApp();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0].name);
  const canSubmit = title.trim().length > 0 && date.trim().length > 0;
  const submit = () => {
    if (!canSubmit) return;
    pushToast({ variant: "success", title: "강의가 배정되었어요", desc: `${title} · ${date}` });
    onClose();
  };
  return (
    <ModalShell onClose={onClose}>
      <div className="px-5 py-4 border-b border-[#ede9e4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: N.peach, color: N.orange }}>
            <Icon p="calendar" className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <div>
            <div className="text-[14px] font-semibold text-[#1a1a1a] leading-tight">강의 배정{name ? ` · ${name}` : ""}</div>
            <div className="text-[11px] text-[#a4a097] mt-0.5">새 강의 일정을 등록합니다</div>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-[#f0eeec] flex items-center justify-center text-[#787671]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-5 space-y-4">
        <Field label="강의명">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: SQL 데이터 분석 입문" className="w-full px-3 py-2 text-[13px] bg-white border border-[#c8c4be] rounded-lg focus:outline-none focus:border-[#5645d4] focus:ring-2 focus:ring-[#5645d4]/15 transition" />
        </Field>
        <Field label="일시">
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="예: 6/12 (목) 20:00" className="w-full px-3 py-2 text-[13px] bg-white border border-[#c8c4be] rounded-lg focus:outline-none focus:border-[#5645d4] focus:ring-2 focus:ring-[#5645d4]/15 transition" />
        </Field>
        <Field label="채널">
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-white border border-[#c8c4be] rounded-lg focus:outline-none focus:border-[#5645d4] focus:ring-2 focus:ring-[#5645d4]/15 transition">
            {CHANNELS.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="px-5 py-3.5 border-t border-[#ede9e4] flex items-center justify-end gap-2">
        <button onClick={onClose} className="px-3 py-2 text-[12.5px] font-medium text-[#5d5b54] hover:bg-[#f0eeec] rounded-lg transition">취소</button>
        <button onClick={submit} disabled={!canSubmit} className="px-4 py-2 text-[12.5px] font-medium text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: canSubmit ? N.primary : N.muted }}>배정하기</button>
      </div>
    </ModalShell>
  );
}

/* ── Search modal (⌘K) ── */
function SearchModal({ onClose }: { onClose: () => void }) {
  const { instructors, pushToast, comingSoon } = useApp();
  const [q, setQ] = useState("");
  const results = q.trim()
    ? instructors.filter((i) => i.name.includes(q.trim()) || i.category.includes(q.trim()))
    : instructors.slice(0, 5);
  return (
    <ModalShell onClose={onClose} width="max-w-[520px]">
      <div className="px-4 py-3 border-b border-[#ede9e4] flex items-center gap-2.5">
        <Icon p="search" className="w-4 h-4 text-[#a4a097]" strokeWidth={1.8} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="강사 · 채널 · 강의 검색…"
          className="flex-1 text-[14px] bg-transparent focus:outline-none placeholder:text-[#a4a097]"
        />
        <kbd className="text-[10px] text-[#a4a097] bg-[#f6f5f4] px-1.5 py-0.5 rounded">ESC</kbd>
      </div>
      <div className="p-2 max-h-[340px] overflow-y-auto">
        <div className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.5px] text-[#a4a097]">
          {q.trim() ? `검색 결과 ${results.length}건` : "강사 바로가기"}
        </div>
        {results.length === 0 && (
          <div className="px-3 py-8 text-center text-[12.5px] text-[#a4a097]">"{q}"에 대한 결과가 없어요</div>
        )}
        {results.map((i) => {
          const m = CAT_COLOR[i.category];
          return (
            <button
              key={i.id}
              onClick={() => { comingSoon("강사 검색 상세"); onClose(); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f6f5f4] transition text-left"
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold flex-shrink-0 tracking-tight" style={{ background: m.bg, color: m.text }}>{i.initials}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#1a1a1a] truncate">{i.name}</div>
                <div className="text-[11px] text-[#a4a097]">{i.category} · {TIER_LABEL[i.tier]}</div>
              </div>
              <svg className="w-3.5 h-3.5 text-[#c8c4be]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

/* small labelled field */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11.5px] font-medium text-[#5d5b54] mb-1.5">{label}</div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED UI
   ═══════════════════════════════════════════════════════════ */

function Sparkline({ data, color = N.ink, w = 60, h = 18 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2" fill={color} />
    </svg>
  );
}

function CategoryBadge({ cat }: { cat: Category }) {
  const m = CAT_COLOR[cat];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: m.bg, color: m.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.solid }} />
      {cat}
    </span>
  );
}

function TierBadge({ tier }: { tier: Instructor["tier"] }) {
  const map = {
    Lead: { bg: "#1a1a1a", text: "#ffffff" },
    Senior: { bg: N.lavender, text: N.primary },
    Mid: { bg: N.surface, text: N.charcoal },
  }[tier] ?? { bg: N.surface, text: N.charcoal };
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap" style={{ background: map.bg, color: map.text }}>
      {TIER_LABEL[tier]}
    </span>
  );
}

function InstructorAvatar({ inst, size = "md", solid = false }: { inst: Instructor; size?: "sm" | "md" | "lg"; solid?: boolean }) {
  const sz = size === "lg" ? "w-12 h-12 text-[12px] rounded-2xl" : size === "sm" ? "w-7 h-7 text-[9px] rounded-md" : "w-9 h-9 text-[10.5px] rounded-lg";
  const cat = CAT_COLOR[inst.category];
  const style = solid
    ? { background: cat.solid, color: "#fff" }
    : { background: cat.bg, color: cat.text };
  return (
    <div className={`${sz} flex-shrink-0 flex items-center justify-center font-semibold tracking-tight ${solid ? "ring-2 ring-white/70 shadow-sm" : ""}`} style={style}>
      {inst.initials}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR — Notion page hierarchy
   ═══════════════════════════════════════════════════════════ */

const ICON_PATHS = {
  chartBar: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>,
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>,
  user: <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/>,
  chartPie: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/>,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>,
  banknote: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>,
  star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>,
  cog: <><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>,
  trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>,
  inbox: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"/>,
  search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>,
  plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>,
  template: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>,
  clipboardCheck: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>,
  building: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>,
  arrowRight: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>,
  xMark: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>,
};

function Icon({ p, className = "w-3.5 h-3.5", strokeWidth = 1.6 }: { p: keyof typeof ICON_PATHS; className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
      {ICON_PATHS[p]}
    </svg>
  );
}

function PageIcon({ tint, color, icon }: { tint: string; color: string; icon: keyof typeof ICON_PATHS }) {
  return (
    <span className="w-[18px] h-[18px] flex-shrink-0 rounded-[5px] flex items-center justify-center" style={{ background: tint, color }}>
      <Icon p={icon} className="w-3 h-3" strokeWidth={2} />
    </span>
  );
}

function Chevron({ open, className = "w-3 h-3" }: { open?: boolean; className?: string }) {
  return (
    <svg className={`${className} transition-transform ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

/* Area chart with upward-trend emphasis — used on Dashboard */
function RevenueChart() {
  const data = REVENUE_12M;
  const cur = data[data.length - 1].v;
  const first = data[0].v;
  const absGrowth = cur - first;
  const pctGrowth = ((cur - first) / first) * 100;

  // Y-axis range with breathing room
  const yMin = 130;
  const yMax = 290;
  const yRange = yMax - yMin;
  const PAD_T = 8;
  const PAD_B = 8;
  const HEIGHT_PCT = 100 - PAD_T - PAD_B; // 84%

  // Convert v to y-percentage
  const yOf = (v: number) => PAD_T + (1 - (v - yMin) / yRange) * HEIGHT_PCT;
  const xOf = (i: number) => (i / (data.length - 1)) * 100;

  const points = data.map((r, i) => ({ x: xOf(i), y: yOf(r.v), v: r.v, m: r.m }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L100 ${100 - PAD_B} L0 ${100 - PAD_B} Z`;

  // Linear regression for trend line
  const n = data.length;
  const sumX = data.reduce((a, _, i) => a + i, 0);
  const sumY = data.reduce((a, r) => a + r.v, 0);
  const sumXY = data.reduce((a, r, i) => a + i * r.v, 0);
  const sumX2 = data.reduce((a, _, i) => a + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendStartY = yOf(intercept);
  const trendEndY = yOf(intercept + slope * (n - 1));

  const targetY = yOf(250);

  return (
    <div className="col-span-12 lg:col-span-8 bg-white border border-[#e5e3df] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[14px] font-semibold text-[#1a1a1a]">월 매출 추이</div>
          <div className="text-[11px] text-[#a4a097] mt-0.5">최근 12개월 · 6월 → 5월</div>
        </div>
        <div className="inline-flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#37352f]"><span className="w-3 h-[2px] rounded-full bg-[#5645d4]" />실 매출</span>
          <span className="flex items-center gap-1.5 text-[#787671]"><svg width="12" height="2"><line x1="0" y1="1" x2="12" y2="1" stroke="#a4a097" strokeWidth="1.5" strokeDasharray="3 2"/></svg>추세선</span>
          <span className="flex items-center gap-1.5 text-[#787671]"><svg width="12" height="2"><line x1="0" y1="1" x2="12" y2="1" stroke="#dd5b00" strokeWidth="1.5" strokeDasharray="3 2"/></svg>목표</span>
        </div>
      </div>

      {/* Growth stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5 pb-4 border-b border-[#ede9e4]">
        <div>
          <div className="text-[10px] text-[#a4a097] uppercase tracking-[0.5px] font-semibold mb-1.5">현재 매출</div>
          <div className="flex items-baseline gap-1">
            <div className="text-[26px] font-semibold tracking-tight text-[#1a1a1a] tabular-nums leading-none">₩{(cur / 100).toFixed(2)}억</div>
            <div className="text-[11px] text-[#a4a097]">/ 5월</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#a4a097] uppercase tracking-[0.5px] font-semibold mb-1.5">12개월 성장률</div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-[26px] font-semibold tracking-tight text-[#1aae39] tabular-nums leading-none inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l8 10h-5v6h-6v-6H4z"/></svg>
              +{pctGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#a4a097] uppercase tracking-[0.5px] font-semibold mb-1.5">절대 증가</div>
          <div className="flex items-baseline gap-1">
            <div className="text-[26px] font-semibold tracking-tight text-[#1a1a1a] tabular-nums leading-none">+₩{(absGrowth / 100).toFixed(2)}억</div>
            <div className="text-[11px] text-[#a4a097]">vs 6월</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex gap-2">
        {/* Y axis labels */}
        <div className="flex flex-col justify-between text-[9.5px] text-[#bbb8b1] tabular-nums w-10 text-right pt-1 pb-5">
          <span>₩2.8억</span>
          <span>₩2.1억</span>
          <span>₩1.4억</span>
        </div>
        <div className="flex-1">
          <div className="relative h-[200px] w-full">
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lab5RevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5645d4" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#5645d4" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#5645d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[150, 200, 250].map((v) => {
                const y = yOf(v);
                return <line key={v} x1="0" x2="100" y1={y.toFixed(2)} y2={y.toFixed(2)} stroke="#ede9e4" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />;
              })}
              {/* Target line at ₩400M */}
              <line x1="0" x2="100" y1={targetY.toFixed(2)} y2={targetY.toFixed(2)} stroke="#dd5b00" strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" opacity="0.7" />
              {/* Trend line (linear regression) */}
              <line x1="0" x2="100" y1={trendStartY.toFixed(2)} y2={trendEndY.toFixed(2)} stroke="#a4a097" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
              {/* Area fill */}
              <path d={areaPath} fill="url(#lab5RevGrad)" />
              {/* Revenue line */}
              <path d={linePath} fill="none" stroke="#5645d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* Dots — HTML for perfect circles regardless of stretch */}
            {points.map((p, i) => {
              const last = i === points.length - 1;
              return (
                <div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  {last ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#5645d4] ring-[3px] ring-white shadow-[0_2px_6px_rgba(86,69,212,0.4)]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white border-[1.5px] border-[#5645d4]" />
                  )}
                </div>
              );
            })}

            {/* End value callout */}
            <div
              className="absolute pointer-events-none"
              style={{ left: `${points[points.length - 1].x}%`, top: `${points[points.length - 1].y}%`, transform: "translate(-50%, calc(-100% - 14px))" }}
            >
              <div className="px-2 py-1 rounded-md bg-[#1a1a1a] text-white text-[10.5px] font-semibold tabular-nums whitespace-nowrap shadow-md">
                ₩{(cur / 100).toFixed(2)}억
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#1a1a1a]" />
              </div>
            </div>

            {/* Start value caption */}
            <div
              className="absolute pointer-events-none"
              style={{ left: `${points[0].x}%`, top: `${points[0].y}%`, transform: "translate(-4px, calc(-100% - 10px))" }}
            >
              <div className="text-[10px] text-[#787671] font-medium tabular-nums">₩{(first / 100).toFixed(2)}억</div>
            </div>

            {/* Target label */}
            <div className="absolute right-1 text-[9.5px] text-[#dd5b00] font-medium bg-white px-1 leading-none -translate-y-[10px]" style={{ top: `${targetY}%` }}>
              목표 ₩2.5억
            </div>
          </div>

          {/* Month labels */}
          <div className="flex justify-between mt-2 text-[10px] text-[#a4a097] tabular-nums">
            {data.map((r, i) => (
              <span key={i} className={i === data.length - 1 ? "font-semibold text-[#1a1a1a]" : ""}>{r.m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Notion-style section heading (H2 toggle block) */
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3 mt-2 group">
      <div className="flex items-start gap-1.5 min-w-0">
        <button className="mt-1.5 w-4 h-4 rounded hover:bg-[#ede9e4] text-[#787671] flex items-center justify-center opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <Chevron open className="w-2.5 h-2.5" />
        </button>
        <div className="-ml-0.5">
          <h2 className="text-[22px] font-semibold tracking-[-0.4px] text-[#1a1a1a] leading-tight">{title}</h2>
          {subtitle && <div className="text-[12.5px] text-[#787671] mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

const NAV_PAGES: { key: View; label: string; tint: string; color: string; icon: keyof typeof ICON_PATHS; instructorTree?: boolean; screeningBadge?: boolean }[] = [
  { key: "dashboard", label: "대시보드", tint: N.sky, color: N.blue, icon: "chartBar" },
  { key: "instructors", label: "강사", tint: N.lavender, color: N.primary, icon: "users", instructorTree: true },
  { key: "screening", label: "심사 중인 강사", tint: N.peach, color: N.orange, icon: "clipboardCheck", screeningBadge: true },
  { key: "channels", label: "채널 분석", tint: N.mint, color: N.green, icon: "chartPie" },
];

const UTILITY_PAGES: { key?: View; label: string; tint: string; color: string; icon: keyof typeof ICON_PATHS }[] = [
  { key: "schedule", label: "강의 일정", tint: N.peach, color: N.orange, icon: "calendar" },
  { key: "settlement", label: "정산 관리", tint: N.yellow, color: "#9a7b2b", icon: "banknote" },
  { key: "reviews", label: "리뷰 모니터링", tint: N.cream, color: N.brown, icon: "star" },
  { label: "설정", tint: N.surface, color: N.steel, icon: "cog" },
];

function Sidebar({ view, setView, goToDetail }: { view: View; setView: (v: View) => void; goToDetail: (id?: string) => void }) {
  const { openModal, comingSoon, instructors } = useApp();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ fav: true, pages: true, util: true });
  const [openPages, setOpenPages] = useState<Record<string, boolean>>({ instructors: true });
  const toggleGroup = (k: string) => setOpenGroups((p) => ({ ...p, [k]: !p[k] }));
  const togglePage = (k: string, e: React.MouseEvent) => { e.stopPropagation(); setOpenPages((p) => ({ ...p, [k]: !p[k] })); };
  const navTo = (k: View) => (k === "detail" ? goToDetail() : setView(k));

  const QuickRow = ({ icon, label, accent, onClick }: { icon: keyof typeof ICON_PATHS; label: string; accent?: boolean; onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[#ede9e4] transition text-left">
      <span className={`w-[18px] h-[18px] flex items-center justify-center ${accent ? "text-[#5645d4]" : "text-[#787671]"}`}>
        <Icon p={icon} className="w-3.5 h-3.5" strokeWidth={1.6} />
      </span>
      <span className="text-[13px] text-[#37352f] flex-1">{label}</span>
      {label === "빠른 찾기" && <span className="text-[10px] text-[#a4a097] tabular-nums">⌘K</span>}
      {label === "받은편지함" && NOTIFICATIONS.filter((n) => n.unread).length > 0 && <span className="text-[10px] text-white font-semibold rounded-full px-1.5 py-0.5 bg-[#dd5b00]">{NOTIFICATIONS.filter((n) => n.unread).length}</span>}
    </button>
  );

  return (
    <aside className="w-[244px] flex-shrink-0 bg-[#fafaf9] border-r border-[#e5e3df] flex flex-col">
      {/* Workspace switcher */}
      <div className="px-2 pt-2.5 pb-1.5">
        <button onClick={() => comingSoon("워크스페이스 전환")} className="w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-md hover:bg-[#ede9e4] transition group">
          <div className="w-5 h-5 rounded-[5px] bg-[#5645d4] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">C</div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13.5px] font-semibold text-[#1a1a1a] truncate leading-tight">강사관리 프로그램</div>
          </div>
          <svg className="w-3 h-3 text-[#a4a097] opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
          <span className="w-5 h-5 rounded hover:bg-[#e5e3df] flex items-center justify-center text-[#787671]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
          </span>
        </button>
      </div>

      {/* Quick rows */}
      <div className="px-2 pb-2 space-y-0">
        <QuickRow icon="search" label="빠른 찾기" onClick={() => openModal({ kind: "search" })} />
        <QuickRow icon="inbox" label="받은편지함" accent onClick={() => setView("inbox")} />
      </div>

      <nav className="flex-1 px-2 py-1 space-y-0 overflow-y-auto">
        {/* Workspace pages group */}
        <div className="mt-1 mb-0.5">
          <button onClick={() => toggleGroup("pages")} className="group w-full flex items-center gap-1 px-1.5 py-1 text-[#787671] hover:text-[#37352f]">
            <Chevron open={openGroups.pages} className="w-2.5 h-2.5" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] flex-1 text-left">워크스페이스</span>
            <span className="w-4 h-4 rounded hover:bg-[#e5e3df] flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Icon p="plus" className="w-3 h-3" strokeWidth={2.2} />
            </span>
          </button>
          {openGroups.pages && (
            <div className="space-y-px">
              {NAV_PAGES.map((p) => {
                const active = view === p.key || (p.key === "instructors" && view === "detail");
                const expandable = !!p.instructorTree;
                const subOpen = openPages[p.key];
                return (
                  <div key={p.key}>
                    <div className={`group/row flex items-center gap-0.5 pr-1 rounded-md ${active ? "bg-[#ede9e4]" : "hover:bg-[#f0eeec]"}`}>
                      <button
                        onClick={(e) => { if (expandable) togglePage(p.key, e); }}
                        className={`w-4 h-4 flex items-center justify-center rounded text-[#a4a097] flex-shrink-0 ml-0.5 ${expandable ? "hover:bg-[#dad7d2] cursor-pointer" : "cursor-default"}`}
                        aria-label="toggle"
                      >
                        {expandable && <Chevron open={!!subOpen} className="w-2.5 h-2.5" />}
                      </button>
                      <button onClick={() => navTo(p.key)} className="flex-1 flex items-center gap-1.5 py-1 min-w-0 text-left">
                        <PageIcon tint={p.tint} color={p.color} icon={p.icon} />
                        <span className={`text-[13px] truncate ${active ? "text-[#1a1a1a] font-medium" : "text-[#37352f]"}`}>{p.label}</span>
                      </button>
                      {p.instructorTree && (
                        <span className="text-[10px] font-medium tabular-nums px-1 py-0.5 rounded text-[#787671]">{instructors.filter((i) => i.status !== "screening").length}</span>
                      )}
                      {p.screeningBadge && instructors.filter((i) => i.status === "screening").length > 0 && (
                        <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-[#dd5b00] text-white">{instructors.filter((i) => i.status === "screening").length}</span>
                      )}
                      {p.instructorTree && (
                        <button onClick={(e) => { e.stopPropagation(); openModal({ kind: "add-instructor" }); }} className="w-5 h-5 rounded hover:bg-[#dad7d2] flex items-center justify-center text-[#787671] opacity-0 group-hover/row:opacity-100">
                          <Icon p="plus" className="w-3 h-3" strokeWidth={2.2} />
                        </button>
                      )}
                    </div>
                    {expandable && subOpen && (
                      <div className="ml-[18px] border-l border-[#e5e3df] pl-1">
                        {instructors.filter((i) => i.status !== "screening").slice(0, 6).map((inst) => {
                          const m = CAT_COLOR[inst.category];
                          const isSel = view === "detail";
                          return (
                            <button key={inst.id} onClick={() => goToDetail(inst.id)} className="group/sub w-full flex items-center gap-1.5 py-1 pl-1.5 pr-1 rounded-md hover:bg-[#f0eeec] text-left">
                              <span className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[8px] font-semibold flex-shrink-0 tracking-tight" style={{ background: m.bg, color: m.text }}>{inst.initials}</span>
                              <span className="text-[13px] text-[#5d5b54] truncate flex-1 group-hover/sub:text-[#37352f]">{inst.name}</span>
                              {inst.status === "screening" && <span className="w-1.5 h-1.5 rounded-full bg-[#dd5b00] flex-shrink-0" title="심사 중" />}
                              {inst.status === "paused" && <span className="w-1.5 h-1.5 rounded-full bg-[#a4a097] flex-shrink-0" title="휴직" />}
                            </button>
                          );
                        })}
                        <button onClick={() => navTo("instructors")} className="w-full flex items-center gap-1.5 py-1 pl-2 pr-1 rounded-md hover:bg-[#f0eeec] text-left text-[#787671]">
                          <Icon p="arrowRight" className="w-3 h-3" strokeWidth={2} />
                          <span className="text-[12.5px]">전체 강사 {instructors.length}명</span>
                        </button>
                        <button onClick={() => openModal({ kind: "add-instructor" })} className="w-full flex items-center gap-1.5 py-1 pl-2 pr-1 rounded-md hover:bg-[#f0eeec] text-left text-[#a4a097]">
                          <Icon p="plus" className="w-3 h-3" strokeWidth={2} />
                          <span className="text-[12.5px]">강사 추가</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Utility group */}
        <div className="mt-3 mb-0.5">
          <button onClick={() => toggleGroup("util")} className="group w-full flex items-center gap-1 px-1.5 py-1 text-[#787671] hover:text-[#37352f]">
            <Chevron open={openGroups.util} className="w-2.5 h-2.5" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] flex-1 text-left">워크플로우</span>
          </button>
          {openGroups.util && (
            <div className="space-y-px">
              {UTILITY_PAGES.map((u) => {
                const active = !!u.key && view === u.key;
                return (
                  <div key={u.label} className={`group/row flex items-center gap-0.5 pr-1 rounded-md ${active ? "bg-[#ede9e4]" : "hover:bg-[#f0eeec]"}`}>
                    <span className="w-4 h-4 flex-shrink-0 ml-0.5" />
                    <button onClick={() => (u.key ? setView(u.key) : comingSoon(u.label))} className="flex-1 flex items-center gap-1.5 py-1 min-w-0 text-left">
                      <PageIcon tint={u.tint} color={u.color} icon={u.icon} />
                      <span className={`text-[13px] truncate ${active ? "text-[#1a1a1a] font-medium" : "text-[#37352f]"}`}>{u.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trash */}
        <div className="mt-4 pt-3 border-t border-[#ede9e4] space-y-px">
          <button onClick={() => comingSoon("휴지통")} className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#f0eeec] text-left">
            <span className="w-[18px] h-[18px] flex items-center justify-center text-[#a4a097]"><Icon p="trash" className="w-3.5 h-3.5"/></span>
            <span className="text-[13px] text-[#5d5b54]">휴지통</span>
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-2 py-2 border-t border-[#ede9e4]">
        <div onClick={() => comingSoon("계정 설정")} className="flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-[#ede9e4] transition cursor-pointer group">
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#e6e0f5] flex items-center justify-center text-[10.5px] font-semibold text-[#5645d4]">박</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1aae39] border-2 border-[#fafaf9]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-[#1a1a1a] truncate leading-tight">박지원</div>
            <div className="text-[10.5px] text-[#a4a097] truncate leading-tight mt-0.5">파트너 매니저 · Pro</div>
          </div>
          <svg className="w-3 h-3 text-[#a4a097] opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
        </div>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOPBAR — Notion breadcrumb header
   ═══════════════════════════════════════════════════════════ */

function Topbar({ view, breadcrumb, goBack, goForward, canBack, canForward }: { view: View; breadcrumb: { tint: string; color: string; icon: keyof typeof ICON_PATHS; label: string; parent?: string }[]; goBack: () => void; goForward: () => void; canBack: boolean; canForward: boolean }) {
  const { comingSoon, pushToast } = useApp();
  const [faved, setFaved] = useState(false);
  return (
    <header className="h-[44px] flex-shrink-0 border-b border-[#e5e3df] bg-white px-3 flex items-center justify-between">
      {/* Left: history + breadcrumb */}
      <div className="flex items-center gap-0.5 min-w-0">
        <button onClick={goBack} disabled={!canBack} className={`w-7 h-7 rounded flex items-center justify-center transition ${canBack ? "hover:bg-[#f0eeec] text-[#5d5b54]" : "text-[#d4d1cc] cursor-default"}`} title="뒤로 가기">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <button onClick={goForward} disabled={!canForward} className={`w-7 h-7 rounded flex items-center justify-center transition ${canForward ? "hover:bg-[#f0eeec] text-[#5d5b54]" : "text-[#d4d1cc] cursor-default"}`} title="앞으로 가기">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
        <div className="flex items-center gap-0.5 ml-1 min-w-0">
          {breadcrumb.map((b, i) => (
            <div key={i} className="flex items-center gap-0.5 min-w-0">
              <button className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec] transition min-w-0">
                <PageIcon tint={b.tint} color={b.color} icon={b.icon} />
                <span className={`text-[13px] truncate ${i === breadcrumb.length - 1 ? "text-[#1a1a1a] font-medium" : "text-[#787671]"}`}>{b.label}</span>
              </button>
              {i < breadcrumb.length - 1 && (
                <span className="text-[#bbb8b1] text-[12px] px-0.5">/</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <span className="text-[11.5px] text-[#a4a097] mr-2 hidden md:inline">3분 전 편집</span>
        <button onClick={() => comingSoon("공유 및 권한")} className="px-2.5 py-1 rounded hover:bg-[#f0eeec] text-[13px] text-[#37352f] font-medium transition">공유</button>
        <button onClick={() => comingSoon("댓글")} className="w-7 h-7 rounded hover:bg-[#f0eeec] flex items-center justify-center text-[#5d5b54]" aria-label="댓글">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A.75.75 0 005.25 22a8.964 8.964 0 003.74-.789 9.04 9.04 0 003.01.539z"/></svg>
        </button>
        <button onClick={() => comingSoon("알림")} className="w-7 h-7 rounded hover:bg-[#f0eeec] flex items-center justify-center text-[#5d5b54] relative" aria-label="알림">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#dd5b00]" />
        </button>
        <button
          onClick={() => { setFaved((f) => !f); pushToast({ variant: faved ? "info" : "success", title: faved ? "즐겨찾기에서 제거됨" : "즐겨찾기에 추가됨" }); }}
          className="w-7 h-7 rounded hover:bg-[#f0eeec] flex items-center justify-center transition"
          style={{ color: faved ? "#d4af1a" : "#5d5b54" }}
          aria-label="즐겨찾기"
        >
          <svg className="w-4 h-4" fill={faved ? "#f5d75e" : "none"} stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
        </button>
        <button onClick={() => comingSoon("페이지 메뉴")} className="w-7 h-7 rounded hover:bg-[#f0eeec] flex items-center justify-center text-[#5d5b54]" aria-label="더보기">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
        </button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. DASHBOARD
   ═══════════════════════════════════════════════════════════ */

function Dashboard({ goToDetail }: { goToDetail: (id?: string) => void }) {
  const { openModal, comingSoon } = useApp();
  const [calloutOpen, setCalloutOpen] = useState(true);
  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      {/* ── Notion page header ── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[12px] text-[#787671] mb-3 -ml-1">
          <button onClick={() => comingSoon("아이콘 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">
            <Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2} /> 아이콘 추가
          </button>
          <button onClick={() => comingSoon("커버 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            커버 추가
          </button>
          <button onClick={() => comingSoon("댓글")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A.75.75 0 005.25 22a8.964 8.964 0 003.74-.789 9.04 9.04 0 003.01.539z"/></svg>
            댓글 추가
          </button>
        </div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: N.sky }}>
            <Icon p="chartBar" className="w-7 h-7" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-[40px] font-semibold tracking-[-0.8px] leading-[1.1] text-[#1a1a1a]">대시보드</h1>
          </div>
        </div>

        {/* Properties (Notion database properties on page) */}
        <div className="space-y-1.5 mb-1 pl-1">
          {[
            { icon: "user", label: "소유자", value: <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#e6e0f5] flex items-center justify-center text-[9px] font-semibold text-[#5645d4]">박</span><span className="text-[#37352f] text-[13px]">박지원</span></span> },
            { icon: "calendar", label: "기간", value: <span className="text-[#37352f] text-[13px]">2026년 5월 1일 → 5월 31일</span> },
            { icon: "star", label: "상태", value: <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#d9f3e1] text-[11.5px] font-medium text-[#1aae39]"><span className="w-1.5 h-1.5 rounded-full bg-[#1aae39]" />라이브</span> },
            { icon: "template", label: "태그", value: <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded text-[11.5px] font-medium bg-[#e6e0f5] text-[#391c57]">매니지먼트</span><span className="px-1.5 py-0.5 rounded text-[11.5px] font-medium bg-[#dcecfa] text-[#0075de]">5월 리포트</span></span> },
            { icon: "chartBar", label: "데이터 소스", value: <span className="text-[#787671] text-[13px]">강사 DB · 채널 DB · 강의 일정</span> },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2 group/prop hover:bg-[#f0eeec] rounded px-2 py-1 -mx-2 transition">
              <span className="flex items-center gap-1.5 w-[140px] text-[#787671] flex-shrink-0">
                <Icon p={p.icon as keyof typeof ICON_PATHS} className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[13px]">{p.label}</span>
              </span>
              <span className="flex-1 min-w-0">{p.value}</span>
            </div>
          ))}
          <button onClick={() => comingSoon("속성 추가")} className="flex items-center gap-1.5 px-2 py-1 -mx-2 mt-1 text-[#a4a097] text-[12.5px] hover:bg-[#f0eeec] rounded transition">
            <Icon p="plus" className="w-3 h-3" strokeWidth={2} />
            <span>속성 추가</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#ede9e4] mb-6" />

      {/* ── Notion navy hero band — Notion homepage signature ── */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#0a1530]">
        {/* sticky-note dots scattered */}
        <div className="absolute top-5 right-7 flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ffe8d4]" />
          <div className="w-2 h-2 rounded-full bg-[#fde0ec]" />
          <div className="w-2 h-2 rounded-full bg-[#dcecfa]" />
          <div className="w-2 h-2 rounded-full bg-[#d9f3e1]" />
          <div className="w-2 h-2 rounded-full bg-[#fef7d6]" />
          <div className="w-2 h-2 rounded-full bg-[#e6e0f5]" />
        </div>
        {/* additional sticky dots in corners */}
        <div className="absolute top-12 left-12 w-1.5 h-1.5 rounded-full bg-[#ff64c8]/60" />
        <div className="absolute bottom-12 left-24 w-2 h-2 rounded-full bg-[#f5d75e]/50" />
        <div className="absolute bottom-8 right-32 w-1.5 h-1.5 rounded-full bg-[#1aae39]/50" />
        {/* mesh wire decorative SVG hint */}
        <svg className="absolute top-0 right-0 w-80 h-full opacity-[0.04] pointer-events-none" viewBox="0 0 200 200">
          <defs>
            <pattern id="meshN" patternUnits="userSpaceOnUse" width="20" height="20">
              <path d="M0 0 L20 20 M20 0 L0 20" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#meshN)" />
        </svg>
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-[#5645d4]/30 blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -left-10 w-64 h-64 rounded-full bg-[#ff64c8]/15 blur-3xl pointer-events-none" />

        <div className="relative px-9 py-9">
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white/50 mb-3">강사관리 프로그램 · 5월 운영 보고</div>
          <h2 className="text-[44px] font-semibold tracking-[-1.2px] leading-[1.05] text-white">
            안녕하세요, 박지원님<br/>
            <span className="text-white/70">5월은 최고의 한 달이에요</span>
          </h2>
          <p className="text-[15px] text-white/60 mt-4 max-w-[560px] leading-relaxed">
            이번 달 매출이 지난 달 대비 <span className="text-white font-semibold">+18% 늘었고</span>,
            <span className="text-white font-semibold"> 8,082명</span>의 수강생이 7명의 활동 강사와 함께하고 있어요.
          </p>
          <div className="flex items-center gap-2 mt-7">
            <button onClick={() => openModal({ kind: "add-instructor" })} className="px-4 py-2 text-[13.5px] font-medium bg-[#5645d4] hover:bg-[#4534b3] text-white rounded-md transition flex items-center gap-1.5">
              <Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2.2} />
              새 강사 등록
            </button>
            <button onClick={() => comingSoon("월간 리포트")} className="px-4 py-2 text-[13.5px] font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-md transition border border-white/15">월간 리포트 보기</button>
          </div>
        </div>
      </div>

      {/* ── Notion callout block (yellow tinted) ── */}
      {calloutOpen && (
      <div className="mb-7 flex items-start gap-3 p-4 rounded-md bg-[#fef7d6]">
        <div className="w-7 h-7 rounded-md bg-white/60 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#dd5b00]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a7.49 7.49 0 01-3 0M3 16.5v-1.6c0-.55.16-1.09.46-1.55l3.39-5.21A2 2 0 018.55 7h6.9a2 2 0 011.7.95l3.39 5.21c.3.46.46 1 .46 1.55v1.6"/></svg>
        </div>
        <div className="flex-1 pt-0.5">
          <div className="text-[14px] text-[#523410] leading-relaxed">
            <span className="font-semibold">5월 매출이 목표 ₩2.5억을 ₩0.15억 초과 달성했어요.</span>
            <span className="text-[#523410]/80"> 데이터 분석 · UX 디자인 교육 과정이 강세예요. 다음 분기 강사 충원 시 우선 검토하세요.</span>
          </div>
        </div>
        <button onClick={() => setCalloutOpen(false)} className="text-[11.5px] text-[#523410]/60 hover:text-[#523410] flex items-center gap-1 px-1.5 py-1 rounded hover:bg-white/40 transition flex-shrink-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      )}

      {/* ── Section: Today's KPI ── */}
      <SectionHeader title="이번 달 핵심 지표" subtitle="실시간 동기화 · 5분 전 갱신" />

      {/* KPI Grid — Notion pastel tints */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {KPI.map((k, i) => {
          const tints = [N.lavender, N.rose, N.sky, N.mint, N.peach];
          const colors = [N.primary, N.pink, N.blue, N.green, N.orange];
          return (
            <div key={k.label} className="bg-white border border-[#e5e3df] rounded-xl p-4 hover:border-[#c8c4be] hover:shadow-[0_4px_12px_rgba(15,15,15,0.06)] transition group">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: tints[i] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[i] }} />
                  <span className="text-[10px] font-medium" style={{ color: colors[i] }}>{k.label}</span>
                </div>
                <Sparkline data={k.trend} color={colors[i]} w={48} h={14} />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-[28px] font-semibold tracking-tight text-[#1a1a1a] leading-none tabular-nums">
                  {k.value}{k.unit && <span className="text-[14px] font-medium text-[#a4a097] ml-0.5">{k.unit}</span>}
                </div>
                <div className="text-[12px] font-semibold text-[#1aae39] inline-flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12"><path d="M6 2l4 5H2z"/></svg>
                  {k.delta}
                </div>
              </div>
              <div className="text-[11px] text-[#a4a097] mt-1.5">{k.hint}</div>
            </div>
          );
        })}
      </div>

      {/* ── Section: Revenue insights ── */}
      <div className="mt-8">
        <SectionHeader
          title="매출 인사이트"
          subtitle="월별 추이 · Top 강사"
          action={<button onClick={() => comingSoon("기간 필터")} className="text-[12px] text-[#0075de] hover:underline">필터 ▾</button>}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* Revenue chart — area chart with growth callouts */}
        <RevenueChart />


        {/* Top instructors */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#e5e3df] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[14px] font-semibold text-[#1a1a1a]">Top 강사</div>
              <div className="text-[11px] text-[#a4a097] mt-0.5">매출 기준 5월</div>
            </div>
          </div>
          <div className="space-y-2">
            {[...INSTRUCTORS].filter((i) => i.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((i, idx) => (
              <div key={i.id} onClick={() => goToDetail(i.id)} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#f6f5f4] transition cursor-pointer">
                <div className="text-[11px] font-bold text-[#a4a097] w-4 tabular-nums">{idx + 1}</div>
                <InstructorAvatar inst={i} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-[#1a1a1a] truncate">{i.name}</div>
                  <div className="text-[10px] text-[#a4a097]">{i.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-semibold text-[#1a1a1a] tabular-nums">₩{i.revenue.toLocaleString()}만</div>
                  <div className="text-[9px] text-[#a4a097]">수강생 {i.students?.toLocaleString() ?? 0}명</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: Operations ── */}
      <div className="mt-8">
        <SectionHeader
          title="운영 현황"
          subtitle="채널 분포 · 이번 주 강의"
          action={<button onClick={() => comingSoon("운영 현황 전체 보기")} className="text-[12px] text-[#0075de] hover:underline">전체 보기 →</button>}
        />
      </div>

      {/* Bottom: Channel distribution + Schedule */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 bg-white border border-[#e5e3df] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[14px] font-semibold text-[#1a1a1a]">채널별 매출 분포</div>
              <div className="text-[11px] text-[#a4a097] mt-0.5">5월 · 총 ₩2.65억</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {CHANNELS.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-[#1a1a1a] font-medium">{c.name}</span>
                    <span className="text-[#a4a097]">· {c.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1a1a1a] font-semibold tabular-nums">₩{(c.revenue / 100).toFixed(1)}억</span>
                    <span className="text-[#a4a097] tabular-nums w-10 text-right">{c.share}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#f6f5f4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.share * 2}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 bg-white border border-[#e5e3df] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[14px] font-semibold text-[#1a1a1a]">이번 주 강의 일정</div>
              <div className="text-[11px] text-[#a4a097] mt-0.5">5월 27일 - 6월 2일 · 9건</div>
            </div>
            <button onClick={() => comingSoon("전체 캘린더")} className="text-[11px] text-[#5645d4] hover:underline">전체 캘린더 →</button>
          </div>
          <div className="space-y-3">
            {WEEK_SCHEDULE.map((day) => (
              <div key={day.day} className="flex items-start gap-3">
                <div className="w-20 flex-shrink-0 pt-1">
                  <div className="text-[11px] font-semibold text-[#1a1a1a]">{day.day}</div>
                  <div className="text-[10px] text-[#a4a097]">{day.classes.length}건</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {day.classes.map((c, i) => {
                    const meta = CAT_COLOR[c.cat];
                    return (
                      <div key={i} onClick={() => comingSoon("강의 상세보기")} className="flex items-center gap-2 p-2 rounded-lg border border-[#ede9e4] hover:border-[#c8c4be] transition cursor-pointer">
                        <div className="w-1 h-8 rounded-full" style={{ background: meta.solid }} />
                        <div className="text-[10px] font-mono text-[#787671] w-10">{c.time}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-[#1a1a1a] truncate">{c.title}</div>
                          <div className="text-[10px] text-[#a4a097]">{c.inst} · {c.channel}</div>
                        </div>
                        <CategoryBadge cat={c.cat} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. INSTRUCTORS LIST
   ═══════════════════════════════════════════════════════════ */

const MAIN_CATS: Category[] = ["데이터 분석 교육", "UX 디자인 교육", "백엔드 개발 교육", "디지털 마케팅 교육", "영어 회화 교육", "머신러닝 교육"];

function Instructors({ goToDetail }: { goToDetail: (id?: string) => void }) {
  const { instructors, openModal, comingSoon } = useApp();
  const [galleryView, setGalleryView] = useState<GalleryView>("gallery");
  const [activeCat, setActiveCat] = useState<string>("전체");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const roster = instructors.filter((i) => i.status !== "screening"); // 심사 중은 별도 페이지
  const filtered = roster
    .filter((i) =>
      activeCat === "전체"
        ? true
        : activeCat === "기타"
        ? !MAIN_CATS.includes(i.category)
        : i.category === activeCat
    )
    .filter((i) => {
      const q = search.trim();
      return !q || i.name.includes(q) || i.category.includes(q) || i.channels.some((c) => c.includes(q));
    })
    .sort((a, b) => (sortDesc ? b.revenue - a.revenue : a.revenue - b.revenue));

  const catCount = (label: string) =>
    label === "전체"
      ? roster.length
      : label === "기타"
      ? roster.filter((i) => !MAIN_CATS.includes(i.category)).length
      : roster.filter((i) => i.category === label).length;

  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      {/* Notion page header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-[12px] text-[#787671] mb-3 -ml-1">
          <button onClick={() => comingSoon("아이콘 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]"><Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2} /> 아이콘 추가</button>
          <button onClick={() => comingSoon("커버 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/></svg>
            커버 추가
          </button>
        </div>
        <div className="flex items-start gap-3 mb-1">
          <div className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: N.lavender }}>
            <Icon p="users" className="w-7 h-7 text-[#5645d4]" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-[40px] font-semibold tracking-[-0.8px] leading-[1.1] text-[#1a1a1a]">강사</h1>
            <p className="text-[14px] text-[#787671] leading-[1.5] mt-2">파트너 강사 데이터베이스 · 활성 22 · 온보딩 2 · 휴직 1</p>
          </div>
        </div>
      </div>

      {/* Database view tabs (Notion segmented underline) */}
      <div className="border-b border-[#ede9e4] mt-7 mb-3 flex items-end justify-between">
        <div className="flex items-end gap-0.5">
          {([
            { k: "gallery" as const, label: "갤러리", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg> },
            { k: "table" as const, label: "테이블", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 15.75h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125"/></svg> },
            { k: "board" as const, label: "보드", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"/></svg> },
          ]).map((v) => {
            const active = v.k === galleryView;
            return (
              <button
                key={v.k}
                onClick={() => setGalleryView(v.k)}
                className={`relative px-2.5 py-2 text-[13.5px] flex items-center gap-1.5 transition ${active ? "text-[#1a1a1a] font-medium" : "text-[#787671] hover:text-[#37352f]"}`}
              >
                <span className={active ? "text-[#37352f]" : "text-[#a4a097]"}>{v.icon}</span>
                {v.label}
                {active && <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-[#37352f] rounded-full" />}
              </button>
            );
          })}
          <button onClick={() => comingSoon("새 보기")} className="px-2.5 py-2 text-[13px] text-[#a4a097] hover:text-[#5d5b54] flex items-center gap-1">
            <Icon p="plus" className="w-3 h-3" strokeWidth={2.2} />
            <span>새 보기</span>
          </button>
        </div>
        <div className="flex items-center gap-0.5 pb-1.5">
          <button onClick={() => comingSoon("고급 필터")} className="px-2 py-1 text-[12.5px] text-[#5d5b54] hover:bg-[#f0eeec] rounded flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/></svg>
            필터
          </button>
          <button onClick={() => setSortDesc((s) => !s)} className="px-2 py-1 text-[12.5px] text-[#5d5b54] hover:bg-[#f0eeec] rounded flex items-center gap-1" title="매출 정렬 전환">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/></svg>
            매출 {sortDesc ? "높은순" : "낮은순"}
          </button>
          <button onClick={() => setShowSearch((s) => !s)} className={`w-7 h-7 rounded flex items-center justify-center transition ${showSearch ? "bg-[#e6e0f5] text-[#5645d4]" : "text-[#5d5b54] hover:bg-[#f0eeec]"}`} aria-label="검색">
            <Icon p="search" className="w-3.5 h-3.5" strokeWidth={1.6} />
          </button>
          <button onClick={() => comingSoon("보기 설정")} className="w-7 h-7 rounded text-[#5d5b54] hover:bg-[#f0eeec] flex items-center justify-center" aria-label="더보기">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
          </button>
          <button onClick={() => openModal({ kind: "add-instructor" })} className="ml-2 px-3 py-1.5 text-[12.5px] font-medium bg-[#5645d4] text-white rounded-md hover:bg-[#4534b3] transition flex items-center gap-1.5">
            <Icon p="plus" className="w-3 h-3" strokeWidth={2.2} />
            <span>새 강사</span>
            <span className="w-px h-3 bg-white/30 mx-0.5" />
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
          </button>
        </div>
      </div>

      {/* Inline search bar (toggled) */}
      {showSearch && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-white border border-[#c8c4be] focus-within:border-[#5645d4] focus-within:ring-1 focus-within:ring-[#5645d4] rounded-lg max-w-[420px]">
          <Icon p="search" className="w-4 h-4 text-[#a4a097]" strokeWidth={1.8} />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 · 카테고리 · 채널로 검색…"
            className="flex-1 text-[13px] bg-transparent focus:outline-none placeholder:text-[#a4a097]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="w-5 h-5 rounded hover:bg-[#f0eeec] flex items-center justify-center text-[#a4a097]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      )}

      {/* Group by row (Notion DB convention) */}
      <div className="flex items-center gap-2 mb-3 text-[12px] text-[#787671]">
        <span className="font-medium text-[#5d5b54]">그룹:</span>
        <button onClick={() => comingSoon("그룹화 기준")} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f0eeec] hover:bg-[#ede9e4]">
          <span className="w-2 h-2 rounded-sm bg-[#5645d4]" />
          <span className="text-[#37352f] font-medium text-[12.5px]">카테고리</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
        </button>
        <span className="text-[#a4a097]">·</span>
        <span className="text-[#a4a097]">{filtered.length}개 항목{search.trim() || activeCat !== "전체" ? ` (전체 ${instructors.length})` : ""}</span>
      </div>

      {/* Filter chips (Notion select property filter) */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {["전체", "데이터 분석 교육", "UX 디자인 교육", "백엔드 개발 교육", "디지털 마케팅 교육", "영어 회화 교육", "머신러닝 교육", "기타"].map((l) => {
          const active = activeCat === l;
          const meta = CAT_COLOR[l as Category];
          return (
            <button
              key={l}
              onClick={() => setActiveCat(l)}
              className={`px-2.5 py-1 text-[12px] rounded-full transition flex items-center gap-1.5 border ${active ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#37352f] border-[#e5e3df] hover:bg-[#f6f5f4]"}`}
            >
              {meta && <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.solid }} />}
              {l}
              <span className={`text-[10px] tabular-nums ${active ? "text-white/60" : "text-[#a4a097]"}`}>{catCount(l)}</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="border border-dashed border-[#e5e3df] rounded-xl py-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#f6f5f4] flex items-center justify-center mb-3">
            <Icon p="search" className="w-5 h-5 text-[#a4a097]" strokeWidth={1.6} />
          </div>
          <div className="text-[14px] font-medium text-[#37352f]">{search.trim() ? `"${search.trim()}"에 대한 결과가 없어요` : "이 카테고리에 강사가 없어요"}</div>
          <div className="text-[12px] text-[#a4a097] mt-1">검색어나 필터를 바꿔보세요</div>
        </div>
      )}

      {/* ─ Gallery view ─ */}
      {galleryView === "gallery" && filtered.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((inst) => {
          const cat = CAT_COLOR[inst.category];
          return (
            <article
              key={inst.id}
              onClick={() => goToDetail(inst.id)}
              className={`group/card bg-white border border-[#e5e3df] rounded-xl overflow-hidden hover:border-[#c8c4be] hover:shadow-[0_4px_12px_rgba(15,15,15,0.08)] transition cursor-pointer ${inst.status === "paused" ? "opacity-65 hover:opacity-100" : ""}`}
            >
              {/* Card top with tinted background — Notion gallery card "cover" */}
              <div className="px-5 pt-5 pb-4 relative" style={{ background: inst.status === "paused" ? N.surface : cat.bg }}>
                <div className="flex items-start justify-between mb-3">
                  <InstructorAvatar inst={inst} size="lg" solid />
                  <div className="flex items-center gap-1">
                    <TierBadge tier={inst.tier} />
                    {inst.status === "onboarding" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white text-[#dd5b00]">온보딩</span>
                    )}
                    {inst.status === "paused" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white text-[#787671]"><span className="w-1 h-1 rounded-full bg-[#a4a097]" />휴직</span>
                    )}
                  </div>
                </div>
                <h3 className="text-[18px] font-semibold tracking-tight text-[#1a1a1a]">{inst.name}</h3>
                <div className="mt-1">
                  <span className="text-[12px] font-medium" style={{ color: cat.text }}>{inst.category}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#5d5b54]">
                  <Icon p="building" className="w-3 h-3 text-[#a4a097] flex-shrink-0" strokeWidth={1.7} />
                  <span className="truncate">{inst.affiliation ?? "프리랜서"}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="px-5 py-4 grid grid-cols-3 gap-3 border-t border-[#ede9e4]">
                <div>
                  <div className="text-[10.5px] text-[#a4a097] mb-1">월 매출</div>
                  <div className="text-[14px] font-semibold text-[#1a1a1a] tabular-nums">₩{inst.revenue.toLocaleString()}만</div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#a4a097] mb-1">강의</div>
                  <div className="text-[14px] font-semibold text-[#1a1a1a] tabular-nums">{inst.classes}건</div>
                </div>
                <div>
                  <div className="text-[10.5px] text-[#a4a097] mb-1">NPS</div>
                  <div className="text-[14px] font-semibold text-[#1a1a1a] tabular-nums">{inst.nps}</div>
                </div>
              </div>

              {/* Channels */}
              <div className="px-5 pb-3">
                <div className="text-[10.5px] text-[#a4a097] mb-1.5">채널</div>
                <div className="flex flex-wrap gap-1">
                  {inst.channels.map((ch) => (
                    <span key={ch} className="text-[11px] px-2 py-0.5 rounded-md bg-[#f0eeec] text-[#5d5b54]">{ch}</span>
                  ))}
                </div>
              </div>

              {/* Next class */}
              {inst.nextClass && inst.nextClass !== "—" && (
                <div className="px-5 pb-4 pt-2 flex items-center gap-2 text-[11px] text-[#37352f] border-t border-[#ede9e4]">
                  <svg className="w-3 h-3 text-[#a4a097]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="text-[#a4a097]">다음 강의</span>
                  <span className="font-medium ml-auto">{inst.nextClass}</span>
                </div>
              )}
            </article>
          );
        })}
        {/* Notion DB "new card" affordance */}
        <button onClick={() => openModal({ kind: "add-instructor" })} className="group/new bg-white border border-dashed border-[#c8c4be] rounded-xl flex flex-col items-center justify-center min-h-[260px] p-5 text-[#787671] hover:bg-[#fafaf9] hover:border-[#5645d4]/40 hover:text-[#5645d4] transition">
          <div className="w-10 h-10 rounded-md bg-[#f0eeec] group-hover/new:bg-[#e6e0f5] flex items-center justify-center mb-2 transition">
            <Icon p="plus" className="w-4 h-4" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-medium">새 강사 추가</span>
          <span className="text-[11.5px] text-[#a4a097] mt-1">갤러리 새 카드</span>
        </button>
      </div>
      )}

      {/* ─ Table view ─ */}
      {galleryView === "table" && filtered.length > 0 && <InstructorTable rows={filtered} onRow={goToDetail} onAdd={() => openModal({ kind: "add-instructor" })} />}

      {/* ─ Board view ─ */}
      {galleryView === "board" && filtered.length > 0 && <InstructorBoard items={filtered} onCard={goToDetail} />}

      {/* Notion DB footer count */}
      <div className="mt-3 pt-2 px-1 flex items-center gap-2 text-[11.5px] text-[#a4a097]">
        <span>{filtered.length}개 카운트</span>
        <span>·</span>
        <button onClick={() => comingSoon("합계 계산")} className="hover:text-[#5d5b54]">합계 계산 +</button>
      </div>
    </div>
  );
}

/* ── Instructor Table view (Notion DB table) ── */
function InstructorTable({ rows, onRow, onAdd }: { rows: Instructor[]; onRow: (id: string) => void; onAdd: () => void }) {
  return (
    <div className="border border-[#e5e3df] rounded-xl overflow-hidden bg-white">
      <table className="w-full text-[12.5px]">
        <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[11px] text-[#787671] font-semibold tracking-[0.5px] uppercase">
          <tr>
            {["강사", "카테고리", "등급", "월 매출", "강의", "NPS", "상태"].map((h, i) => (
              <th key={h} className={`px-4 py-2.5 ${i >= 3 && i <= 5 ? "text-right" : "text-left"}`}>
                <span className="inline-flex items-center gap-1">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => {
            const m = CAT_COLOR[i.category];
            return (
              <tr key={i.id} onClick={() => onRow(i.id)} className="border-t border-[#ede9e4] hover:bg-[#fafaf9] transition cursor-pointer group">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: m.bg, color: m.text }}>{i.name[0]}</span>
                    <span className="font-medium text-[#1a1a1a] group-hover:underline">{i.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5"><CategoryBadge cat={i.category} /></td>
                <td className="px-4 py-2.5"><TierBadge tier={i.tier} /></td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium text-[#1a1a1a]">₩{i.revenue.toLocaleString()}만</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-[#37352f]">{i.classes}건</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-[#37352f]">{i.nps || "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${i.status === "active" ? "bg-[#d9f3e1] text-[#1aae39]" : i.status === "onboarding" ? "bg-[#ffe8d4] text-[#dd5b00]" : "bg-[#f0eeec] text-[#787671]"}`}>
                    {i.status === "active" ? "활성" : i.status === "onboarding" ? "온보딩" : "휴직"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={onAdd} className="w-full flex items-center gap-2 px-4 py-2.5 text-[12.5px] text-[#a4a097] hover:bg-[#fafaf9] hover:text-[#5d5b54] border-t border-[#ede9e4] transition">
        <Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2} />
        새 강사
      </button>
    </div>
  );
}

/* ── Instructor Board view (Notion kanban by category) ── */
function InstructorBoard({ items, onCard }: { items: Instructor[]; onCard: (id: string) => void }) {
  const cols = MAIN_CATS.filter((c) => items.some((i) => i.category === c));
  const otherItems = items.filter((i) => !MAIN_CATS.includes(i.category));
  const allCols: { key: string; cat?: Category; list: Instructor[] }[] = [
    ...cols.map((c) => ({ key: c, cat: c, list: items.filter((i) => i.category === c) })),
    ...(otherItems.length ? [{ key: "기타", list: otherItems }] : []),
  ];
  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      {allCols.map((col) => {
        const m = col.cat ? CAT_COLOR[col.cat] : { bg: N.surface, text: N.slate, solid: N.stone };
        return (
          <div key={col.key} className="flex-shrink-0 w-[240px]">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-medium" style={{ background: m.bg, color: m.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.solid }} />
                {col.key}
              </span>
              <span className="text-[11px] text-[#a4a097] tabular-nums">{col.list.length}</span>
            </div>
            <div className="space-y-2">
              {col.list.map((i) => (
                <button key={i.id} onClick={() => onCard(i.id)} className="w-full text-left bg-white border border-[#e5e3df] rounded-lg p-3 hover:border-[#c8c4be] hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: m.bg, color: m.text }}>{i.name[0]}</span>
                      <span className="text-[13px] font-semibold text-[#1a1a1a] truncate">{i.name}</span>
                    </div>
                    <TierBadge tier={i.tier} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#787671]">
                    <span className="tabular-nums">₩{i.revenue.toLocaleString()}만</span>
                    <span className="tabular-nums">{i.classes}건 · NPS {i.nps || "—"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. INSTRUCTOR DETAIL
   ═══════════════════════════════════════════════════════════ */

function InstructorDetail({ inst, back }: { inst: Instructor; back: () => void }) {
  const { openModal, comingSoon, pushToast } = useApp();
  const cat = CAT_COLOR[inst.category];

  // ── 강사별 결정론적 데이터 생성 (id 시드 — SSR/CSR 동일) ──
  const seed = inst.id.split("").reduce((a, c) => a + c.charCodeAt(0), 7);
  const rand = (n: number) => {
    const x = Math.sin(seed * 53.13 + n * 17.71) * 43758.5453;
    return x - Math.floor(x);
  };
  const paused = inst.status === "paused";
  const curRev = inst.revenue || Math.round(inst.ytd / 12); // 휴직이면 누적 평균
  const isNew = inst.id.startsWith("new-");

  // 12개월 매출 추이 — 우상향 + 변동, 마지막은 현재 매출
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const growth = 0.6 + 0.4 * (i / 11);
    const wobble = 0.9 + 0.2 * rand(i);
    return Math.max(200, Math.round(curRev * growth * wobble));
  });
  if (!paused && !isNew) monthlyRevenue[11] = curRev;

  // 채널별 매출 — inst.channels 가중 분배
  const chW = inst.channels.map((_, i) => 0.5 + rand(i + 40));
  const chSum = chW.reduce((a, b) => a + b, 0) || 1;
  const channelRev = inst.channels
    .map((name, i) => ({ name, v: Math.round(curRev * chW[i] / chSum), share: Math.round((chW[i] / chSum) * 100) }))
    .sort((a, b) => b.v - a.v);

  // 최근 5개월 정산 (매출의 약간 변동, 수수료 10%)
  const months = ["5월", "4월", "3월", "2월", "1월"];
  const settlement = months.map((m, i) => {
    const gross = isNew ? 0 : Math.round(curRev * (1 - i * 0.06) * (0.92 + 0.16 * rand(i + 20)));
    const fee = Math.round(gross * 0.1);
    return { month: m, gross, fee, net: gross - fee, status: i === 0 ? "예정" : "정산 완료" };
  });

  // 리뷰 — nps 기반 점수 분포
  const reviewPool = [
    "실무에서 바로 적용할 수 있는 내용이 가득해요.",
    "설명이 너무 명확하고 친절해요. 다음 강의도 신청합니다.",
    "예시가 풍부해서 이해가 쏙쏙 됐어요.",
    "전반적으로 좋았는데 후반부가 조금 빠르게 진행됐어요.",
    "현업 경험이 묻어나는 강의라 신뢰가 가요.",
    "질문에 항상 정성껏 답해주셔서 감사했어요.",
  ];
  const reviews = isNew
    ? []
    : Array.from({ length: 3 }, (_, i) => {
        const r = rand(i + 60);
        const rating = inst.nps >= 4.7 ? (r > 0.25 ? 5 : 4) : r > 0.5 ? 5 : 4;
        return { user: ["김O지", "박O진", "이O호", "최O연", "정O우"][Math.floor(rand(i + 70) * 5)], rating, text: reviewPool[Math.floor(rand(i + 80) * reviewPool.length)], date: `5/${27 - i * 2}` };
      });

  const reviewCount = isNew ? 0 : Math.round(40 + rand(90) * 160);

  // 매출 차트 좌표 — Y축을 데이터 범위로 좁혀 변동이 잘 보이게
  const rvMin = Math.min(...monthlyRevenue);
  const rvMax = Math.max(...monthlyRevenue);
  const rvPad = Math.max((rvMax - rvMin) * 0.35, rvMax * 0.06);
  const rvLo = Math.max(0, Math.round(rvMin - rvPad));
  const rvHi = Math.round(rvMax + rvPad);
  const rvY = (v: number) => 100 - ((v - rvLo) / (rvHi - rvLo || 1)) * 100;
  const rvPts = monthlyRevenue.map((v, i) => ({ x: (i / 11) * 100, y: rvY(v), v }));
  const rvLine = rvPts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const rvArea = `${rvLine} L100 100 L0 100 Z`;

  // 강의 현황 — 진행 중 / 종료된 강의 (강사별 결정론적)
  const coursePool = COURSE_NAMES[inst.category] ?? [];
  const ongoing = paused || isNew ? [] : coursePool.slice(0, 2).map((name, i) => ({
    name,
    students: Math.round(18 + rand(i + 100) * 64),
    progress: Math.round(35 + rand(i + 101) * 55),
  }));
  const finished = isNew ? [] : coursePool.slice(2, 4).map((name, i) => ({
    name,
    students: Math.round(34 + rand(i + 110) * 90),
    completion: Math.round(74 + rand(i + 111) * 23),
    rating: (4.2 + rand(i + 112) * 0.7).toFixed(1),
  }));

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Cover image strip — Notion document signature */}
      <div className="relative h-[160px] w-full overflow-hidden" style={{ background: cat.bg }}>
        {/* sticky note dots */}
        <div className="absolute top-6 right-8 flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-[860px] w-full px-12 flex items-center justify-between">
          <button onClick={back} className="flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-md bg-white/70 hover:bg-white text-[#37352f] transition">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            강사 목록
          </button>
          <div className="flex items-center gap-1.5">
            <button onClick={() => comingSoon("커버 변경")} className="text-[11.5px] px-2 py-1 rounded-md bg-white/70 hover:bg-white text-[#37352f] transition">커버 변경</button>
            <button onClick={() => comingSoon("위치 변경")} className="text-[11.5px] px-2 py-1 rounded-md bg-white/70 hover:bg-white text-[#37352f] transition">위치 변경</button>
          </div>
        </div>
      </div>

      {/* Page body — centered Notion document */}
      <div className="max-w-[860px] mx-auto px-12">
        {/* Page icon offset above the cover */}
        <div className="relative -mt-[44px] mb-3 z-10">
          <div className="w-[72px] h-[72px] rounded-[10px] flex items-center justify-center font-semibold text-[28px] tracking-tight shadow-md ring-4 ring-white" style={{ background: cat.solid, color: "#fff" }}>
            {inst.name[0]}
          </div>
        </div>

        {/* Tiny action row */}
        <div className="flex items-center gap-1 text-[12px] text-[#787671] mb-3 -ml-1">
          <button onClick={() => comingSoon("아이콘 변경")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">아이콘 변경</button>
          <button onClick={() => comingSoon("아이콘 제거")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">아이콘 제거</button>
          <button onClick={() => comingSoon("댓글")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">댓글 추가</button>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <h1 className="text-[40px] font-semibold tracking-[-0.8px] leading-[1.1] text-[#1a1a1a]">{inst.name}</h1>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 pt-2">
            <button onClick={() => comingSoon("메시지 발송")} className="px-2.5 py-1.5 text-[12.5px] font-medium bg-white border border-[#c8c4be] rounded-md text-[#37352f] hover:bg-[#f6f5f4] transition">메시지</button>
            <button onClick={() => openModal({ kind: "assign-class", name: inst.name })} className="px-2.5 py-1.5 text-[12.5px] font-medium bg-[#5645d4] text-white rounded-md hover:bg-[#4534b3] transition">강의 배정</button>
          </div>
        </div>

        {/* Properties section — Notion DB-style property rows */}
        <div className="space-y-1 mb-5">
          {[
            {
              icon: "users", label: "카테고리",
              value: <CategoryBadge cat={inst.category} />,
            },
            {
              icon: "star", label: "강사 등급",
              value: <TierBadge tier={inst.tier} />,
            },
            {
              icon: "users", label: "원 소속",
              value: (() => {
                const aff = inst.affiliation ?? "프리랜서";
                const free = aff === "프리랜서";
                return <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11.5px] font-medium ${free ? "bg-[#d9f3e1] text-[#1aae39]" : "bg-[#f6f5f4] text-[#37352f]"}`}>{free && <span className="w-1.5 h-1.5 rounded-full bg-[#1aae39]" />}{aff}</span>;
              })(),
            },
            {
              icon: "calendar", label: "가입일",
              value: <span className="text-[#37352f] text-[13px]">{inst.joined.split("-")[0]}년 {Number(inst.joined.split("-")[1])}월</span>,
            },
            {
              icon: "inbox", label: "이메일",
              value: <span className="text-[#0075de] text-[13px] hover:underline cursor-pointer">{inst.id.startsWith("new-") ? "—" : `${inst.id}@c-edu.kr`}</span>,
            },
            {
              icon: "user", label: "전화",
              value: <span className="text-[#37352f] text-[13px] tabular-nums">{inst.id.startsWith("new-") ? "—" : "010-2456-7890"}</span>,
            },
            {
              icon: "chartPie", label: "활동 채널",
              value: (
                <div className="flex flex-wrap items-center gap-1">
                  {inst.channels.map((ch) => (
                    <span key={ch} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11.5px] font-medium bg-[#dcecfa] text-[#0075de]">{ch}</span>
                  ))}
                </div>
              ),
            },
            {
              icon: "calendar", label: "다음 강의",
              value: <span className="text-[#37352f] text-[13px]">{inst.nextClass}</span>,
            },
            {
              icon: "template", label: "활동 상태",
              value: (() => {
                const s = inst.status === "active" ? { t: "활성", bg: "#d9f3e1", c: "#1aae39" } : inst.status === "onboarding" ? { t: "온보딩", bg: "#ffe8d4", c: "#dd5b00" } : { t: "휴직", bg: "#f0eeec", c: "#787671" };
                return <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11.5px] font-medium" style={{ background: s.bg, color: s.c }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />{s.t}</span>;
              })(),
            },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2 group/prop hover:bg-[#f0eeec] rounded px-2 py-1 -mx-2 transition">
              <span className="flex items-center gap-1.5 w-[140px] text-[#787671] flex-shrink-0">
                <Icon p={p.icon as keyof typeof ICON_PATHS} className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[13px]">{p.label}</span>
              </span>
              <span className="flex-1 min-w-0">{p.value}</span>
            </div>
          ))}
          <button onClick={() => comingSoon("속성 추가")} className="flex items-center gap-1.5 px-2 py-1 -mx-2 mt-0.5 text-[#a4a097] text-[12.5px] hover:bg-[#f0eeec] rounded transition">
            <Icon p="plus" className="w-3 h-3" strokeWidth={2} />
            <span>속성 추가</span>
          </button>
        </div>

        {/* Inline KPI strip — Notion synced-block style */}
        <div className="grid grid-cols-4 gap-0 border border-[#e5e3df] rounded-xl overflow-hidden divide-x divide-[#ede9e4] mb-6">
          {[
            { l: "이번 달 매출", v: `₩${inst.revenue.toLocaleString()}만`, d: paused ? "휴직 중" : isNew ? "온보딩" : `+${Math.round(3 + rand(11) * 11)}%`, tone: paused || isNew ? "neutral" as const : "up" as const },
            { l: "YTD 누적", v: inst.ytd >= 10000 ? `₩${Math.floor(inst.ytd / 10000)}억 ${(inst.ytd % 10000).toLocaleString()}만` : `₩${inst.ytd.toLocaleString()}만`, d: "최근 12개월", tone: "neutral" as const },
            { l: "강의 수", v: `${inst.classes}건`, d: paused ? "휴직 전" : "이번 달", tone: "neutral" as const },
            { l: "평균 NPS", v: `${inst.nps || "—"}`, d: isNew ? "집계 전" : `응답 ${reviewCount.toLocaleString()}건`, tone: "neutral" as const },
          ].map((k) => (
            <div key={k.l} className="px-5 py-4 bg-white">
              <div className="text-[10.5px] text-[#a4a097] uppercase tracking-[0.5px] mb-1.5 font-medium">{k.l}</div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-[22px] font-semibold text-[#1a1a1a] tabular-nums leading-none">{k.v}</div>
                {k.tone === "up" && <span className="text-[11px] font-semibold text-[#1aae39]">↑{k.d}</span>}
              </div>
              {k.tone === "neutral" && <div className="text-[11px] text-[#787671] mt-1.5">{k.d}</div>}
            </div>
          ))}
        </div>

        {/* ── Section: Performance ── */}
        <SectionHeader title="매출 성과" subtitle="월별 추이 · 채널 분배" />

        {/* Revenue chart + Channels */}
        <div className="grid grid-cols-12 gap-3 mb-7">
          <div className="col-span-12 lg:col-span-8 bg-white border border-[#e5e3df] rounded-xl p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="text-[14px] font-semibold text-[#1a1a1a]">매출 추이</div>
                <div className="text-[11px] text-[#a4a097] mt-0.5">최근 12개월 · 단위 만원</div>
              </div>
              <div className="text-right">
                <div className="text-[18px] font-semibold tabular-nums text-[#1a1a1a] leading-none">₩{curRev.toLocaleString()}만</div>
                <div className="text-[10px] text-[#a4a097] mt-1">{paused ? "휴직 전 월평균" : isNew ? "데이터 집계 전" : "이번 달"}</div>
              </div>
            </div>
            {isNew ? (
              <div className="h-[180px] flex items-center justify-center text-[12px] text-[#a4a097]">아직 매출 데이터가 없어요</div>
            ) : (
              <>
                <div className="flex gap-2 mt-4">
                  <div className="flex flex-col justify-between text-[9px] text-[#bbb8b1] tabular-nums w-10 text-right pb-5 pt-0.5">
                    <span>{rvHi.toLocaleString()}</span>
                    <span>{Math.round((rvHi + rvLo) / 2).toLocaleString()}</span>
                    <span>{rvLo.toLocaleString()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="relative h-[160px]">
                      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`rvGrad-${inst.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={cat.solid} stopOpacity="0.28" />
                            <stop offset="100%" stopColor={cat.solid} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[0, 50, 100].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#ede9e4" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />)}
                        <path d={rvArea} fill={`url(#rvGrad-${inst.id})`} />
                        <path d={rvLine} fill="none" stroke={cat.solid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      </svg>
                      {rvPts.map((p, i) => {
                        const last = i === rvPts.length - 1;
                        return (
                          <div key={i} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}>
                            {last
                              ? <div className="w-3 h-3 rounded-full ring-[3px] ring-white shadow" style={{ background: cat.solid }} />
                              : <div className="w-1.5 h-1.5 rounded-full bg-white border-[1.5px]" style={{ borderColor: cat.solid }} />}
                          </div>
                        );
                      })}
                      <div className="absolute pointer-events-none" style={{ left: `${rvPts[11].x}%`, top: `${rvPts[11].y}%`, transform: "translate(-50%, calc(-100% - 10px))" }}>
                        <div className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-white text-[9.5px] font-semibold tabular-nums whitespace-nowrap">{monthlyRevenue[11].toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] text-[#a4a097]">
                      {monthlyRevenue.map((_, i) => <span key={i} className={i === 11 ? "font-semibold text-[#1a1a1a]" : ""}>{i + 1}월</span>)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Channels breakdown */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#e5e3df] rounded-xl p-5">
            <div className="text-[14px] font-semibold text-[#1a1a1a] mb-1">채널별 매출</div>
            <div className="text-[11px] text-[#a4a097] mb-4">{paused ? "휴직 전 기준" : "이번 달"}</div>
            <div className="space-y-3">
              {channelRev.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                    <span className="text-[#1a1a1a] font-medium truncate pr-2">{c.name}</span>
                    <span className="text-[#1a1a1a] tabular-nums flex-shrink-0">₩{c.v.toLocaleString()}만</span>
                  </div>
                  <div className="h-1.5 bg-[#f6f5f4] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${c.share}%`, background: cat.solid }} />
                  </div>
                  <div className="text-[10px] text-[#a4a097] mt-1 text-right tabular-nums">{c.share}%</div>
                </div>
              ))}
              {channelRev.length === 0 && <div className="text-[12px] text-[#a4a097] py-4 text-center">채널 데이터 없음</div>}
            </div>
          </div>
        </div>

        {/* ── Section: 강의 현황 ── */}
        <SectionHeader title="강의 현황" subtitle="진행 중 · 종료된 강의와 수강생 결과" />
        <div className="grid grid-cols-12 gap-3 mb-7">
          {/* 진행 중 */}
          <div className="col-span-12 lg:col-span-6 bg-white border border-[#e5e3df] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#1aae39] animate-pulse" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">진행 중인 강의</span>
              <span className="text-[11px] text-[#a4a097]">{ongoing.length}개</span>
            </div>
            <div className="space-y-3">
              {ongoing.map((c) => (
                <div key={c.name} className="p-3 rounded-lg border border-[#ede9e4]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12.5px] font-medium text-[#1a1a1a] truncate pr-2">{c.name}</span>
                    <span className="text-[11px] text-[#787671] flex-shrink-0 tabular-nums">수강생 {c.students}명</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#f6f5f4] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: cat.solid }} />
                    </div>
                    <span className="text-[10.5px] text-[#5d5b54] tabular-nums w-12 text-right">진행 {c.progress}%</span>
                  </div>
                </div>
              ))}
              {ongoing.length === 0 && <div className="py-8 text-center text-[12px] text-[#a4a097]">{paused ? "휴직 중이라 진행 중인 강의가 없어요" : "진행 중인 강의가 없어요"}</div>}
            </div>
          </div>

          {/* 종료된 강의 */}
          <div className="col-span-12 lg:col-span-6 bg-white border border-[#e5e3df] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-3.5 h-3.5 text-[#787671]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">종료된 강의</span>
              <span className="text-[11px] text-[#a4a097]">{finished.length}개</span>
            </div>
            <div className="space-y-2.5">
              {finished.map((c) => (
                <div key={c.name} className="p-3 rounded-lg bg-[#fafaf9] border border-[#ede9e4]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] font-medium text-[#1a1a1a] truncate pr-2">{c.name}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#9a7b2b] flex-shrink-0">
                      <svg className="w-3 h-3 text-[#f5d75e]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {c.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10.5px] text-[#787671]">
                    <span className="tabular-nums">수강생 {c.students}명</span>
                    <span className="text-[#bbb8b1]">·</span>
                    <span className="tabular-nums">수료율 {c.completion}%</span>
                  </div>
                </div>
              ))}
              {finished.length === 0 && <div className="py-8 text-center text-[12px] text-[#a4a097]">아직 종료된 강의가 없어요</div>}
            </div>
          </div>
        </div>

        {/* ── Section: Operations ── */}
        <SectionHeader title="정산 & 리뷰" subtitle="최근 5개월 정산 · 학습자 피드백" />

        {/* Settlement + Recent classes */}
        <div className="grid grid-cols-12 gap-3 pb-12">
          <div className="col-span-12 lg:col-span-7 bg-white border border-[#e5e3df] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#ede9e4] flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#1a1a1a]">정산 내역</div>
                <div className="text-[11px] text-[#a4a097] mt-0.5">최근 5개월</div>
              </div>
              <button onClick={() => comingSoon("정산 전체 내역")} className="text-[11px] text-[#5645d4] hover:underline">전체 내역 →</button>
            </div>
            <table className="w-full text-[12px]">
              <thead className="bg-[#fafaf9] border-b border-[#ede9e4] text-[10px] text-[#5d5b54] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium whitespace-nowrap">월</th>
                  <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">매출</th>
                  <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">수수료 (10%)</th>
                  <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">정산액</th>
                  <th className="text-left px-5 py-2.5 font-medium whitespace-nowrap">상태</th>
                </tr>
              </thead>
              <tbody>
                {settlement.map((s) => (
                  <tr key={s.month} className="border-t border-[#ede9e4]">
                    <td className="px-5 py-3 font-medium text-[#1a1a1a] whitespace-nowrap">{s.month}</td>
                    <td className="px-5 py-3 text-right text-[#37352f] tabular-nums whitespace-nowrap">₩{s.gross.toLocaleString()}만</td>
                    <td className="px-5 py-3 text-right text-[#787671] tabular-nums whitespace-nowrap">₩{s.fee.toLocaleString()}만</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1a1a1a] tabular-nums whitespace-nowrap">₩{s.net.toLocaleString()}만</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${s.status === "예정" ? "bg-[#fef7d6] text-[#9a7b2b]" : "bg-[#d9f3e1] text-[#1aae39]"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-span-12 lg:col-span-5 bg-white border border-[#e5e3df] rounded-xl p-5">
            <div className="text-[14px] font-semibold text-[#1a1a1a] mb-1">최근 강의 리뷰</div>
            <div className="text-[11px] text-[#a4a097] mb-4">{isNew ? "아직 리뷰가 없어요" : `총 ${reviewCount.toLocaleString()}건 · 평균 ${inst.nps}`}</div>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#fafaf9] border border-[#ede9e4]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e6e0f5] flex items-center justify-center text-[10px] font-semibold text-[#5645d4]">{r.user[0]}</div>
                      <span className="text-[11px] font-medium text-[#1a1a1a]">{r.user}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex text-[#f5d75e]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className="w-3 h-3" fill={s <= r.rating ? "currentColor" : "#ede9e4"} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#a4a097]">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-[11.5px] text-[#37352f] leading-relaxed">{r.text}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="py-10 text-center text-[12px] text-[#a4a097]">온보딩 후 강의가 시작되면 리뷰가 쌓여요</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. CHANNEL ANALYSIS
   ═══════════════════════════════════════════════════════════ */

function Channels() {
  const { comingSoon, blocked, pushToast } = useApp();
  const [period, setPeriod] = useState(0);
  const inbound = CHANNELS.filter((c) => c.type === "인바운드");
  const outbound = CHANNELS.filter((c) => c.type === "아웃바운드");
  const inboundTotal = inbound.reduce((a, b) => a + b.revenue, 0);
  const outboundTotal = outbound.reduce((a, b) => a + b.revenue, 0);
  const grand = inboundTotal + outboundTotal;

  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      {/* Notion page header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-[12px] text-[#787671] mb-3 -ml-1">
          <button onClick={() => comingSoon("아이콘 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]"><Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2} /> 아이콘 추가</button>
          <button onClick={() => comingSoon("댓글")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">댓글 추가</button>
        </div>
        <div className="flex items-start gap-3 mb-1">
          <div className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: N.mint }}>
            <Icon p="chartPie" className="w-7 h-7 text-[#1aae39]" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-[40px] font-semibold tracking-[-0.8px] leading-[1.1] text-[#1a1a1a]">채널 분석</h1>
            <p className="text-[14px] text-[#787671] leading-[1.5] mt-2">4개 수업 채널 · 자사 2 · 외부 연계 2 · 합산 ₩2.65억</p>
          </div>
        </div>

        {/* Property row */}
        <div className="space-y-1 mt-5 mb-1">
          {[
            { icon: "calendar", label: "기간", value: <span className="text-[#37352f] text-[13px]">2026년 5월 1일 → 5월 31일</span> },
            { icon: "template", label: "분류", value: <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded text-[11.5px] font-medium bg-[#e6e0f5] text-[#391c57]">자사 채널 2</span><span className="px-1.5 py-0.5 rounded text-[11.5px] font-medium bg-[#dcecfa] text-[#0075de]">외부 연계 2</span></span> },
            { icon: "chartBar", label: "벤치마크", value: <span className="text-[#787671] text-[13px]">평균 마진율 65% · 자사채널 88%</span> },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2 group/prop hover:bg-[#f0eeec] rounded px-2 py-1 -mx-2 transition">
              <span className="flex items-center gap-1.5 w-[140px] text-[#787671] flex-shrink-0">
                <Icon p={p.icon as keyof typeof ICON_PATHS} className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[13px]">{p.label}</span>
              </span>
              <span className="flex-1 min-w-0">{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#ede9e4] mt-5 mb-6" />

      {/* Database view tabs */}
      <div className="border-b border-[#ede9e4] mb-5 flex items-end justify-between">
        <div className="flex items-end gap-0.5">
          {([
            { k: "summary", label: "요약", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg> },
            { k: "table", label: "비교 테이블", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25M3.375 19.5a1.125 1.125 0 01-1.125-1.125M3.375 19.5v-13.5m18.375 13.5v-1.5c0-.621-.504-1.125-1.125-1.125m1.125 2.625H12m9.75 0V8.625M9 13.5v6m3-6v6m3-6v6"/></svg> },
            { k: "board", label: "보드", icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25"/></svg> },
          ]).map((v, i) => (
            <button
              key={v.k}
              onClick={() => i !== 0 && comingSoon(`${v.label} 보기`)}
              className={`relative px-2.5 py-2 text-[13.5px] flex items-center gap-1.5 transition ${i === 0 ? "text-[#1a1a1a] font-medium" : "text-[#787671] hover:text-[#37352f]"}`}
            >
              <span className={i === 0 ? "text-[#37352f]" : "text-[#a4a097]"}>{v.icon}</span>
              {v.label}
              {i === 0 && <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-[#37352f] rounded-full" />}
            </button>
          ))}
          <button onClick={() => comingSoon("새 보기")} className="px-2.5 py-2 text-[13px] text-[#a4a097] hover:text-[#5d5b54] flex items-center gap-1">
            <Icon p="plus" className="w-3 h-3" strokeWidth={2.2} />
            <span>새 보기</span>
          </button>
        </div>
        <div className="flex items-center gap-1 pb-1.5">
          <div className="inline-flex items-center gap-0.5 bg-white border border-[#e5e3df] rounded-md p-0.5">
            {["이번 달", "3개월", "12개월"].map((l, i) => (
              <button key={l} onClick={() => setPeriod(i)} className={`px-2.5 py-1 text-[12px] rounded transition ${i === period ? "bg-[#1a1a1a] text-white font-medium" : "text-[#5d5b54] hover:bg-[#f0eeec]"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Top split: inbound vs outbound */}
      <SectionHeader title="자사 vs 외부 채널 매출 분포" subtitle="자사 직접 68% · 외부 연계 32%" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
        {[
          { label: "자사 직접", value: inboundTotal, share: (inboundTotal / grand) * 100, count: inbound.length, color: N.primary, tint: N.lavender, desc: "자사 채널 · 평균 마진율 84%" },
          { label: "외부 연계", value: outboundTotal, share: (outboundTotal / grand) * 100, count: outbound.length, color: N.blue, tint: N.sky, desc: "외부 채널 · 평균 마진율 57%" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#e5e3df] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30 blur-3xl" style={{ background: s.color }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold" style={{ background: s.tint, color: s.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <div className="text-[24px] font-semibold tabular-nums" style={{ color: s.color }}>{s.share.toFixed(0)}%</div>
              </div>
              <div className="text-[36px] font-semibold tracking-tight text-[#1a1a1a] tabular-nums leading-none mb-2">
                ₩{(s.value / 100).toFixed(2)}억
              </div>
              <p className="text-[12px] text-[#5d5b54]">{s.desc}</p>
              <div className="h-2 bg-[#f6f5f4] rounded-full overflow-hidden mt-4">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.share}%`, background: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel cards */}
      <SectionHeader
        title="개별 채널"
        subtitle={`${CHANNELS.length}개 채널 · 매출 기준 정렬`}
        action={
          <div className="flex items-center gap-0.5 pb-1.5">
            <button onClick={() => comingSoon("정렬 기준")} className="px-2 py-1 text-[12.5px] text-[#5d5b54] hover:bg-[#f0eeec] rounded flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/></svg>
              매출순
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {CHANNELS.map((c) => (
          <article key={c.name} onClick={() => comingSoon(`${c.name} 채널 상세`)} className="bg-white border border-[#e5e3df] rounded-2xl overflow-hidden hover:border-[#c8c4be] hover:shadow-sm transition group cursor-pointer">
            <div className="px-5 pt-5 pb-4 relative" style={{ background: c.tint }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-[16px]" style={{ background: c.color }}>
                  {c.name[0]}
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.type === "인바운드" ? "bg-white text-[#5645d4]" : "bg-white text-[#0075de]"}`}>{c.type}</span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#1a1a1a]">{c.name}</h3>
              <div className="text-[20px] font-semibold tabular-nums text-[#1a1a1a] mt-2">₩{(c.revenue / 100).toFixed(1)}억</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[#37352f]">{c.share.toFixed(1)}% 비중</span>
                <Sparkline data={c.trend} color={c.color} w={60} h={18} />
              </div>
            </div>
            <div className="px-5 py-3 grid grid-cols-3 gap-3 border-t border-[#ede9e4]">
              <div>
                <div className="text-[9px] text-[#a4a097] uppercase tracking-wider mb-0.5">강사</div>
                <div className="text-[13px] font-semibold text-[#1a1a1a]">{c.instructors}명</div>
              </div>
              <div>
                <div className="text-[9px] text-[#a4a097] uppercase tracking-wider mb-0.5">강의</div>
                <div className="text-[13px] font-semibold text-[#1a1a1a]">{c.classes}건</div>
              </div>
              <div>
                <div className="text-[9px] text-[#a4a097] uppercase tracking-wider mb-0.5">마진율</div>
                <div className="text-[13px] font-semibold text-[#1a1a1a]">{c.margin}%</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Comparison table */}
      <SectionHeader title="채널 비교 테이블" subtitle="매출 · 마진 · 강의당 평균 단가" />
      <div className="bg-white border border-[#e5e3df] rounded-xl overflow-hidden mb-12">
        <div className="px-5 py-2.5 border-b border-[#ede9e4] flex items-center justify-between bg-[#fafaf9]">
          <div className="flex items-center gap-1 text-[12px] text-[#787671]">
            <Icon p="template" className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>채널 데이터베이스</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => blocked({ title: "파일 내보내기 기능\n전문가와 현장에서 직접 구현해볼 수 있어요", desc: "이 프로그램은 강의 이해를 돕기 위해 수강생의 실제 작품을 가볍게 재현한 예시예요. 강의에서는 어떤 기능이든 직접 설계하고 만들어보실 수 있어요.", flavor: "lock" })} className="text-[11px] text-[#5d5b54] hover:underline">CSV 내보내기</button>
            <button onClick={() => comingSoon("필터 추가")} className="text-[11px] text-[#0075de] hover:underline">필터 추가 +</button>
          </div>
        </div>
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafaf9] border-b border-[#ede9e4] text-[10px] text-[#5d5b54] uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-medium">채널</th>
              <th className="text-left px-5 py-3 font-medium">타입</th>
              <th className="text-right px-5 py-3 font-medium">매출</th>
              <th className="text-right px-5 py-3 font-medium">강사</th>
              <th className="text-right px-5 py-3 font-medium">강의</th>
              <th className="text-right px-5 py-3 font-medium">평균 단가</th>
              <th className="text-right px-5 py-3 font-medium">마진율</th>
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((c) => (
              <tr key={c.name} className="border-t border-[#ede9e4] hover:bg-[#fafaf9] transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-[11px]" style={{ background: c.color }}>{c.name[0]}</div>
                    <span className="font-medium text-[#1a1a1a]">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.type === "인바운드" ? "bg-[#e6e0f5] text-[#5645d4]" : "bg-[#dcecfa] text-[#0075de]"}`}>{c.type}</span>
                </td>
                <td className="px-5 py-3 text-right font-semibold text-[#1a1a1a] tabular-nums">₩{(c.revenue / 100).toFixed(1)}억</td>
                <td className="px-5 py-3 text-right text-[#37352f] tabular-nums">{c.instructors}명</td>
                <td className="px-5 py-3 text-right text-[#37352f] tabular-nums">{c.classes}건</td>
                <td className="px-5 py-3 text-right text-[#37352f] tabular-nums">₩{Math.round((c.revenue / c.classes) * 100).toLocaleString()}만</td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-2 justify-end">
                    <div className="w-16 h-1.5 bg-[#f6f5f4] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.margin}%`, background: c.color }} />
                    </div>
                    <span className="font-semibold text-[#1a1a1a] tabular-nums">{c.margin}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. 추가 페이지 — 강의 일정 · 정산 관리 · 리뷰 모니터링
   ═══════════════════════════════════════════════════════════ */

// 공통 노션 페이지 헤더
function PageHead({ icon, tint, color, title, subtitle }: { icon: keyof typeof ICON_PATHS; tint: string; color: string; title: string; subtitle: string }) {
  const { comingSoon } = useApp();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-[12px] text-[#787671] mb-3 -ml-1">
        <button onClick={() => comingSoon("아이콘 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]"><Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2} /> 아이콘 추가</button>
        <button onClick={() => comingSoon("커버 추가")} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#f0eeec]">커버 추가</button>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: tint }}>
          <span style={{ color }}><Icon p={icon} className="w-7 h-7" strokeWidth={1.6} /></span>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-[40px] font-semibold tracking-[-0.8px] leading-[1.1] text-[#1a1a1a]">{title}</h1>
          <p className="text-[14px] text-[#787671] leading-[1.5] mt-2">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

const REVIEW_POOL = [
  "실무에서 바로 적용할 수 있는 내용이 가득해요.",
  "설명이 너무 명확하고 친절해요. 다음 강의도 신청합니다.",
  "예시가 풍부해서 이해가 쏙쏙 됐어요.",
  "전반적으로 좋았는데 후반부가 조금 빠르게 진행됐어요.",
  "현업 경험이 묻어나는 강의라 신뢰가 가요.",
  "질문에 항상 정성껏 답해주셔서 감사했어요.",
  "커리큘럼 구성이 탄탄하고 군더더기가 없어요.",
];
const REVIEW_USERS = ["김O지", "박O진", "이O호", "최O연", "정O우", "한O민", "조O아"];

// 수업 형태 배지 — 온라인(업로드)/현장/외부 출강
function ClassModeBadge({ channel, size = "sm" }: { channel: string; size?: "sm" | "md" }) {
  const online = channel.includes("온라인");
  const offline = channel.includes("현장");
  const conf = online
    ? { label: "온라인 · 업로드 예정", bg: "#dcecfa", c: "#0075de", d: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" }
    : offline
    ? { label: "현장 강의", bg: "#ffe8d4", c: "#dd5b00", d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" }
    : { label: "외부 출강", bg: "#d9f3e1", c: "#1aae39", d: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" };
  const px = size === "md" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[9px]";
  const ic = size === "md" ? "w-3 h-3" : "w-2.5 h-2.5";
  return (
    <span className={`inline-flex items-center gap-1 rounded font-semibold ${px}`} style={{ background: conf.bg, color: conf.c }}>
      <svg className={ic} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={conf.d} /></svg>
      {conf.label}
    </span>
  );
}

/* ── 강의 일정 ── */
function SchedulePage() {
  const { comingSoon, openModal } = useApp();
  const total = WEEK_SCHEDULE.reduce((a, d) => a + d.classes.length, 0);
  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      <PageHead icon="calendar" tint={N.peach} color={N.orange} title="강의 일정" subtitle={`이번 주 · 총 ${total}건의 강의`} />
      <div className="border-t border-[#ede9e4] mb-5" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <button onClick={() => comingSoon("지난 주")} className="w-7 h-7 rounded-md border border-[#e5e3df] hover:bg-[#f6f5f4] flex items-center justify-center text-[#5d5b54]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <span className="text-[14px] font-semibold text-[#1a1a1a] px-2 tabular-nums">5월 27일 – 6월 2일</span>
          <button onClick={() => comingSoon("다음 주")} className="w-7 h-7 rounded-md border border-[#e5e3df] hover:bg-[#f6f5f4] flex items-center justify-center text-[#5d5b54]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
          <button onClick={() => comingSoon("오늘")} className="ml-1 px-2.5 py-1.5 text-[12px] font-medium border border-[#e5e3df] rounded-md text-[#37352f] hover:bg-[#f6f5f4]">오늘</button>
        </div>
        <button onClick={() => openModal({ kind: "assign-class" })} className="px-3 py-1.5 text-[12.5px] font-medium bg-[#5645d4] text-white rounded-md hover:bg-[#4534b3] transition flex items-center gap-1.5">
          <Icon p="plus" className="w-3.5 h-3.5" strokeWidth={2.2} />강의 배정
        </button>
      </div>

      {/* 주간 컬럼 그리드 */}
      <div className="grid grid-cols-5 gap-2.5">
        {WEEK_SCHEDULE.map((day) => {
          const isToday = day.day.startsWith("목");
          return (
            <div key={day.day} className={`rounded-xl border ${isToday ? "border-[#5645d4]/40 bg-[#5645d4]/[0.03]" : "border-[#e5e3df] bg-white"} overflow-hidden`}>
              <div className={`px-3 py-2.5 border-b ${isToday ? "border-[#5645d4]/20" : "border-[#ede9e4]"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[12.5px] font-semibold ${isToday ? "text-[#5645d4]" : "text-[#1a1a1a]"}`}>{day.day}</span>
                  {isToday && <span className="text-[9px] font-bold text-white bg-[#5645d4] px-1.5 py-0.5 rounded">오늘</span>}
                </div>
                <div className="text-[10px] text-[#a4a097] mt-0.5">{day.classes.length}개 강의</div>
              </div>
              <div className="p-2 space-y-2 min-h-[180px]">
                {day.classes.map((c, i) => {
                  const m = CAT_COLOR[c.cat];
                  return (
                    <button key={i} onClick={() => comingSoon("강의 상세보기")} className="w-full text-left rounded-lg p-2.5 transition hover:shadow-sm" style={{ background: m.bg }}>
                      <div className="text-[10px] font-mono font-semibold mb-1" style={{ color: m.text }}>{c.time}</div>
                      <div className="text-[12px] font-semibold text-[#1a1a1a] leading-snug mb-1">{c.title}</div>
                      <div className="text-[10px] text-[#5d5b54] mb-1.5">{c.inst}</div>
                      <ClassModeBadge channel={c.channel} />
                    </button>
                  );
                })}
                {day.classes.length === 0 && <div className="text-[11px] text-[#bbb8b1] text-center py-6">강의 없음</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 정산 관리 ── */
function SettlementPage({ goToDetail }: { goToDetail: (id?: string) => void }) {
  const { instructors, blocked, comingSoon } = useApp();
  const rows = instructors
    .filter((i) => i.revenue > 0)
    .map((i) => ({ i, gross: i.revenue, fee: Math.round(i.revenue * 0.1), net: i.revenue - Math.round(i.revenue * 0.1) }))
    .sort((a, b) => b.gross - a.gross);
  const tG = rows.reduce((a, r) => a + r.gross, 0);
  const tF = rows.reduce((a, r) => a + r.fee, 0);
  const tN = tG - tF;
  const won = (v: number) => `₩${v.toLocaleString()}만`;

  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      <PageHead icon="banknote" tint={N.yellow} color="#9a7b2b" title="정산 관리" subtitle={`5월 정산 · 대상 강사 ${rows.length}명`} />
      <div className="border-t border-[#ede9e4] mb-6" />

      {/* 정산 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { l: "총 매출", v: won(tG), tint: N.lavender, c: N.primary },
          { l: "플랫폼 수수료 (10%)", v: won(tF), tint: N.peach, c: N.orange },
          { l: "정산 예정액", v: won(tN), tint: N.mint, c: N.green },
          { l: "정산 예정일", v: "6월 10일", tint: N.sky, c: N.blue },
        ].map((k) => (
          <div key={k.l} className="bg-white border border-[#e5e3df] rounded-xl p-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md mb-2" style={{ background: k.tint }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: k.c }} />
              <span className="text-[10px] font-medium" style={{ color: k.c }}>{k.l}</span>
            </div>
            <div className="text-[24px] font-semibold tracking-tight text-[#1a1a1a] tabular-nums leading-none">{k.v}</div>
          </div>
        ))}
      </div>

      {/* 정산 callout */}
      <div className="mb-6 flex items-start gap-3 p-3.5 rounded-md bg-[#dcecfa] border border-[#0075de]/15">
        <svg className="w-5 h-5 text-[#0075de] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
        <div className="text-[13px] text-[#1a1a1a] leading-relaxed">매월 <span className="font-semibold">10일</span>에 전월 정산이 자동 집계돼요. 정산 확정 후에는 등록된 계좌로 영업일 기준 3일 내 입금됩니다.</div>
      </div>

      <SectionHeader
        title="강사별 정산 내역"
        subtitle="5월 · 매출 기준 정렬"
        action={<button onClick={() => blocked({ title: "정산 명세서 다운로드 기능\n전문가와 현장에서 직접 구현해볼 수 있어요", desc: "이 프로그램은 강의 이해를 돕기 위해 수강생의 실제 작품을 가볍게 재현한 예시예요. 강의에서는 어떤 기능이든 직접 설계하고 만들어보실 수 있어요.", flavor: "lock" })} className="text-[12px] text-[#0075de] hover:underline">명세서 내보내기</button>}
      />
      <div className="bg-white border border-[#e5e3df] rounded-xl overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[11px] text-[#787671]">
            <tr>
              <th className="text-left px-5 py-2.5 font-medium whitespace-nowrap">강사</th>
              <th className="text-left px-5 py-2.5 font-medium whitespace-nowrap">카테고리</th>
              <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">매출</th>
              <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">수수료</th>
              <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">정산액</th>
              <th className="text-left px-5 py-2.5 font-medium whitespace-nowrap">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ i, gross, fee, net }) => {
              const m = CAT_COLOR[i.category];
              return (
                <tr key={i.id} onClick={() => goToDetail(i.id)} className="border-t border-[#ede9e4] hover:bg-[#fafaf9] transition cursor-pointer group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: m.bg, color: m.text }}>{i.name[0]}</span>
                      <span className="font-medium text-[#1a1a1a] group-hover:underline">{i.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><CategoryBadge cat={i.category} /></td>
                  <td className="px-5 py-3 text-right tabular-nums text-[#37352f] whitespace-nowrap">{won(gross)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-[#787671] whitespace-nowrap">{won(fee)}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#1a1a1a] whitespace-nowrap">{won(net)}</td>
                  <td className="px-5 py-3 whitespace-nowrap"><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#fef7d6] text-[#9a7b2b]"><span className="w-1.5 h-1.5 rounded-full bg-[#e6c95c]" />정산 예정</span></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#e5e3df] bg-[#fafaf9]">
              <td className="px-5 py-3 font-semibold text-[#1a1a1a]" colSpan={2}>합계</td>
              <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#1a1a1a]">{won(tG)}</td>
              <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#787671]">{won(tF)}</td>
              <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#5645d4]">{won(tN)}</td>
              <td className="px-5 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ── 리뷰 모니터링 ── */
function ReviewsPage({ goToDetail }: { goToDetail: (id?: string) => void }) {
  const { comingSoon } = useApp();
  const { instructors } = useApp();
  const active = instructors.filter((i) => i.status === "active");
  const reviews = active.flatMap((inst, idx) => {
    const seed = inst.id.split("").reduce((a, c) => a + c.charCodeAt(0), 11);
    const rnd = (n: number) => { const x = Math.sin(seed * 41.7 + n * 13.3) * 43758.5453; return x - Math.floor(x); };
    return Array.from({ length: 2 }, (_, k) => ({
      inst,
      rating: inst.nps >= 4.7 ? (rnd(k) > 0.2 ? 5 : 4) : rnd(k) > 0.55 ? 5 : 4,
      text: REVIEW_POOL[Math.floor(rnd(k + 1) * REVIEW_POOL.length)],
      user: REVIEW_USERS[Math.floor(rnd(k + 2) * REVIEW_USERS.length)],
      date: `5/${28 - ((idx * 2 + k) % 21)}`,
    }));
  });
  const npsVals = instructors.filter((i) => i.nps > 0);
  const avgNps = (npsVals.reduce((a, i) => a + i.nps, 0) / (npsVals.length || 1)).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const maxN = Math.max(...dist.map((d) => d.n), 1);

  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      <PageHead icon="star" tint={N.cream} color={N.brown} title="리뷰 모니터링" subtitle={`평균 NPS ${avgNps} · 최근 리뷰 ${reviews.length}건`} />
      <div className="border-t border-[#ede9e4] mb-6" />

      {/* 요약 */}
      <div className="grid grid-cols-12 gap-3 mb-6">
        <div className="col-span-12 md:col-span-4 bg-white border border-[#e5e3df] rounded-xl p-5 flex flex-col items-center justify-center">
          <div className="text-[44px] font-semibold tracking-tight text-[#1a1a1a] leading-none tabular-nums">{avgNps}</div>
          <div className="flex text-[#f5d75e] mt-2">
            {[1, 2, 3, 4, 5].map((s) => <svg key={s} className="w-4 h-4" fill={s <= Math.round(Number(avgNps)) ? "currentColor" : "#ede9e4"} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
          </div>
          <div className="text-[11px] text-[#a4a097] mt-2">5점 만점 · 응답 1,240건</div>
        </div>
        <div className="col-span-12 md:col-span-8 bg-white border border-[#e5e3df] rounded-xl p-5">
          <div className="text-[13px] font-semibold text-[#1a1a1a] mb-3">평점 분포</div>
          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#787671] w-6 tabular-nums flex items-center gap-0.5">{d.star}<svg className="w-2.5 h-2.5 text-[#f5d75e]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></span>
                <div className="flex-1 h-2 bg-[#f6f5f4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#f5d75e]" style={{ width: `${(d.n / maxN) * 100}%` }} />
                </div>
                <span className="text-[11px] text-[#a4a097] w-6 text-right tabular-nums">{d.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionHeader title="최근 리뷰" subtitle={`${reviews.length}건 · 강사 클릭 시 상세로 이동`} action={<button onClick={() => comingSoon("리뷰 필터")} className="text-[12px] text-[#0075de] hover:underline">필터 ▾</button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reviews.map((r, i) => {
          const m = CAT_COLOR[r.inst.category];
          return (
            <div key={i} className="bg-white border border-[#e5e3df] rounded-xl p-4 hover:border-[#c8c4be] transition">
              <div className="flex items-center justify-between mb-2.5">
                <button onClick={() => goToDetail(r.inst.id)} className="flex items-center gap-2 group">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-semibold" style={{ background: m.bg, color: m.text }}>{r.inst.name[0]}</span>
                  <div className="text-left">
                    <div className="text-[12.5px] font-semibold text-[#1a1a1a] group-hover:underline">{r.inst.name}</div>
                    <div className="text-[10px] text-[#a4a097]">{r.inst.category}</div>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <div className="flex text-[#f5d75e]">
                    {[1, 2, 3, 4, 5].map((s) => <svg key={s} className="w-3 h-3" fill={s <= r.rating ? "currentColor" : "#ede9e4"} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                </div>
              </div>
              <p className="text-[12.5px] text-[#37352f] leading-relaxed">"{r.text}"</p>
              <div className="text-[10px] text-[#a4a097] mt-2">{r.user} · {r.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 심사 중인 강사 ── */
const SCREEN_STAGES = [
  { key: "서류 검토", color: N.blue, tint: N.sky },
  { key: "시범 강의", color: N.orange, tint: N.peach },
  { key: "최종 승인 대기", color: N.green, tint: N.mint },
];
function ScreeningPage({ goToDetail }: { goToDetail: (id?: string) => void }) {
  const { instructors, pushToast, comingSoon } = useApp();
  const applicants = instructors
    .filter((i) => i.status === "screening")
    .map((i, idx) => {
      const seed = i.id.charCodeAt(1) + idx * 3;
      return { i, stage: SCREEN_STAGES[seed % 3], applied: `2026. 05. ${String(8 + ((seed * 7) % 20)).padStart(2, "0")}` };
    });
  const stageCount = (k: string) => applicants.filter((a) => a.stage.key === k).length;

  return (
    <div className="px-12 py-8 max-w-[1180px] mx-auto">
      <PageHead icon="clipboardCheck" tint={N.peach} color={N.orange} title="심사 중인 강사" subtitle={`지원 ${applicants.length}명 · 심사 진행 중`} />
      <div className="border-t border-[#ede9e4] mb-6" />

      {/* 단계별 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SCREEN_STAGES.map((s, i) => (
          <div key={s.key} className="bg-white border border-[#e5e3df] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: s.tint, color: s.color }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: s.color }}>{i + 1}</span>
                {s.key}
              </span>
            </div>
            <div className="text-[26px] font-semibold tabular-nums text-[#1a1a1a] leading-none">{stageCount(s.key)}<span className="text-[13px] text-[#a4a097] font-normal ml-1">명</span></div>
          </div>
        ))}
      </div>

      {/* Notion callout */}
      <div className="mb-6 flex items-start gap-3 p-3.5 rounded-md bg-[#fef7d6] border border-[#f9e79f]/40">
        <svg className="w-5 h-5 text-[#dd5b00] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
        <div className="text-[13px] text-[#523410] leading-relaxed">서류 검토 → 시범 강의 → 최종 승인 3단계로 진행돼요. 승인된 강사는 온보딩을 거쳐 강의를 시작합니다.</div>
      </div>

      <SectionHeader title="지원자 목록" subtitle={`${applicants.length}명 · 지원 최신순`} action={<button onClick={() => comingSoon("심사 기준 설정")} className="text-[12px] text-[#0075de] hover:underline">심사 기준 ▾</button>} />
      <div className="space-y-2.5">
        {applicants.map(({ i, stage, applied }) => {
          const m = CAT_COLOR[i.category];
          return (
            <div key={i.id} className="bg-white border border-[#e5e3df] rounded-xl p-4 flex items-center gap-4 hover:border-[#c8c4be] transition">
              <button onClick={() => goToDetail(i.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left group">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center text-[16px] font-semibold flex-shrink-0 ring-2 ring-white shadow-sm" style={{ background: m.solid, color: "#fff" }}>{i.name[0]}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#1a1a1a] group-hover:underline">{i.name}</span>
                    <TierBadge tier={i.tier} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[12px]">
                    <span style={{ color: m.text }} className="font-medium">{i.category}</span>
                    <span className="text-[#bbb8b1]">·</span>
                    <span className="text-[#787671] inline-flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#a4a097]" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                      {i.affiliation ?? "프리랜서"}
                    </span>
                  </div>
                </div>
              </button>

              <div className="hidden md:block text-right flex-shrink-0">
                <div className="text-[10px] text-[#a4a097] uppercase tracking-wider mb-0.5">지원일</div>
                <div className="text-[12px] text-[#37352f] tabular-nums">{applied}</div>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium" style={{ background: stage.tint, color: stage.color }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: stage.color }} />
                  {stage.key}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => comingSoon("지원서 상세")} className="px-2.5 py-1.5 text-[12px] font-medium border border-[#c8c4be] rounded-md text-[#37352f] hover:bg-[#f6f5f4] transition">지원서</button>
                <button onClick={() => pushToast({ variant: "success", title: `${i.name}님을 승인했어요`, desc: "온보딩 단계로 이동합니다. (데모)" })} className="px-2.5 py-1.5 text-[12px] font-medium bg-[#5645d4] text-white rounded-md hover:bg-[#4534b3] transition">승인</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 받은편지함 (알림 피드) ── */
const NOTIF_CONF: Record<NotifType, { tint: string; color: string; icon: keyof typeof ICON_PATHS; label: string }> = {
  class: { tint: N.mint, color: N.green, icon: "calendar", label: "수업 완료" },
  settlement: { tint: N.yellow, color: "#9a7b2b", icon: "banknote", label: "정산" },
  application: { tint: N.lavender, color: N.primary, icon: "users", label: "지원 접수" },
  screening: { tint: N.peach, color: N.orange, icon: "clipboardCheck", label: "심사" },
  review: { tint: N.cream, color: N.brown, icon: "star", label: "리뷰" },
  student: { tint: N.sky, color: N.blue, icon: "chartBar", label: "수강생" },
};
function InboxPage({ goToDetail }: { goToDetail: (id?: string) => void }) {
  const { comingSoon, pushToast } = useApp();
  const [filter, setFilter] = useState<"all" | NotifType>("all");
  const [readAll, setReadAll] = useState(false);
  const items = filter === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.type === filter);
  const unreadCount = readAll ? 0 : NOTIFICATIONS.filter((n) => n.unread).length;

  const filters: { k: "all" | NotifType; label: string }[] = [
    { k: "all", label: "전체" },
    { k: "class", label: "수업 완료" },
    { k: "settlement", label: "정산" },
    { k: "application", label: "지원 접수" },
    { k: "screening", label: "심사" },
    { k: "review", label: "리뷰" },
  ];

  return (
    <div className="px-12 py-8 max-w-[920px] mx-auto">
      <PageHead icon="inbox" tint={N.lavender} color={N.primary} title="받은편지함" subtitle={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 확인했어요"} />
      <div className="border-t border-[#ede9e4] mb-4" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {filters.map((f) => {
            const active = filter === f.k;
            const n = f.k === "all" ? NOTIFICATIONS.length : NOTIFICATIONS.filter((x) => x.type === f.k).length;
            return (
              <button key={f.k} onClick={() => setFilter(f.k)} className={`px-2.5 py-1 text-[12px] rounded-md transition flex items-center gap-1.5 border ${active ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#37352f] border-[#e5e3df] hover:bg-[#f6f5f4]"}`}>
                {f.label}
                <span className={`text-[10px] tabular-nums ${active ? "text-white/60" : "text-[#a4a097]"}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => { setReadAll(true); pushToast({ variant: "success", title: "모든 알림을 읽음 처리했어요" }); }} className="text-[12px] text-[#0075de] hover:underline flex-shrink-0">모두 읽음</button>
      </div>

      <div className="bg-white border border-[#e5e3df] rounded-xl overflow-hidden">
        {items.map((n, i) => {
          const c = NOTIF_CONF[n.type];
          const unread = n.unread && !readAll;
          return (
            <button
              key={i}
              onClick={() => (n.instId ? goToDetail(n.instId) : comingSoon("알림 상세"))}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition border-b border-[#ede9e4] last:border-b-0 ${unread ? "bg-[#5645d4]/[0.035] hover:bg-[#5645d4]/[0.07]" : "hover:bg-[#fafaf9]"}`}
            >
              <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: c.tint, color: c.color }}>
                <Icon p={c.icon} className="w-[18px] h-[18px]" strokeWidth={1.7} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {unread && <span className="w-1.5 h-1.5 rounded-full bg-[#5645d4] flex-shrink-0" />}
                  <span className={`text-[13.5px] ${unread ? "font-semibold text-[#1a1a1a]" : "font-medium text-[#37352f]"} leading-snug`}>{n.title}</span>
                </div>
                <div className="text-[12px] text-[#787671] mt-0.5 leading-snug">{n.desc}</div>
              </div>
              <span className="text-[11px] text-[#a4a097] flex-shrink-0 mt-0.5 tabular-nums">{n.time}</span>
            </button>
          );
        })}
        {items.length === 0 && <div className="py-12 text-center text-[12.5px] text-[#a4a097]">해당하는 알림이 없어요</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

const WORKSPACE_CRUMB = { tint: N.surface, color: N.charcoal, icon: "template" as const, label: "강사관리 프로그램" };
type Crumb = { tint: string; color: string; icon: keyof typeof ICON_PATHS; label: string };

export default function Lab5() {
  return (
    <AppProvider>
      <Lab5Inner />
    </AppProvider>
  );
}

function Lab5Inner() {
  const { instructors } = useApp();
  // 뷰 전환 히스토리 스택 — 뒤로/앞으로 가기 지원
  const [history, setHistory] = useState<{ view: View; id: string }[]>([{ view: "dashboard", id: "i2" }]);
  const [ptr, setPtr] = useState(0);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view") as View | null;
    if (v && ["dashboard", "instructors", "detail", "channels", "schedule", "settlement", "reviews", "screening", "inbox"].includes(v)) setHistory([{ view: v, id: "i2" }]);
  }, []);

  const cur = history[ptr];
  const view = cur.view;
  const selected = instructors.find((i) => i.id === cur.id) ?? instructors[0];
  const navigate = (v: View, id?: string) => {
    setHistory((h) => [...h.slice(0, ptr + 1), { view: v, id: id ?? cur.id }]);
    setPtr((p) => p + 1);
  };
  const setView = (v: View) => navigate(v);
  const goToDetail = (id?: string) => navigate("detail", id);
  const goBack = () => setPtr((p) => Math.max(0, p - 1));
  const goForward = () => setPtr((p) => Math.min(history.length - 1, p + 1));

  const CRUMB_MAP: Record<Exclude<View, "detail">, Crumb> = {
    dashboard: { tint: N.sky, color: N.blue, icon: "chartBar", label: "대시보드" },
    instructors: { tint: N.lavender, color: N.primary, icon: "users", label: "강사" },
    screening: { tint: N.peach, color: N.orange, icon: "clipboardCheck", label: "심사 중인 강사" },
    channels: { tint: N.mint, color: N.green, icon: "chartPie", label: "채널 분석" },
    schedule: { tint: N.peach, color: N.orange, icon: "calendar", label: "강의 일정" },
    settlement: { tint: N.yellow, color: "#9a7b2b", icon: "banknote", label: "정산 관리" },
    reviews: { tint: N.cream, color: N.brown, icon: "star", label: "리뷰 모니터링" },
    inbox: { tint: N.lavender, color: N.primary, icon: "inbox", label: "받은편지함" },
  };
  const breadcrumb: Crumb[] =
    view === "detail"
      ? [WORKSPACE_CRUMB, { tint: N.lavender, color: N.primary, icon: "users", label: "강사" }, { tint: CAT_COLOR[selected.category].bg, color: CAT_COLOR[selected.category].text, icon: "user", label: selected.name }]
      : [WORKSPACE_CRUMB, CRUMB_MAP[view]];

  return (
    <div className="overflow-x-auto min-h-screen">
    <div className="h-screen flex flex-col bg-[#fafaf9] text-[#1a1a1a] overflow-hidden min-w-[1080px]" style={{ fontFamily: FONT }}>
      {/* 예시 프로그램 안내 띠배너 */}
      <div className="flex-shrink-0 bg-[#FC5D11] text-white px-4 py-1.5 flex items-center justify-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 text-[10.5px] font-semibold tracking-wide">예시</span>
        <span className="text-white/90">수강생의 실제 작품을 가볍게 재현한 예시 프로그램입니다. 강의에서는 내게 필요한 프로그램을 직접 설계하고 만들어보실 수 있어요.</span>
        <a href="https://event.rememberapp.co.kr/academy/2days_claude" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 ml-2 px-3 py-1 rounded bg-white text-[#FC5D11] text-[11.5px] font-semibold hover:bg-white/90 transition whitespace-nowrap">강의 보러 가기 →</a>
      </div>
      <div className="flex flex-1 overflow-hidden">
      <Sidebar view={view} setView={setView} goToDetail={goToDetail} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar view={view} breadcrumb={breadcrumb} goBack={goBack} goForward={goForward} canBack={ptr > 0} canForward={ptr < history.length - 1} />
        <main className="flex-1 overflow-hidden">
          {view === "dashboard" && <div className="h-full overflow-y-auto"><Dashboard goToDetail={goToDetail} /></div>}
          {view === "instructors" && <div className="h-full overflow-y-auto"><Instructors goToDetail={goToDetail} /></div>}
          {view === "detail" && <InstructorDetail inst={selected} back={() => setView("instructors")} />}
          {view === "channels" && <div className="h-full overflow-y-auto"><Channels /></div>}
          {view === "schedule" && <div className="h-full overflow-y-auto"><SchedulePage /></div>}
          {view === "settlement" && <div className="h-full overflow-y-auto"><SettlementPage goToDetail={goToDetail} /></div>}
          {view === "reviews" && <div className="h-full overflow-y-auto"><ReviewsPage goToDetail={goToDetail} /></div>}
          {view === "screening" && <div className="h-full overflow-y-auto"><ScreeningPage goToDetail={goToDetail} /></div>}
          {view === "inbox" && <div className="h-full overflow-y-auto"><InboxPage goToDetail={goToDetail} /></div>}
        </main>
      </div>
      </div>
    </div>
    </div>
  );
}
