import { ConfigService } from '@nestjs/config';
import { ContentPlatform, ContentPostFormat } from '@prisma/client';
export interface BriefContentIdea {
    title: string;
    copy: string;
    format: ContentPostFormat;
    mediaConcept: string;
    suggestedDate: string;
}
export interface BriefContentPlan {
    summary: string;
    platform: ContentPlatform;
    ideas: BriefContentIdea[];
    provider: 'openai' | 'gemini' | 'fallback';
}
export interface LeadQualificationInput {
    name: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    city?: string | null;
    neighborhood?: string | null;
    category?: string | null;
    rating?: number | null;
    reviewsCount?: number | null;
}
export interface LeadQualificationResult {
    qualified: boolean;
    score: number;
    notes: string;
    provider: 'openai' | 'gemini' | 'fallback';
}
interface GeneratePlanInput {
    brief: string;
    clientName: string;
    platform?: ContentPlatform;
    objective?: string;
}
export declare class AiService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    generateContentPlan(input: GeneratePlanInput): Promise<BriefContentPlan>;
    qualifyLead(input: LeadQualificationInput): Promise<LeadQualificationResult>;
    private buildPrompt;
    private generateWithOpenAI;
    private generateWithGemini;
    private parsePlanResponse;
    private extractJson;
    private normalizeIdea;
    private normalizeFormat;
    private normalizeDate;
    private defaultScheduleDate;
    private generateFallbackPlan;
    private extractThemes;
    private buildFallbackCopy;
    private buildFallbackMediaConcept;
    private buildLeadQualifyPrompt;
    private qualifyWithOpenAI;
    private qualifyWithGemini;
    private parseLeadQualification;
    private qualifyFallback;
}
export {};
