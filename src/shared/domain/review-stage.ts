export type ReviewStage = {
  id: string;
  title: string;
  description: string;
  emphasis: string;
};

export type ValueMetric = {
  label: string;
  value: string;
  helper: string;
};

export type InsightCard = {
  title: string;
  description: string;
};

export type UploadFeature = {
  title: string;
  description: string;
};

export type ExampleResponseSection = {
  title: string;
  tone: string;
  content: string;
};

export type ExampleFinding = {
  title: string;
  severity: string;
  detail: string;
};
