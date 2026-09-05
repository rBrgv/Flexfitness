// ============================================================
// Pure logic for the WhatsApp Knowledge & Guardrails questionnaire.
// No DOM/browser APIs here on purpose — this file is loaded both
// by the page (as a <script>) and by the Node test suite.
// ============================================================

(function (root) {
  function isFieldVisible(field, answers) {
    if (!field.showIf) return true;
    return answers[field.showIf.fieldId] === field.showIf.equals;
  }

  function isEmpty(value) {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  }

  function validateField(field, value) {
    if (!field.required) return null;

    if (field.type === 'boolean') {
      return value === true || value === false ? null : 'This field is required.';
    }
    if (field.type === 'guardrail-list') {
      const items = field.items || [];
      const confirmed = Array.isArray(value) ? value : [];
      const allConfirmed = items.length > 0 && items.every((_, i) => confirmed[i] === true);
      return allConfirmed ? null : 'Please confirm every mandatory guardrail.';
    }
    return isEmpty(value) ? 'This field is required.' : null;
  }

  function validateSection(section, answers) {
    const errors = {};
    (section.fields || []).forEach((field) => {
      if (!isFieldVisible(field, answers)) return;
      const message = validateField(field, answers[field.id]);
      if (message) errors[field.id] = message;
    });
    return errors;
  }

  function validateAll(sections, answers) {
    const errors = {};
    let hasErrors = false;
    sections.forEach((section) => {
      const sectionErrors = validateSection(section, answers);
      if (Object.keys(sectionErrors).length > 0) {
        errors[section.id] = sectionErrors;
        hasErrors = true;
      }
    });
    return { hasErrors, errors };
  }

  function csvEscape(value) {
    const str = value === undefined || value === null ? '' : String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  function toCSV(rows, columns) {
    const header = columns.map((c) => csvEscape(c.label)).join(',');
    const lines = rows.map((row) => columns.map((c) => csvEscape(row[c.id])).join(','));
    return [header, ...lines].join('\n');
  }

  function formatValue(field, value) {
    if (value === undefined || value === null || value === '') return '_(not answered)_';
    if (field.type === 'boolean') return value ? 'Yes' : 'No';
    if (field.type === 'multiselect' && Array.isArray(value)) return value.join(', ');
    return String(value);
  }

  function tableToMarkdown(field, rows) {
    const cols = field.columns;
    const header = `| ${cols.map((c) => c.label).join(' | ')} |`;
    const divider = `| ${cols.map(() => '---').join(' | ')} |`;
    const body = rows.map((row) => `| ${cols.map((c) => formatValue(c, row[c.id])).join(' | ')} |`);
    return [header, divider, ...body].join('\n');
  }

  function toMarkdown(sections, answers) {
    const lines = ['# WhatsApp AI Knowledge & Guardrails', ''];
    sections.forEach((section) => {
      lines.push(`## ${section.title}`, '');
      (section.fields || []).forEach((field) => {
        if (!isFieldVisible(field, answers)) return;
        const value = answers[field.id];
        if (field.type === 'table') {
          lines.push(`**${field.label}**`, '');
          lines.push(tableToMarkdown(field, value || field.rows || []), '');
        } else if (field.type === 'guardrail-list') {
          lines.push(`**${field.label}**`, '');
          (field.items || []).forEach((item, i) => {
            const confirmed = Array.isArray(value) && value[i] === true;
            lines.push(`- [${confirmed ? 'x' : ' '}] ${item}`);
          });
          lines.push('');
        } else {
          lines.push(`**${field.label}:** ${formatValue(field, value)}`, '');
        }
      });
    });
    return lines.join('\n');
  }

  function sectionAnswers(sections, sectionId, fieldId) {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return undefined;
    return section.fields.find((f) => f.id === fieldId);
  }

  function buildOutputs(sections, answers) {
    const byId = {};
    sections.forEach((s) => (byId[s.id] = s));

    const faqRows = answers.faqTable || [];
    const approvedFaq = faqRows.filter((r) => r.status === 'Approved');

    const plans = (answers.plansTable || []).filter((p) => p.active === true);

    const guardrailField = byId.guardrails.fields.find((f) => f.id === 'mandatoryGuardrails');
    const confirmedGuardrails = (guardrailField.items || []).filter(
      (_, i) => Array.isArray(answers.mandatoryGuardrails) && answers.mandatoryGuardrails[i] === true
    );
    const additionalGuardrails = (answers.additionalGuardrails || []).map((r) => r.rule).filter(Boolean);

    const escalationMatrix = answers.escalationTable || byId.escalation.fields[0].rows;
    const automationMatrix = (answers.automationsTable || byId.automations.fields[0].rows);
    const templates = (answers.approvedTemplates || []).map((r) => r.template).filter(Boolean);

    const systemInstructions = [
      `You are ${answers.assistantName || 'the gym assistant'}, the WhatsApp assistant for ${answers.gymName || 'the gym'}.`,
      answers.tone ? `Tone: ${answers.tone}.` : '',
      answers.responseLength ? `Keep responses ${answers.responseLength.toLowerCase()}.` : '',
      answers.greeting ? `Greeting: "${answers.greeting}"` : '',
      answers.selfIntroduction ? `When introducing yourself: ${answers.selfIntroduction}` : '',
      answers.uncertaintyResponse ? `When uncertain: ${answers.uncertaintyResponse}` : '',
      answers.handoffMessage ? `When handing off to a human: "${answers.handoffMessage}"` : '',
      'You must identify yourself as an automated assistant and never claim to be a trainer or gym employee.',
    ].filter(Boolean).join('\n');

    const missing = [];
    sections.forEach((section) => {
      const sectionErrors = validateSection(section, answers);
      Object.keys(sectionErrors).forEach((fieldId) => {
        const field = section.fields.find((f) => f.id === fieldId);
        missing.push(`${section.title} → ${field.label}`);
      });
    });
    if (plans.length === 0) missing.push('Membership Plans and Pricing → no active plan defined');
    if (approvedFaq.length === 0) missing.push('Common Customer Questions → no approved answers yet');

    const integrationDependencies = {
      fitgym: {
        version: answers.fitgymVersion,
        vendorContact: answers.fitgymVendorContact,
        apis: answers.fitgymApis,
        webhooks: answers.fitgymWebhooks,
        sandboxAccess: answers.fitgymSandbox,
        restrictions: answers.fitgymRestrictions,
        vendorApprovalRequired: answers.fitgymVendorApproval,
      },
      biometric: {
        deviceBrand: answers.deviceBrand,
        vendor: answers.attendanceVendor,
        integration: answers.attendanceIntegration,
        timing: answers.attendanceTiming,
        entryExitEvents: answers.entryExitEvents,
      },
    };

    return {
      ownerQuestionnaire: answers,
      approvedFaqKnowledgeBase: approvedFaq,
      membershipPlanData: plans,
      chatbotSystemInstructions: systemInstructions,
      guardrailRules: { mandatory: confirmedGuardrails, additional: additionalGuardrails },
      humanEscalationMatrix: escalationMatrix,
      attendanceAutomationMatrix: automationMatrix,
      whatsappTemplateList: templates,
      missingInformationReport: missing,
      technicalIntegrationDependencyList: integrationDependencies,
    };
  }

  const api = {
    isFieldVisible,
    validateField,
    validateSection,
    validateAll,
    toCSV,
    toMarkdown,
    buildOutputs,
    sectionAnswers,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.KnowledgeLogic = api;
  }
})(typeof window !== 'undefined' ? window : this);
