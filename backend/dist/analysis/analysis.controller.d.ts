import { AnalysisService } from './analysis.service';
export declare class AnalysisController {
    private readonly analysisService;
    constructor(analysisService: AnalysisService);
    analyzeFile(file: Express.Multer.File, body: any): Promise<{
        disease: string;
        crop: string;
        confidence: string;
        suggestion: string;
    }>;
}
