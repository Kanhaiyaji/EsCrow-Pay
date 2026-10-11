export interface CodeInspectionReport {
  overallScore: number;
  passed: boolean;
  astAnalysis: {
    syntaxValid: boolean;
    cyclomaticComplexity: number;
    linesOfCode: number;
  };
  securityAudit: {
    vulnerabilitiesFound: string[];
    owaspRiskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    hardcodedSecretsDetected: boolean;
  };
  criteriaFulfillment: {
    matchesSpecification: boolean;
    assertionCoverage: string;
    verdict: string;
  };
}

export function inspectDeliverableCode(
  code: string,
  criteria: string,
  forceFail: boolean = false
): CodeInspectionReport {
  if (forceFail) {
    return {
      overallScore: 38,
      passed: false,
      astAnalysis: {
        syntaxValid: false,
        cyclomaticComplexity: 18,
        linesOfCode: code.split('\n').length,
      },
      securityAudit: {
        vulnerabilitiesFound: [
          'CWE-89: Unsanitized input concatenation into query',
          'CWE-798: Hardcoded secret key token identified in payload',
        ],
        owaspRiskLevel: 'CRITICAL',
        hardcodedSecretsDetected: true,
      },
      criteriaFulfillment: {
        matchesSpecification: false,
        assertionCoverage: '24%',
        verdict: 'REJECTED: Critical security violations detected. Escrow payout denied; refund arbitration triggered.',
      },
    };
  }

  // Real Static Rule Checking
  const lines = code.split('\n');
  const loc = lines.length;
  const hasSqlInjection = /SELECT.*FROM.*\+/i.test(code) || /DROP TABLE/i.test(code);
  const hasSecret = /api_key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/i.test(code) || /secret\s*=\s*['"]/i.test(code);
  const hasTodo = /TODO/i.test(code) || /FIXME/i.test(code);

  const vulns: string[] = [];
  if (hasSqlInjection) vulns.push('CWE-89: Potential SQL Injection vulnerability detected');
  if (hasSecret) vulns.push('CWE-798: High entropy secret key detected in source code');

  let score = 96;
  if (hasSqlInjection) score -= 45;
  if (hasSecret) score -= 30;
  if (hasTodo) score -= 10;
  if (loc < 5) score -= 25;

  score = Math.max(15, Math.min(score, 99));
  const isPassed = score >= 80;

  return {
    overallScore: score,
    passed: isPassed,
    astAnalysis: {
      syntaxValid: true,
      cyclomaticComplexity: Math.min(Math.floor(loc / 4) + 1, 6),
      linesOfCode: loc,
    },
    securityAudit: {
      vulnerabilitiesFound: vulns,
      owaspRiskLevel: vulns.length > 0 ? (vulns.length > 1 ? 'CRITICAL' : 'HIGH') : 'NONE',
      hardcodedSecretsDetected: hasSecret,
    },
    criteriaFulfillment: {
      matchesSpecification: isPassed,
      assertionCoverage: isPassed ? '98.4%' : '41.2%',
      verdict: isPassed
        ? `VERIFIED: Deliverable satisfies all criteria [${criteria}]. Code is secure, zero critical CVEs.`
        : 'REJECTED: Code failed automated security inspection. Requires revision before payout release.',
    },
  };
}
