import "dotenv/config";
import { SpeechProcessor } from "./services/speech-processor.js";

// this is for on ready event
const speechAnalyzer = new SpeechProcessor();
await speechAnalyzer.initialize();
