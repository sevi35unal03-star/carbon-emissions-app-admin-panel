// API Response
export interface ApiResponse<T> {
  isSuccessful: boolean;
  data: T;
  errors: string[] | null;
}

export interface PagedResponse<T> {
  isSuccessful: boolean;
  data: T;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Users ───────────────────────────────────────────
export interface UserDetailed {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  identityNumber: string;
  totalPoints: number;
  donatedTreeCount: number;
  lastLoginDate: string | null;
  isDeleted: boolean;
}

// ─── Activity Questions ───────────────────────────────
export interface ActivityOptionResponse {
  id: string;
  text: string;
  carbonValue: number;
  nextQuestionId: string | null;
}

export interface ActivityQuestionResponse {
  id: string;
  text: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  scheduledTime: string; // TimeSpan string olarak gelir: "09:00:00"
  options: ActivityOptionResponse[];
}

// ─── Assets ──────────────────────────────────────────
export interface AssetsResponse {
  homeBackground: string | null;
  homeHero: string | null;
  homeTreeIcon: string | null;
  carbonCalculate: string | null;
  appLogo: string | null;
  leaderboard: string | null;
}

// ─── Definitions ─────────────────────────────────────
export interface TreeDefinitionResponse {
  pointUnit: number;
  treeCount: number;
  globalTargetTreeCount: number;
}

export interface ScoringSettingResponse {
  id: string;
  key: string;
  value: number;
  category: string;
}

// ─── Goals ───────────────────────────────────────────
export interface GlobalGoalResponse {
  id: string;
  month: number;
  year: number;
  targetTreeCount: number;
}

// ─── Polls ───────────────────────────────────────────
export interface PollOptionResponse {
  id: string;
  text: string;
  carbonValue: number;
  displayOrder: number;
}

export interface PollQuestionResponse {
  id: string;
  text: string;
  displayOrder: number;
  options: PollOptionResponse[];
}

export interface PollSummaryResponse {
  id: string;
  name: string;
  month: number;
  year: number;
  isActive: boolean;
  questionCount: number;
}

export interface PollDetailResponse {
  id: string;
  name: string;
  month: number;
  year: number;
  isActive: boolean;
  questions: PollQuestionResponse[];
}

export interface PollResult {
  userName: string;
  totalScore: number;
  treeCount: number;
  answers: PollAnswerDetail[];
}

export interface PollAnswerDetail {
  questionText: string;
  selectedOptionText: string;
  carbonValue: number;
}

// ─── Useful Information ───────────────────────────────
export interface UsefulInformationResponse {
  id: string;
  title: string;
  content: string;
  displayOrder: number;
}

// ─── Audit Logs ───────────────────────────────────────
export interface AuditLogResponse {
  userName: string;
  operation: string;
  tableName: string;
  createdAt: string;
  details: string;
}

// ─── User Results ─────────────────────────────────────
export interface UserDailyResult {
  id: string;
  lastLoginDate: string | null;
  carbonFootprintScore: number;
  dailyActivitiesCount: number;
  totalCurrentScore: number;
  donatedTreeCount: number;
  equivalentPoints: number;
}

export interface HomeData {
  hasCompletedPoll: boolean;
  globalTarget: GlobalTarget | null;
  monthlyTarget: MonthlyTarget | null;
  topLeaders: LeaderItem[] | null;
  currentUserRank: UserRank | null;
}

export interface GlobalTarget {
  targetTreeCount: number;
  donatedTreeCount: number;
  remainingTreeCount: number;
  progressPercent: number;
}

export interface MonthlyTarget {
  month: number;
  year: number;
  targetTreeCount: number;
  donatedTreeCount: number;
  remainingTreeCount: number;
  progressPercent: number;
}

export interface LeaderItem {
  rank: number;
  fullName: string;
  treeCount: number;
  isCurrentUser: boolean;
}

export interface UserRank {
  rank: number;
  treeCount: number;
  message: string;
}

// ─── Form Types ───────────────────────────────────────
export interface CreateActivityQuestionForm {
  text: string;
  displayOrder: number;
  startDate: { toISOString: () => string };
  endDate: { toISOString: () => string };
  scheduledTime: string;
  options: { text: string; carbonValue: number }[];
}

export interface CreatePollForm {
  name: string;
  description: string;
  month: number;
  year: number;
  displayOrder: number;
}

export interface CreateGoalForm {
  month: number;
  year: number;
  targetTreeCount: number;
}

export interface CreateUsefulInformationForm {
  title: string;
  content: string;
  displayOrder: number;
}