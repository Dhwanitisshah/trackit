export type Status = 'Applied' | 'OA/Screen' | 'Interview' | 'Offer' | 'Rejected';

export interface Profile {
  id: string;
  full_name: string | null;
  college: string | null;
  year: string | null;
  discipline: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  username: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileSkill {
  id: string;
  profile_id: string;
  skill_name: string;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: Status;
  applied_date: string | null;
  deadline: string | null;
  jd_url: string | null;
  notes: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewPrep {
  id: string;
  application_id: string;
  questions: string[];
  generated_at: string;
}

export type ResumeContent = {
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    college: string;
    year: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string[];
  }[];
};

export type Resume = {
  id: string;
  user_id: string;
  jd_text: string | null;
  content: ResumeContent | null;
  created_at: string;
  updated_at: string;
};

export type FollowUpEmail = {
  id: string;
  application_id: string;
  email_body: string;
  generated_at: string;
};

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export type InterviewAnswer = {
  id: string;
  interview_prep_id: string;
  question_index: number;
  answer: string;
  updated_at: string;
};

export type CoverLetter = {
  id: string;
  application_id: string;
  body: string;
  generated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
};

export type RSSJobListing = {
  id: string;
  title: string;
  company: string;
  description: string;
  url: string;
  pubDate: string;
  source: 'internshala' | 'freshersworld';
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};
