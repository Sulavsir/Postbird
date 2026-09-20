export const API_PATHS = {
  health: "/health",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  smtp: {
    root: "/smtp",
    byId: (id: string) => `/smtp/${id}`,
    test: (id: string) => `/smtp/${id}/test`,
  },
  emails: {
    root: "/emails",
    send: "/emails/send",
    byId: (id: string) => `/emails/${id}`,
  },
  tracking: {
    open: (trackingId: string) => `/tracking/open/${trackingId}`,
    click: (trackingId: string) => `/tracking/click/${trackingId}`,
    stats: "/tracking/stats",
  },
  attachments: {
    root: "/attachments",
    download: (id: string) => `/attachments/${id}/download`,
    byId: (id: string) => `/attachments/${id}`,
  },
  received: {
    root: "/received",
    sync: "/received/sync",
  },
  dashboard: "/dashboard",
} as const;
