import type { PolicyLimits } from '@/types/policy'

export const limitLabels: Record<keyof PolicyLimits, string> = {
  insult: 'Insult',
  rejection: 'Rejection',
  badJoke: 'Bad joke',
  gaslighting: 'Gaslighting',
  overthinking: 'Overthinking',
  awkwardSilence: 'Awkward silence',
  whyDontYouQuestion: "Why don't you question",
  meetingThatCouldHaveBeenEmail: 'Meeting that could have been email',
}
