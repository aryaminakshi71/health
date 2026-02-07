export interface SymptomInput {
  symptoms: string[];
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  patientHistory?: string[];
  medications?: string[];
  allergies?: string[];
}

export interface AnalyzedSymptom {
  original: string;
  standardized: string;
  severity: string;
  duration?: string;
}

export interface SymptomAnalysisResult {
  analyzedSymptoms: AnalyzedSymptom[];
  urgencyLevel: 'emergency' | 'urgent' | 'routine' | 'self-care';
  confidence: number;
  recommendations: CareRecommendation[];
  possibleConditions: PossibleCondition[];
 红旗警告: RedFlag[];
}

export interface CareRecommendation {
  type: 'emergency' | 'urgent' | 'routine' | 'self-care';
  action: string;
  description: string;
  whenToSeekHelp: string;
}

export interface PossibleCondition {
  name: string;
  probability: number;
  icd10Code: string;
  description: string;
  typicalSymptoms: string[];
  matchingSymptoms: string[];
}

export interface RedFlag {
  symptom: string;
  warning: string;
  recommendation: string;
}

const SYMPTOM_DATABASE: Record<string, {
  standardized: string;
  severity: string;
  relatedConditions: Array<{
    name: string;
    icd10: string;
    probability: number;
    description: string;
    typicalSymptoms: string[];
    redFlags: string[];
  }>;
}> = {
  'chest pain': {
    standardized: 'Chest Pain',
    severity: 'high',
    relatedConditions: [
      {
        name: 'Myocardial Infarction',
        icd10: 'I21.9',
        probability: 0.15,
        description: 'Heart attack - blockage of blood flow to heart muscle',
        typicalSymptoms: ['chest pain', 'shortness of breath', 'sweating', 'nausea', 'arm pain'],
        redFlags: ['chest pain lasting more than 5 minutes', 'chest pain with shortness of breath', 'chest pain with sweating'],
      },
      {
        name: 'Angina',
        icd10: 'I20.9',
        probability: 0.25,
        description: 'Chest pain due to reduced blood flow to the heart',
        typicalSymptoms: ['chest pain', 'shortness of breath', 'fatigue'],
        redFlags: ['chest pain at rest', 'increasing frequency of chest pain'],
      },
      {
        name: 'Gastroesophageal Reflux Disease',
        icd10: 'K21.0',
        probability: 0.30,
        description: 'Chronic acid reflux',
        typicalSymptoms: ['heartburn', 'chest pain', 'regurgitation'],
        redFlags: ['difficulty swallowing', 'unintentional weight loss'],
      },
    ],
  },
  'headache': {
    standardized: 'Headache',
    severity: 'medium',
    relatedConditions: [
      {
        name: 'Tension Headache',
        icd10: 'G43.909',
        probability: 0.40,
        description: 'Common headache with muscle tension',
        typicalSymptoms: ['headache', 'neck pain', 'shoulder pain', 'dull pain'],
        redFlags: ['sudden severe headache', 'headache with fever', 'headache with vision changes'],
      },
      {
        name: 'Migraine',
        icd10: 'G43.909',
        probability: 0.25,
        description: 'Recurring headaches with neurological symptoms',
        typicalSymptoms: ['headache', 'nausea', 'sensitivity to light', 'visual disturbances'],
        redFlags: ['worst headache of my life', 'headache with weakness'],
      },
      {
        name: 'Sinusitis',
        icd10: 'J01.90',
        probability: 0.20,
        description: 'Inflammation of sinus cavities',
        typicalSymptoms: ['headache', 'facial pain', 'nasal congestion', 'thick nasal discharge'],
        redFlags: ['headache with high fever', 'headache with confusion'],
      },
    ],
  },
  'fever': {
    standardized: 'Fever',
    severity: 'high',
    relatedConditions: [
      {
        name: 'Viral Upper Respiratory Infection',
        icd10: 'J06.9',
        probability: 0.45,
        description: 'Common cold or flu',
        typicalSymptoms: ['fever', 'cough', 'sore throat', 'runny nose', 'body aches'],
        redFlags: ['fever above 103°F', 'fever lasting more than 3 days', 'fever with rash'],
      },
      {
        name: 'Bacterial Infection',
        icd10: 'A49.9',
        probability: 0.15,
        description: 'Bacterial infection requiring antibiotics',
        typicalSymptoms: ['fever', 'localized pain', 'swelling'],
        redFlags: ['fever with difficulty breathing', 'fever with confusion'],
      },
    ],
  },
  'cough': {
    standardized: 'Cough',
    severity: 'medium',
    relatedConditions: [
      {
        name: 'Upper Respiratory Infection',
        icd10: 'J06.9',
        probability: 0.50,
        description: 'Common cold',
        typicalSymptoms: ['cough', 'runny nose', 'sore throat', 'mild fever'],
        redFlags: ['coughing up blood', 'cough with difficulty breathing'],
      },
      {
        name: 'Asthma',
        icd10: 'J45.909',
        probability: 0.15,
        description: 'Chronic airway inflammation',
        typicalSymptoms: ['cough', 'wheezing', 'shortness of breath', 'chest tightness'],
        redFlags: ['severe shortness of breath', 'blue lips or face'],
      },
    ],
  },
  'shortness of breath': {
    standardized: 'Dyspnea',
    severity: 'high',
    relatedConditions: [
      {
        name: 'Asthma Exacerbation',
        icd10: 'J45',
        probability: 0.20,
        description: 'Ast.21hma flare-up',
        typicalSymptoms: ['shortness of breath', 'wheezing', 'chest tightness', 'cough'],
        redFlags: ['severe shortness of breath', 'unable to speak in full sentences', 'blue lips'],
      },
      {
        name: 'Pneumonia',
        icd10: 'J18.9',
        probability: 0.15,
        description: 'Lung infection',
        typicalSymptoms: ['shortness of breath', 'fever', 'cough', 'chest pain', 'fatigue'],
        redFlags: ['difficulty breathing at rest', 'confusion', 'chest pain'],
      },
      {
        name: 'Anxiety',
        icd10: 'F41.9',
        probability: 0.25,
        description: 'Panic or anxiety attack',
        typicalSymptoms: ['shortness of breath', 'rapid heartbeat', 'dizziness', 'trembling'],
        redFlags: ['symptoms with chest pain'],
      },
    ],
  },
};

const RED_FLAGS: Record<string, RedFlag> = {
  'chest pain': {
    symptom: 'Chest Pain',
    warning: 'May indicate heart attack or other cardiac emergency',
    recommendation: 'Call emergency services immediately if chest pain lasts more than 5 minutes or is accompanied by shortness of breath, sweating, or pain radiating to arm/jaw',
  },
  'shortness of breath': {
    symptom: 'Shortness of Breath',
    warning: 'May indicate cardiac or respiratory emergency',
    recommendation: 'Seek immediate medical attention if breathing difficulty is severe, sudden, or accompanied by chest pain',
  },
  'severe headache': {
    symptom: 'Severe Headache',
    warning: 'May indicate stroke or aneurysm',
    recommendation: 'Call emergency services - sudden severe headache described as "worst of life" requires immediate evaluation',
  },
  'high fever': {
    symptom: 'High Fever',
    warning: 'May indicate serious infection',
    recommendation: 'Seek medical care if fever exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by rash or confusion',
  },
  'confusion': {
    symptom: 'Confusion',
    warning: 'May indicate serious neurological or metabolic issue',
    recommendation: 'Emergency evaluation needed - sudden confusion can indicate stroke, infection, or metabolic imbalance',
  },
};

export class SymptomCheckerEngine {
  private symptomDatabase: typeof SYMPTOM_DATABASE;

  constructor() {
    this.symptomDatabase = SYMPTOM_DATABASE;
  }

  analyze(input: SymptomInput): SymptomAnalysisResult {
    const analyzedSymptoms = this.standardizeSymptoms(input.symptoms);
    const urgencyLevel = this.determineUrgency(analyzedSymptoms, input);
    const confidence = this.calculateConfidence(analyzedSymptoms, input);
    const possibleConditions = this.matchConditions(analyzedSymptoms);
    const recommendations = this.generateRecommendations(urgencyLevel, analyzedSymptoms);
    const redFlags = this.identifyRedFlags(analyzedSymptoms);

    return {
      analyzedSymptoms,
      urgencyLevel,
      confidence,
      recommendations,
      possibleConditions,
      红旗警告: redFlags,
    };
  }

  private standardizeSymptoms(symptoms: string[]): AnalyzedSymptom[] {
    return symptoms.map(symptom => {
      const normalized = symptom.toLowerCase().trim();
      
      for (const [key, data] of Object.entries(this.symptomDatabase)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          return {
            original: symptom,
            standardized: data.standardized,
            severity: data.severity,
            duration: undefined,
          };
        }
      }

      return {
        original: symptom,
        standardized: symptom,
        severity: 'medium',
        duration: undefined,
      };
    });
  }

  private determineUrgency(symptoms: AnalyzedSymptom[], input: SymptomInput): SymptomAnalysisResult['urgencyLevel'] {
    const redFlagSymptom = symptoms.find(s => 
      ['chest pain', 'shortness of breath', 'severe headache', 'high fever', 'confusion'].includes(s.standardized.toLowerCase())
    );

    if (redFlagSymptom || input.severity === 'severe') {
      return 'emergency';
    }

    const urgentSymptoms = symptoms.filter(s =>
      ['fever', 'persistent cough', 'severe pain'].includes(s.standardized.toLowerCase())
    );

    if (urgentSymptoms.length > 0) {
      return 'urgent';
    }

    return 'routine';
  }

  private calculateConfidence(symptoms: AnalyzedSymptom[], input: SymptomInput): number {
    let confidence = 0.5;

    for (const symptom of symptoms) {
      if (this.symptomDatabase[symptom.original.toLowerCase()]) {
        confidence += 0.15;
      }
    }

    if (input.duration) {
      confidence += 0.1;
    }

    if (input.patientHistory && input.patientHistory.length > 0) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }

  private matchConditions(symptoms: AnalyzedSymptom[]): PossibleCondition[] {
    const conditionScores = new Map<string, { condition: PossibleCondition; matches: number }>();

    for (const symptom of symptoms) {
      const data = this.symptomDatabase[symptom.original.toLowerCase()];
      if (data) {
        for (const related of data.relatedConditions) {
          const existing = conditionScores.get(related.name);
          const matchCount = related.typicalSymptoms.filter(s =>
            symptoms.some(ss => ss.standardized.toLowerCase().includes(s.toLowerCase()))
          ).length;

          if (existing) {
            existing.matches += matchCount;
          } else {
            conditionScores.set(related.name, {
              condition: {
                name: related.name,
                probability: related.probability * (matchCount / related.typicalSymptoms.length),
                icd10Code: related.icd10,
                description: related.description,
                typicalSymptoms: related.typicalSymptoms,
                matchingSymptoms: symptoms.map(s => s.original).filter(s =>
                  related.typicalSymptoms.some(ts => ts.toLowerCase().includes(s.toLowerCase()))
                ),
              },
              matches: matchCount,
            });
          }
        }
      }
    }

    return Array.from(conditionScores.values())
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5)
      .map(v => v.condition);
  }

  private generateRecommendations(
    urgency: SymptomAnalysisResult['urgencyLevel'],
    symptoms: AnalyzedSymptom[]
  ): CareRecommendation[] {
    const recommendations: CareRecommendation[] = [];

    switch (urgency) {
      case 'emergency':
        recommendations.push({
          type: 'emergency',
          action: 'Call Emergency Services',
          description: 'Your symptoms may indicate a life-threatening emergency',
          whenToSeekHelp: 'Immediately - call 911 or your local emergency number',
        });
        break;
      case 'urgent':
        recommendations.push({
          type: 'urgent',
          action: 'Contact Healthcare Provider',
          description: 'Your symptoms require prompt medical evaluation',
          whenToSeekHelp: 'Within 24 hours - schedule an urgent appointment or visit urgent care',
        });
        break;
      case 'routine':
        recommendations.push({
          type: 'routine',
          action: 'Schedule Routine Appointment',
          description: 'Your symptoms can be evaluated during regular office hours',
          whenToSeekHelp: 'Within a few days to a week',
        });
        break;
      case 'self-care':
        recommendations.push({
          type: 'self-care',
          action: 'Self-Care Measures',
          description: 'Your symptoms may respond to home treatment',
          whenToSeekHelp: 'If symptoms worsen or persist for more than a week',
        });
        break;
    }

    return recommendations;
  }

  private identifyRedFlags(symptoms: AnalyzedSymptom[]): RedFlag[] {
    const flags: RedFlag[] = [];

    for (const symptom of symptoms) {
      const redFlag = RED_FLAGS[symptom.standardized.toLowerCase()];
      if (redFlag) {
        flags.push(redFlag);
      }
    }

    return flags;
  }

  getSymptomCategories(): string[] {
    return Object.keys(this.symptomDatabase);
  }

  searchSymptoms(query: string): string[] {
    const normalized = query.toLowerCase();
    return Object.keys(this.symptomDatabase).filter(symptom =>
      symptom.includes(normalized) || symptom.startsWith(normalized)
    );
  }
}

export const symptomChecker = new SymptomCheckerEngine();

export function analyzeSymptoms(input: SymptomInput): SymptomAnalysisResult {
  return symptomChecker.analyze(input);
}
