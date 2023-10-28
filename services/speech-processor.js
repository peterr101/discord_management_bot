import * as toxicity from "@tensorflow-models/toxicity";

const TOXICITY_THRESHOLD = 0.9;

/**
 * Text analyzer for toxic speech.
 * Uses TensorFlow model.
 */
export class SpeechProcessor {
  toxicityModel;

  async initialize(threshold = TOXICITY_THRESHOLD) {
    if (!this.toxicityModel) {
      this.toxicityModel = await toxicity.load(
        threshold
        // UNACCEPTABLE_TOXIC_CATEGORIES_SET
      );
    }
    return this.toxicityModel;
  }

  async isDangerousComment(comment) {
    if (!this.toxicityModel) {
      throw new Error("Model not initialized.");
    }
    if (comment) {
      try {
        const predictions = await this.toxicityModel.classify(comment);
        return !!predictions.find((prediction) =>
          prediction.results.find((res) => res.match)
        );
      } catch (e) {
        return false;
      }
    }
  }
}
