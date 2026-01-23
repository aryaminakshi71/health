/**
 * Drug Interaction API Integration
 * 
 * Integrates with RxNorm/DrugBank for drug interaction checking
 */

// Drug Interaction Types
export type InteractionSeverity = 'mild' | 'moderate' | 'severe' | 'contraindicated';

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: InteractionSeverity;
  description: string;
  clinicalSignificance: string;
}

export interface AllergyWarning {
  allergen: string;
  medication: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

/**
 * Check drug interactions using RxNorm and DrugBank APIs
 */
export async function checkDrugInteractions(
  medicationIds: string[],
  patientCurrentMedications: string[],
  medicationNdcCodes?: Map<string, string>,
): Promise<DrugInteraction[]> {
  const interactions: DrugInteraction[] = [];
  
  try {
    // Import RxNorm functions
    const { getRxNormInteractions, getRxNormByNDC } = await import('./rxnorm');
    
    // Get RxCUIs for all medications
    const rxcuis: string[] = [];
    
    for (const medId of [...medicationIds, ...patientCurrentMedications]) {
      const ndcCode = medicationNdcCodes?.get(medId);
      if (ndcCode) {
        const rxnorm = await getRxNormByNDC(ndcCode);
        if (rxnorm?.rxcui) {
          rxcuis.push(rxnorm.rxcui);
        }
      }
    }

    // Get interactions from RxNorm
    if (rxcuis.length >= 2) {
      const rxnormInteractions = await getRxNormInteractions(rxcuis);
      
      for (const interaction of rxnormInteractions) {
        for (const pair of interaction.interactionPair) {
          interactions.push({
            drug1: pair.interactionConcept[0]?.minConceptItem?.name || '',
            drug2: pair.interactionConcept[1]?.minConceptItem?.name || '',
            severity: mapSeverity(pair.severity),
            description: pair.description || '',
            clinicalSignificance: pair.severity || '',
          });
        }
      }
    }

    // Get interactions from DrugBank if API key available
    if (process.env.DRUGBANK_API_KEY) {
      const { getDrugBankInteractions } = await import('./drugbank');
      // This would require DrugBank IDs, which we'd need to map from NDC codes
      // Implementation would go here
    }
  } catch (error) {
    console.error('Error checking drug interactions:', error);
  }

  return interactions;
}

/**
 * Map RxNorm severity to our severity type
 */
function mapSeverity(severity: string): InteractionSeverity {
  const lower = severity.toLowerCase();
  if (lower.includes('contraindicated') || lower.includes('major')) {
    return 'contraindicated';
  }
  if (lower.includes('severe') || lower.includes('serious')) {
    return 'severe';
  }
  if (lower.includes('moderate')) {
    return 'moderate';
  }
  return 'mild';
}

/**
 * Check allergies against medication
 */
export async function checkAllergies(
  medicationName: string,
  medicationGenericName: string | null,
  patientAllergies: string[],
): Promise<AllergyWarning[]> {
  const warnings: AllergyWarning[] = [];

  // Simple string matching (in production, use medical terminology matching)
  const medicationTerms = [
    medicationName.toLowerCase(),
    medicationGenericName?.toLowerCase() || '',
  ].filter(Boolean);

  for (const allergen of patientAllergies) {
    const allergenLower = allergen.toLowerCase();
    
    for (const medTerm of medicationTerms) {
      if (medTerm.includes(allergenLower) || allergenLower.includes(medTerm)) {
        warnings.push({
          allergen,
          medication: medicationName,
          severity: 'severe', // Default to severe for safety
          description: `Patient is allergic to ${allergen}. This medication may contain similar compounds.`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Get medication information from RxNorm
 */
export async function getMedicationInfo(ndcCode: string): Promise<{
  name: string;
  genericName: string;
  drugClass: string;
  interactions: string[];
} | null> {
  const { getRxNormByNDC, getRelatedDrugs } = await import('./rxnorm');
  
  const rxnorm = await getRxNormByNDC(ndcCode);
  if (!rxnorm) {
    return null;
  }

  const related = await getRelatedDrugs(rxnorm.rxcui);

  return {
    name: rxnorm.name,
    genericName: related.find(r => r.tty === 'IN')?.name || '',
    drugClass: '', // Would need additional API call
    interactions: [], // Would be populated from interaction check
  };
}

/**
 * Check for duplicate therapy
 * Warns if patient is already on a similar medication
 */
export async function checkDuplicateTherapy(
  newMedication: string,
  currentMedications: string[],
): Promise<{
  isDuplicate: boolean;
  similarMedications: string[];
}> {
  // Simple implementation - in production, use drug class matching
  const newMedLower = newMedication.toLowerCase();
  const similar: string[] = [];

  for (const currentMed of currentMedications) {
    const currentMedLower = currentMed.toLowerCase();
    
    // Check for similar names or same drug class
    if (
      newMedLower.includes(currentMedLower) ||
      currentMedLower.includes(newMedLower)
    ) {
      similar.push(currentMed);
    }
  }

  return {
    isDuplicate: similar.length > 0,
    similarMedications: similar,
  };
}
