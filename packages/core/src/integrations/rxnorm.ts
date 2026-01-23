/**
 * RxNorm API Integration
 * 
 * Integrates with RxNorm API for drug information and interactions
 * Documentation: https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html
 */

export interface RxNormConcept {
  rxcui: string;
  name: string;
  synonym: string;
  tty: string;
  language: string;
  suppress: string;
  umlscui: string;
}

export interface RxNormInteraction {
  minConceptItem: {
    rxcui: string;
    name: string;
    tty: string;
  };
  interactionPair: Array<{
    interactionConcept: Array<{
      minConceptItem: {
        rxcui: string;
        name: string;
        tty: string;
      };
      sourceConceptItem: {
        id: string;
        name: string;
        url: string;
      };
    }>;
    severity: string;
    description: string;
  }>;
}

/**
 * Get RxNorm concept by NDC code
 */
export async function getRxNormByNDC(ndcCode: string): Promise<RxNormConcept | null> {
  const apiKey = process.env.RXNORM_API_KEY;
  if (!apiKey) {
    console.warn('RXNORM_API_KEY not set, skipping RxNorm lookup');
    return null;
  }

  try {
    // RxNorm REST API endpoint
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?idtype=NDC&id=${ndcCode}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.idGroup?.rxnormId?.[0]) {
      const rxcui = data.idGroup.rxnormId[0];
      return await getRxNormConcept(rxcui);
    }

    return null;
  } catch (error) {
    console.error('RxNorm API error:', error);
    return null;
  }
}

/**
 * Get RxNorm concept by RxCUI
 */
export async function getRxNormConcept(rxcui: string): Promise<RxNormConcept | null> {
  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.properties?.[0] || null;
  } catch (error) {
    console.error('RxNorm API error:', error);
    return null;
  }
}

/**
 * Get drug interactions from RxNorm
 */
export async function getRxNormInteractions(
  rxcuis: string[]
): Promise<RxNormInteraction[]> {
  if (rxcuis.length < 2) {
    return [];
  }

  try {
    // RxNorm interaction API
    const rxcuiList = rxcuis.join('+');
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${rxcuiList}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];
  } catch (error) {
    console.error('RxNorm interactions API error:', error);
    return [];
  }
}

/**
 * Search RxNorm by drug name
 */
export async function searchRxNorm(drugName: string): Promise<RxNormConcept[]> {
  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.drugGroup?.conceptGroup?.[0]?.conceptProperties || [];
  } catch (error) {
    console.error('RxNorm search API error:', error);
    return [];
  }
}

/**
 * Get all related drugs (ingredients, brand names, etc.)
 */
export async function getRelatedDrugs(rxcui: string): Promise<RxNormConcept[]> {
  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN+BN`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.relatedGroup?.conceptGroup?.[0]?.conceptProperties || [];
  } catch (error) {
    console.error('RxNorm related drugs API error:', error);
    return [];
  }
}
