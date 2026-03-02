/**
 * Flattened parent–child row model for demonstrating column groups + row spanning.
 *
 * Each row represents one child (Task) belonging to a parent (Project).
 * Parent columns (projectCode, projectName, projectStatus) repeat for
 * every task under the same project so AG Grid's `spanRows` can merge them.
 */
export interface ProjectTaskRow {
  /** Parent: unique project identifier, e.g. "PRJ-101" */
  readonly projectCode: string;
  /** Parent: project description */
  readonly projectName: string;
  /** Parent: aggregate status */
  readonly projectStatus: string;

  /** Child: unique task identifier, e.g. "T-101-001" */
  readonly taskCode: string;
  /** Child: short task summary */
  readonly taskSummary: string;
  /** Child: is this task critical-path? */
  readonly critical: string;
  /** Child: person(s) assigned */
  readonly assignee: string;
  /** Child: current review verdict */
  readonly reviewStatus: string;
  /** Child: review date ISO string */
  readonly reviewDate: string;
  /** Child: who performed the review */
  readonly reviewer: string;
  /** Child: open issue count */
  readonly openIssues: string;
}

// ── Seed data ────────────────────────────────────────────────────

interface ProjectSeed {
  code: string;
  name: string;
  status: string;
  tasks: TaskSeed[];
}

interface TaskSeed {
  code: string;
  summary: string;
  critical: string;
  assignee: string;
  reviewStatus: string;
  reviewDate: string;
  reviewer: string;
  openIssues: string;
}

const PROJECTS: readonly ProjectSeed[] = [
  {
    code: 'PRJ-101',
    name: 'Cloud migration for payment processing platform (incl. staging & DR)',
    status: 'No issues',
    tasks: [
      {
        code: 'T-101-001',
        summary: 'Validate SSL certificates across all endpoints',
        critical: 'Yes',
        assignee: 'Elena Torres, Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '20 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
      {
        code: 'T-101-002',
        summary: 'Verify data integrity after batch ETL migration',
        critical: 'Yes',
        assignee: 'Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '23 Oct 2025',
        reviewer: 'Marcus Chen',
        openIssues: 'No issues',
      },
      {
        code: 'T-101-003',
        summary: 'Load-test checkout flow under peak traffic',
        critical: 'Yes',
        assignee: 'Elena Torres, Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '19 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
      {
        code: 'T-101-004',
        summary: 'Audit IAM policies for distribution services',
        critical: 'Yes',
        assignee: 'Sofia Patel, Raj Anand',
        reviewStatus: 'Approved',
        reviewDate: '19 Jan 2026',
        reviewer: 'Sofia Patel',
        openIssues: 'No issues',
      },
      {
        code: 'T-101-005',
        summary: 'Reconcile cross-region replication lag (IFRS)',
        critical: 'Yes',
        assignee: "James O'Brien, Sofia Patel",
        reviewStatus: 'Approved',
        reviewDate: '19 Jan 2026',
        reviewer: 'Sofia Patel',
        openIssues: 'No issues',
      },
    ],
  },
  {
    code: 'PRJ-105',
    name: 'Automated compliance reporting for commissions & acquisition fees',
    status: 'No issues',
    tasks: [
      {
        code: 'T-105-001',
        summary: 'Validate SSL certificates across all endpoints',
        critical: 'Yes',
        assignee: 'Elena Torres, Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '20 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
    ],
  },
  {
    code: 'PRJ-106',
    name: 'Claims settlement reconciliation P&L (incl. retro & adjustments)',
    status: 'No issues',
    tasks: [
      {
        code: 'T-106-001',
        summary: 'Load-test checkout flow under peak traffic',
        critical: 'Yes',
        assignee: 'Elena Torres, Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '19 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
    ],
  },
  {
    code: 'PRJ-107',
    name: 'Claims settlement reconciliation L&H (incl. retro & adjustments)',
    status: 'No issues',
    tasks: [
      {
        code: 'T-107-001',
        summary: 'Validate SSL certificates across all endpoints',
        critical: 'Yes',
        assignee: 'Elena Torres, Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '20 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
      {
        code: 'T-107-002',
        summary: 'Load-test checkout flow under peak traffic',
        critical: 'Yes',
        assignee: 'Elena Torres, Marcus Chen',
        reviewStatus: 'Approved',
        reviewDate: '19 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
    ],
  },
  {
    code: 'PRJ-110',
    name: 'Vendor onboarding workflow digitalization',
    status: '2 issues',
    tasks: [
      {
        code: 'T-110-001',
        summary: 'Background check API integration',
        critical: 'Yes',
        assignee: 'Raj Anand',
        reviewStatus: 'Pending',
        reviewDate: '—',
        reviewer: '—',
        openIssues: '1 issue',
      },
      {
        code: 'T-110-002',
        summary: 'Contract template generation engine',
        critical: 'No',
        assignee: 'Sofia Patel',
        reviewStatus: 'Approved',
        reviewDate: '14 Feb 2026',
        reviewer: "James O'Brien",
        openIssues: 'No issues',
      },
      {
        code: 'T-110-003',
        summary: 'E-signature flow with multi-party approval',
        critical: 'Yes',
        assignee: 'Raj Anand, Marcus Chen',
        reviewStatus: 'Rejected',
        reviewDate: '10 Feb 2026',
        reviewer: 'Elena Torres',
        openIssues: '1 issue',
      },
    ],
  },
  {
    code: 'PRJ-112',
    name: 'Real-time fraud detection pipeline for transaction monitoring',
    status: 'No issues',
    tasks: [
      {
        code: 'T-112-001',
        summary: 'Streaming ingestion from Kafka topics',
        critical: 'Yes',
        assignee: "Marcus Chen, James O'Brien",
        reviewStatus: 'Approved',
        reviewDate: '05 Jan 2026',
        reviewer: 'Marcus Chen',
        openIssues: 'No issues',
      },
      {
        code: 'T-112-002',
        summary: 'ML model scoring latency benchmarks',
        critical: 'Yes',
        assignee: 'Elena Torres',
        reviewStatus: 'Approved',
        reviewDate: '12 Jan 2026',
        reviewer: 'Sofia Patel',
        openIssues: 'No issues',
      },
      {
        code: 'T-112-003',
        summary: 'Alert routing and escalation rules',
        critical: 'No',
        assignee: 'Raj Anand',
        reviewStatus: 'Approved',
        reviewDate: '18 Jan 2026',
        reviewer: 'Raj Anand',
        openIssues: 'No issues',
      },
      {
        code: 'T-112-004',
        summary: 'Dashboard for ops team with live metrics',
        critical: 'No',
        assignee: 'Sofia Patel',
        reviewStatus: 'Approved',
        reviewDate: '22 Jan 2026',
        reviewer: 'Elena Torres',
        openIssues: 'No issues',
      },
    ],
  },
];

/**
 * Flatten the project→task hierarchy into one row per task.
 * Rows are sorted by projectCode so AG Grid's `spanRows` can merge
 * consecutive parent cells that share the same value.
 */
export function generateProjectTaskRows(): ProjectTaskRow[] {
  const rows: ProjectTaskRow[] = [];

  for (const project of PROJECTS) {
    for (const task of project.tasks) {
      rows.push({
        projectCode: project.code,
        projectName: project.name,
        projectStatus: project.status,
        taskCode: task.code,
        taskSummary: task.summary,
        critical: task.critical,
        assignee: task.assignee,
        reviewStatus: task.reviewStatus,
        reviewDate: task.reviewDate,
        reviewer: task.reviewer,
        openIssues: task.openIssues,
      });
    }
  }

  return rows;
}

export const MOCK_PROJECT_TASK_ROWS: readonly ProjectTaskRow[] = generateProjectTaskRows();
