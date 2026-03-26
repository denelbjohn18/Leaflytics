export declare class AnalysisService {
    private readonly logger;
    loadModel(): Promise<void>;
    analyzeImage(file: Express.Multer.File): Promise<{
        disease: string;
        crop: string;
        confidence: string;
        suggestion: string;
    }>;
}
