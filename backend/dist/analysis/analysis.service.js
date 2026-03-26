"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var AnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const labels_1 = require("./labels");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let AnalysisService = AnalysisService_1 = class AnalysisService {
    logger = new common_1.Logger(AnalysisService_1.name);
    async loadModel() {
        this.logger.log('Python ML Model is loaded lazily per process. Skipping Node-side initialization.');
    }
    async analyzeImage(file) {
        try {
            this.logger.log('Starting Python inference via child_process...');
            const tempImagePath = path.join(process.cwd(), `temp_${Date.now()}.jpg`);
            fs.writeFileSync(tempImagePath, file.buffer);
            const modelPath = path.join(process.cwd(), '..', 'model files', 'plant_disease_model.h5');
            const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
            const scriptPath = path.join(process.cwd(), 'infer.py');
            if (!fs.existsSync(modelPath)) {
                throw new Error('H5 Model file not found at: ' + modelPath);
            }
            const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}" "${modelPath}" "${tempImagePath}" "efficientnetv2"`);
            if (fs.existsSync(tempImagePath)) {
                fs.unlinkSync(tempImagePath);
            }
            if (stderr && !stdout) {
                throw new Error('Python Script Stderr: ' + stderr);
            }
            const lines = stdout.split('\n').filter(l => l.trim() !== '');
            let parsed = null;
            for (const line of lines) {
                if (line.startsWith('{')) {
                    try {
                        parsed = JSON.parse(line);
                        break;
                    }
                    catch (e) { }
                }
            }
            if (!parsed) {
                throw new Error('Failed to parse Python output: ' + stdout);
            }
            if (parsed.error) {
                throw new Error('Python Execution Error: ' + parsed.error);
            }
            const { maxIndex, maxProb } = parsed;
            if (maxProb < 0.60) {
                return {
                    disease: 'Uncertain',
                    crop: 'Unknown',
                    confidence: `${(maxProb * 100).toFixed(2)}%`,
                    suggestion: 'Uncertain / Please take a clearer picture',
                };
            }
            const label = labels_1.PLANT_VILLAGE_CLASSES[maxIndex] || 'Unknown___Unknown';
            const [crop, diseaseRaw] = label.split('___');
            let suggestion = 'Maintain current care routine.';
            let diseaseDisplay = 'Healthy';
            if (diseaseRaw && diseaseRaw.toLowerCase() !== 'healthy') {
                diseaseDisplay = diseaseRaw.replace(/_/g, ' ');
                suggestion = `Consult a local agriculturist about specific treatments for ${diseaseDisplay} on ${crop}. Applying an appropriate fungicide/bactericide may be required.`;
            }
            return {
                disease: diseaseDisplay,
                crop: crop.replace(/_/g, ' '),
                confidence: `${(maxProb * 100).toFixed(2)}%`,
                suggestion,
            };
        }
        catch (err) {
            this.logger.error('Error during image analysis', err);
            throw new common_1.BadRequestException('Detailed Error: ' + (err.stack || err.message));
        }
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = AnalysisService_1 = __decorate([
    (0, common_1.Injectable)()
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map