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

import * as Yup from "yup";
import checkout from "/pagesComponents/campaigns/new/schemas/form";

const {
  formField: {
    senderName,
    senderTitle,
    complianceMode,
    campaignName,
    companyWebsite,
    companyInfo,
    campaignObjective,
    detailedObjective,
    targetPersona,
    language,
    contacts,
  },
} = checkout;

const validations = [
  // Step 1: Brand & Compliance
  Yup.object().shape({
    [senderName.name]: Yup.string().required(senderName.errorMsg),
    [senderTitle.name]: Yup.string().required(senderTitle.errorMsg),
    [complianceMode.name]: Yup.string().required(complianceMode.errorMsg),
  }),
  // Step 2: Campaign
  Yup.object().shape({
    [campaignName.name]: Yup.string().required(campaignName.errorMsg),
    [companyWebsite.name]: Yup.string()
      .required(companyWebsite.errorMsg)
      .url(companyWebsite.invalidMsg),
    [companyInfo.name]: Yup.string().required(companyInfo.errorMsg),
    [campaignObjective.name]: Yup.string().required(campaignObjective.errorMsg),
    [detailedObjective.name]: Yup.string().required(detailedObjective.errorMsg),
    [targetPersona.name]: Yup.string().required(targetPersona.errorMsg),
    [language.name]: Yup.string().required(language.errorMsg),
  }),
  // Step 3: Contacts
  Yup.object().shape({
    [contacts.name]: Yup.number()
      .required(contacts.errorMsg)
      .min(1, contacts.invalidMsg)
      .integer("Number of contacts must be an integer"),
  }),
  // Step 4-6: Placeholders (no validation for now)
  Yup.object().shape({}),
  Yup.object().shape({}),
  Yup.object().shape({}),
];

export default validations;

