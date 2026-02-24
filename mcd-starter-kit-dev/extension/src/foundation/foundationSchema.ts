import { InitMode } from '../onboarding/initMode';

export interface ProjectContext {
    name: string;
    codename: string;
    version: string;
    repoType: 'new' | 'existing';
}

export interface ActorContext {
    primaryBuilder: 'solo' | 'team';
    roles: string[];
}

export interface MetricContext {
    type: string;
    definition: string;
    target: string;
    timeHorizon: string;
}

export interface ProductContext {
    targetUsers: string[];
    problemStatement: string;
    coreValueProposition: string;
    hardNonGoals: string[];
    keyFeatures: string[];
    successMetric: MetricContext;
}

export interface AIContext {
    usesAI: boolean;
    providers: string[];
    multiModel: boolean;
    safetyNotes: string[];
}

export interface ConstraintContext {
    deployment: string;
    data: string;
    security: string[];
    performance: string[];
    outOfScope: string[];
    ai: AIContext;
}

export interface NoteContext {
    openQuestions: string[];
    assumptions: string[];
    risks: string[];
}

export interface FoundationState {
    schemaVersion: string;
    createdAt: string;
    updatedAt: string;
    initMode: InitMode;
    project: ProjectContext;
    actors: ActorContext;
    product: ProductContext;
    constraints: ConstraintContext;
    notes: NoteContext;
}
