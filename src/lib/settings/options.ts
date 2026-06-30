export const TIMEZONE_OPTIONS = [
  { value: 'auto',             label: 'Auto (System)'   },
  { value: 'UTC',              label: 'UTC'             },
  { value: 'America/New_York', label: 'Eastern (ET)'    },
  { value: 'America/Chicago',  label: 'Central (CT)'    },
  { value: 'Europe/London',    label: 'London (GMT)'    },
  { value: 'Asia/Singapore',   label: 'Singapore (SGT)' },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English'  },
  { value: 'es', label: 'Español'  },
  { value: 'zh', label: '中文'      },
  { value: 'ja', label: '日本語'    },
] as const

export const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States'  },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada'         },
  { value: 'SG', label: 'Singapore'      },
  { value: 'AU', label: 'Australia'      },
  { value: 'DE', label: 'Germany'        },
] as const
