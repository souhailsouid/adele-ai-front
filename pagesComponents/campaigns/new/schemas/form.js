/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023Adele.ai(https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

const form = {
  formId: "new-campaign-form",
  formField: {
    // Step 1: Brand & Compliance
    senderName: {
      name: "senderName",
      label: "Sender Name",
      type: "text",
      errorMsg: "Sender name is required.",
    },
    senderTitle: {
      name: "senderTitle",
      label: "Sender Title",
      type: "text",
      errorMsg: "Sender title is required.",
    },
    companyLogo: {
      name: "companyLogo",
      label: "Company Logo",
      type: "file",
    },
    complianceMode: {
      name: "complianceMode",
      label: "Compliance Mode",
      type: "select",
      errorMsg: "Compliance mode is required.",
    },
    // Step 2: Campaign
    campaignName: {
      name: "campaignName",
      label: "Campaign Name",
      type: "text",
      errorMsg: "Campaign name is required.",
    },
    companyWebsite: {
      name: "companyWebsite",
      label: "Company Website",
      type: "url",
      errorMsg: "Company website is required.",
      invalidMsg: "Please enter a valid URL.",
    },
    companyInfo: {
      name: "companyInfo",
      label: "Your Company Info & Value Proposition",
      type: "textarea",
      errorMsg: "Company info is required.",
    },
    campaignObjective: {
      name: "campaignObjective",
      label: "Campaign Objective",
      type: "select",
      errorMsg: "Campaign objective is required.",
    },
    detailedObjective: {
      name: "detailedObjective",
      label: "Detailed Objective",
      type: "textarea",
      errorMsg: "Detailed objective is required.",
    },
    targetPersona: {
      name: "targetPersona",
      label: "Target Persona (ICP)",
      type: "textarea",
      errorMsg: "Target persona is required.",
    },
    personalizationFocus: {
      name: "personalizationFocus",
      label: "Personalization Focus (Optional)",
      type: "textarea",
    },
    language: {
      name: "language",
      label: "Language",
      type: "select",
      errorMsg: "Language is required.",
    },
    // Step 3: Contacts (placeholder for now)
    contacts: {
      name: "contacts",
      label: "Number of Contacts",
      type: "number",
      errorMsg: "Number of contacts is required.",
      invalidMsg: "Number of contacts must be greater than 0.",
    },
    // Step 4-6: Placeholders (to be defined later)
    studio: {
      name: "studio",
      label: "Studio",
      type: "text",
    },
    personalize: {
      name: "personalize",
      label: "Personalize",
      type: "text",
    },
    launch: {
      name: "launch",
      label: "Launch",
      type: "text",
    },
  },
};

export default form;

