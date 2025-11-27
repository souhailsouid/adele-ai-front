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

import checkout from "/pagesComponents/campaigns/new/schemas/form";

const {
  formField: {
    senderName,
    senderTitle,
    companyLogo,
    complianceMode,
    campaignName,
    companyWebsite,
    companyInfo,
    campaignObjective,
    detailedObjective,
    targetPersona,
    personalizationFocus,
    language,
    contacts,
    studio,
    personalize,
    launch,
  },
} = checkout;

const initialValues = {
  [senderName.name]: "",
  [senderTitle.name]: "",
  [companyLogo.name]: "",
  [complianceMode.name]: "",
  [campaignName.name]: "",
  [companyWebsite.name]: "",
  [companyInfo.name]: "",
  [campaignObjective.name]: "",
  [detailedObjective.name]: "",
  [targetPersona.name]: "",
  [personalizationFocus.name]: "",
  [language.name]: "",
  [contacts.name]: "",
  selectedContactsList: [],
  parsedContactsData: null,
  [studio.name]: "",
  studioActiveTab: 1, // Start with Structure tab
  videoStructure: null,
  videoStructureData: null,
  problemIllustration: null,
  solutionProductShot: null,
  socialProof: null,
  masterVideo: null,
  videoScript: null,
  [personalize.name]: "",
  [launch.name]: "",
};

export default initialValues;

