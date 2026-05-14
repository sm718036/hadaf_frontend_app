export const queryKeys = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
    sessions: ["auth", "sessions"] as const,
  },
  clientAuth: {
    currentClient: ["client-auth", "current-client"] as const,
    sessions: ["client-auth", "sessions"] as const,
  },
  notifications: {
    internal: ["notifications", "internal"] as const,
    client: ["notifications", "client"] as const,
  },
  applications: {
    all: ["applications"] as const,
    list: (params: {
      page: number;
      pageSize: number;
      search: string;
      country: string;
      stage: string;
      status: string;
      staffId: string;
      clientId: string;
      dateFrom: string;
      dateTo: string;
    }) => ["applications", "list", params] as const,
    detail: (id: string) => ["applications", "detail", id] as const,
    own: ["applications", "own"] as const,
  },
  clients: {
    all: ["clients"] as const,
    list: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      country: string;
      targetCountry: string;
      targetService: string;
      staffId: string;
    }) => ["clients", "list", params] as const,
    detail: (id: string) => ["clients", "detail", id] as const,
  },
  leads: {
    all: ["leads"] as const,
    list: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      country: string;
      service: string;
      staffId: string;
      dateFrom: string;
      dateTo: string;
    }) => ["leads", "list", params] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
  users: {
    all: ["internal-users"] as const,
    list: (params: { page: number; pageSize: number; search: string }) =>
      ["internal-users", "list", params] as const,
  },
  configurationVault: {
    all: ["configuration-vault"] as const,
    snapshot: ["configuration-vault", "snapshot"] as const,
    metadata: ["configuration-vault", "metadata"] as const,
  },
  intakeEngine: {
    all: ["intake-engine"] as const,
    publicMetadata: ["intake-engine", "public-metadata"] as const,
    questions: ["intake-engine", "questions"] as const,
  },
  siteContent: {
    public: ["site-content", "public"] as const,
  },
  operations: {
    all: ["operations"] as const,
    tasksList: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      clientId: string;
      applicationId: string;
      staffId: string;
    }) => ["operations", "tasks", params] as const,
    documentsList: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      clientId: string;
      applicationId: string;
      staffId: string;
    }) => ["operations", "documents", params] as const,
    appointmentsList: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      clientId: string;
      applicationId: string;
      staffId: string;
    }) => ["operations", "appointments", params] as const,
    paymentsList: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      clientId: string;
      applicationId: string;
      staffId: string;
    }) => ["operations", "payments", params] as const,
    messagesList: (params: {
      page: number;
      pageSize: number;
      search: string;
      status: string;
      clientId: string;
      applicationId: string;
      staffId: string;
    }) => ["operations", "messages", params] as const,
    ownDocuments: ["operations", "documents", "own"] as const,
    ownAppointments: ["operations", "appointments", "own"] as const,
    ownPayments: ["operations", "payments", "own"] as const,
    ownMessages: ["operations", "messages", "own"] as const,
    chatContacts: (search: string) => ["operations", "chat", "contacts", search] as const,
    chatThreads: (search: string) => ["operations", "chat", "threads", search] as const,
    chatConversation: (threadId: string) =>
      ["operations", "chat", "conversation", threadId] as const,
    ownChatConversation: ["operations", "chat", "conversation", "own"] as const,
    meetings: ["operations", "chat", "meetings"] as const,
    meetingDetail: (meetingId: string) => ["operations", "chat", "meeting", meetingId] as const,
    ownMeetings: ["operations", "chat", "meetings", "own"] as const,
  },
} as const;
