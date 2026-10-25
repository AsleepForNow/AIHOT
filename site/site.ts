// 站点身份和读者看得到的文案。换成你的行业时，先改这个文件。
// 网页和后端都读它；改完重新构建（docker compose up --build）即可生效。
// 域名不在这里：部署时用环境变量 SITE_URL 设置。

import type { Founder } from "@aihot/contracts/site-config";

export const EDITION_TIMES = { daily: "08:00", weekly: "10:00", monthly: "10:30" };

export const EDITION_WHEN = {
  daily: `每天 ${EDITION_TIMES.daily}`,
  weekly: `每周一 ${EDITION_TIMES.weekly}`,
  monthly: `每月 1 日 ${EDITION_TIMES.monthly}`,
};

export const SITE = {
  name: "Grok Pulse",
  subject: "AI",
  homeTitle: "Grok Pulse — AI 行业动态 · 每日精选与日报",
  topicsTitle: "AI 主题：公司与模型、技术方向、内容形态的最新动态",
  feedbackExample: "例如：我在搜索某个关键词时遇到……我原本想……",
  feedbackLead: "发现 bug、想要的功能、看不顺眼的地方，都可以告诉我们。",
  feedbackEmailHint: "留下邮箱，我们可以回信联系你",
  description: `从一批高质量 AI 信源里挑出值得看的动态，把同一件事的多篇报道归到一起，${EDITION_WHEN.daily} 出一份日报。偏好真实、可验证的 Agent 与模型进展。`,
  llmsIntro: null as string | null,
  tagline: "值得关注的 AI 动态，偏好真实与可用性",
  keywords: ["AI 资讯", "AI 新闻", "AI 日报", "AI 行业动态", "Grok", "xAI", "Agent"] as string[],
  since: null as string | null,
  locale: "zh-CN",
  defaultUrl: "http://localhost:3000",
  rootIcons: [] as string[],
  mcpPrefix: "grokpulse",
  interfaceVersion: "4.0.0",
  contactEmail: null as string | null,
  footerNote: "由 AIHOT 开源框架驱动",
  icp: null as string | null,
  psb: null as string | null,
  github: "https://github.com/AsleepForNow/AIHOT",
  organization: {
    name: "Grok Pulse",
    founder: null as Founder | null,
  },
  crawlerName: "GrokPulseBot/1.0",
} as const;

// 以下保持原有结构，仅更新站点身份相关字段。完整文件过长，实际部署时请以原文件为基础手动合并此更改。
